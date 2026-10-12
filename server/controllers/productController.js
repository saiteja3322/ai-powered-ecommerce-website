const Product = require('../models/Product');
const Category = require('../models/Category');
const aiService = require('../services/aiService');
const { rankProducts, normalizeText } = require('../utils/searchNormalization');
const { getCategoryRegexPatterns, normalizeCategoryName } = require('../utils/categoryMapping');

// @desc Get all products with advanced multi-facet search, filter, sort & pagination
// @route GET /api/v1/products
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 1000;

    const { category, brand, search, minPrice, maxPrice, rating, inStock, discount, sort, featured, trending, flashSale } = req.query;

    let queryObj = {};

    if (category && category.trim() !== '') {
      const cleanCat = category.trim();
      const patterns = getCategoryRegexPatterns(cleanCat);
      const regexList = patterns.map(p => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      queryObj.$or = [
        { category: { $in: regexList } },
        { subcategory: { $in: regexList } }
      ];
    }

    if (brand && brand.trim() !== '') {
      const cleanBrand = brand.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      queryObj.brand = { $regex: new RegExp(cleanBrand, 'i') };
    }

    const parsedMin = parseFloat(minPrice);
    const parsedMax = parseFloat(maxPrice);
    if (!isNaN(parsedMin) || !isNaN(parsedMax)) {
      queryObj.price = {};
      if (!isNaN(parsedMin)) queryObj.price.$gte = parsedMin;
      if (!isNaN(parsedMax)) queryObj.price.$lte = parsedMax;
    }

    const parsedRating = parseFloat(rating);
    if (!isNaN(parsedRating)) {
      queryObj.ratings = { $gte: parsedRating };
    }

    const parsedMinDiscount = parseFloat(req.query.minDiscount || (discount !== 'true' && discount !== 'false' ? discount : ''));
    if (!isNaN(parsedMinDiscount) && parsedMinDiscount > 0) {
      queryObj.discountPercent = { $gte: parsedMinDiscount };
    } else if (discount === 'true') {
      queryObj.discountPercent = { $gt: 0 };
    }

    if (featured === 'true') queryObj.isFeatured = true;
    if (trending === 'true') queryObj.isTrending = true;
    if (flashSale === 'true') queryObj.isFlashSale = true;

    // Fetch candidate products matching basic filters
    let candidateProducts = await Product.find(queryObj);

    if (!isNaN(parsedMinDiscount) && parsedMinDiscount > 0) {
      candidateProducts = candidateProducts.filter(p => {
        const disc = (p.discountPercent != null && p.discountPercent > 0)
          ? p.discountPercent
          : (p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);
        return disc >= parsedMinDiscount;
      });
    }

    // Perform relevance-ranked fuzzy search if search query exists
    if (search && search.trim() !== '') {
      let searchMatched = rankProducts(candidateProducts, search);

      // Relax strict category/brand constraints if direct category filter produced 0 search matches
      if (searchMatched.length === 0 && (queryObj.category || queryObj.brand)) {
        const relaxedQuery = { ...queryObj };
        delete relaxedQuery.category;
        delete relaxedQuery.brand;
        const allCandidates = await Product.find(relaxedQuery);
        searchMatched = rankProducts(allCandidates, search);
      }

      candidateProducts = searchMatched;

      // Apply sort if explicitly requested by user (otherwise keep relevance order)
      if (sort === 'price-asc') {
        candidateProducts.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        candidateProducts.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        candidateProducts.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
      } else if (sort === 'discount') {
        candidateProducts.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
      }
    } else {
      // Default sort when no search term
      if (sort === 'price-asc') {
        candidateProducts.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        candidateProducts.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        candidateProducts.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
      } else if (sort === 'discount') {
        candidateProducts.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
      } else {
        candidateProducts.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
      }
    }

    const total = candidateProducts.length;
    const skip = (page - 1) * limit;
    const paginatedProducts = candidateProducts.slice(skip, skip + limit);

    console.log(`[Product API] Category: "${category || ''}", Search: "${search || ''}", Brand: "${brand || ''}", MaxPrice: ${maxPrice || 'none'} -> Total Matched Products: ${total}`);

    res.status(200).json({
      success: true,
      count: paginatedProducts.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      products: paginatedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get search autocomplete suggestions
// @route GET /api/v1/products/suggestions
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const allProducts = await Product.find().select('name brand category subcategory tags thumbnail price');
    const ranked = rankProducts(allProducts, q);

    const productSuggestions = ranked.slice(0, 5).map(p => ({
      type: 'product',
      id: p._id,
      text: p.name,
      category: p.category,
      brand: p.brand,
      thumbnail: p.thumbnail,
      price: p.price
    }));

    const normQ = normalizeText(q);
    const categorySuggestions = Array.from(
      new Set(
        allProducts
          .map(p => p.category)
          .filter(c => c && normalizeText(c).includes(normQ))
      )
    ).slice(0, 3).map(c => ({ type: 'category', text: c }));

    const brandSuggestions = Array.from(
      new Set(
        allProducts
          .map(p => p.brand)
          .filter(b => b && normalizeText(b).includes(normQ))
      )
    ).slice(0, 3).map(b => ({ type: 'brand', text: b }));

    res.status(200).json({
      success: true,
      suggestions: [...categorySuggestions, ...brandSuggestions, ...productSuggestions]
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single product details
// @route GET /api/v1/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc Create new product (Admin)
// @route POST /api/v1/products
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    if (!productData.sku || productData.sku.trim() === '') {
      const prefix = (productData.brand || 'PRD').substring(0, 3).toUpperCase();
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      productData.sku = `${prefix}-${Date.now().toString().slice(-4)}-${randomStr}`;
    }

    if ((!productData.thumbnail || productData.thumbnail.trim() === '') && Array.isArray(productData.images) && productData.images.length > 0) {
      productData.thumbnail = productData.images[0];
    }

    if (!productData.thumbnail) {
      productData.thumbnail = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
    }

    if (productData.originalPrice && productData.originalPrice > productData.price) {
      productData.discountPercent = Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100);
    } else if (productData.discountPercent > 0 && !productData.originalPrice) {
      productData.originalPrice = Math.round(productData.price / (1 - productData.discountPercent / 100));
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc Update product (Admin)
// @route PUT /api/v1/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updateData = { ...req.body };

    if ((!updateData.thumbnail || updateData.thumbnail.trim() === '') && Array.isArray(updateData.images) && updateData.images.length > 0) {
      updateData.thumbnail = updateData.images[0];
    }

    if (updateData.originalPrice && updateData.originalPrice > updateData.price) {
      updateData.discountPercent = Math.round(((updateData.originalPrice - updateData.price) / updateData.originalPrice) * 100);
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc Delete product (Admin)
// @route DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc Generate AI Product Description for Admin Creation
// @route POST /api/v1/products/generate-ai-description
exports.generateAIDescription = async (req, res, next) => {
  try {
    const { name, category, brand, keyFeatures } = req.body;
    const aiData = await aiService.generateProductDescription({ name, category, brand, keyFeatures });
    res.status(200).json({ success: true, data: aiData });
  } catch (error) {
    next(error);
  }
};

// @desc Get Categories list
// @route GET /api/v1/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};
