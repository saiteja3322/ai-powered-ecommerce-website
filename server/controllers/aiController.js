const aiService = require('../services/aiService');
const Product = require('../models/Product');
const { rankProducts } = require('../utils/searchNormalization');
const { getCategoryRegexPatterns, normalizeCategoryName } = require('../utils/categoryMapping');

/**
 * Strict Validation Layer: Ensures retrieved database product strictly satisfies all user constraints.
 */
/**
 * Strict Validation Layer: Ensures retrieved database product strictly satisfies all user constraints.
 */
function validateProductConstraints(product, filters) {
  // 1. Strict Subcategory / Category Verification
  if (filters.subcategory || filters.category) {
    const target = (filters.subcategory || filters.category).toLowerCase();
    const patterns = getCategoryRegexPatterns(target);
    const prodCat = (product.category || '').toLowerCase();
    const prodSub = (product.subcategory || '').toLowerCase();
    const prodName = (product.name || '').toLowerCase();

    const matches = patterns.some(p => prodCat.includes(p) || prodSub.includes(p) || prodName.includes(p));
    if (!matches) return false;
  }

  // 2. Strict Maximum Price Verification (HARD CONSTRAINT)
  if (filters.maxPrice != null && Number(product.price) > Number(filters.maxPrice)) {
    return false;
  }

  // 3. Strict Minimum Price Verification
  if (filters.minPrice != null && Number(product.price) < Number(filters.minPrice)) {
    return false;
  }

  // 4. Strict Brand Verification
  if (filters.brand) {
    const prodBrand = (product.brand || '').toLowerCase();
    const targetBrand = filters.brand.toLowerCase();
    const name = (product.name || '').toLowerCase();
    if (!prodBrand.includes(targetBrand) && !name.includes(targetBrand)) {
      return false;
    }
  }

  // 5. Strict RAM Verification
  if (filters.ram) {
    const targetRam = filters.ram.toLowerCase().replace(/\s+/g, '');
    const specsStr = JSON.stringify(product.specifications || {}).toLowerCase();
    const nameDesc = `${product.name} ${product.shortDescription || ''} ${product.description || ''}`.toLowerCase();
    if (!specsStr.includes(targetRam) && !nameDesc.includes(targetRam)) {
      return false;
    }
  }

  // 6. Strict GPU Verification
  if (filters.gpu) {
    const targetGpu = filters.gpu.toLowerCase().replace(/\s+/g, '');
    const text = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${JSON.stringify(product.specifications || [])}`.toLowerCase().replace(/\s+/g, '');
    if (!text.includes(targetGpu)) return false;
  }

  // 7. Strict CPU Verification
  if (filters.cpu) {
    const targetCpu = filters.cpu.toLowerCase().replace(/\s+/g, '');
    const text = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${JSON.stringify(product.specifications || [])}`.toLowerCase().replace(/\s+/g, '');
    const simplified = targetCpu.replace('intelcore', '').replace('intel', '').replace('amd', '');
    if (!text.includes(simplified)) return false;
  }

  // 8. Strict Refresh Rate Verification
  if (filters.refreshRate) {
    const targetHz = filters.refreshRate.toLowerCase().replace(/\s+/g, '');
    const text = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${JSON.stringify(product.specifications || [])}`.toLowerCase().replace(/\s+/g, '');
    if (!text.includes(targetHz)) return false;
  }

  return true;
}

/**
 * Calculates a specification-based score for gaming laptops:
 * GPU performance > CPU performance > Refresh rate > RAM > Storage > Rating
 */
function calculateGamingLaptopScore(product) {
  const text = `${product.name} ${product.shortDescription || ''} ${product.description || ''} ${JSON.stringify(product.specifications || [])}`.toLowerCase();

  let score = 0;

  // GPU Tiers
  if (text.includes('rtx 4090')) score += 9000;
  else if (text.includes('rtx 4080')) score += 8000;
  else if (text.includes('rtx 4070')) score += 7000;
  else if (text.includes('rtx 4060')) score += 6000;
  else if (text.includes('rtx 4050')) score += 5000;
  else if (text.includes('rtx 3050')) score += 3000;
  else if (text.includes('rtx 2050') || text.includes('rx 6500m') || text.includes('gtx 1650')) score += 2000;

  // CPU Tiers
  if (text.includes('i9') || text.includes('ryzen 9') || text.includes('ultra 9')) score += 900;
  else if (text.includes('i7') || text.includes('ryzen 7') || text.includes('ultra 7')) score += 700;
  else if (text.includes('i5') || text.includes('ryzen 5') || text.includes('ultra 5')) score += 500;
  else if (text.includes('i3') || text.includes('ryzen 3')) score += 300;

  // Refresh Rate Tiers
  if (text.includes('240hz')) score += 240;
  else if (text.includes('165hz')) score += 165;
  else if (text.includes('144hz')) score += 144;
  else if (text.includes('120hz')) score += 120;

  // RAM Tiers
  if (text.includes('32gb')) score += 320;
  else if (text.includes('16gb')) score += 160;
  else if (text.includes('8gb')) score += 80;

  // Storage Tiers
  if (text.includes('1tb')) score += 100;
  else if (text.includes('512gb')) score += 50;

  // Customer Rating & Badges
  score += (product.ratings || 0) * 50;
  if (product.isBestSeller) score += 50;
  if (product.isFeatured) score += 30;

  return score;
}

// @desc Chat with Floating AI Shopping Assistant
// @route POST /api/v1/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message, activeFilters } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // 1. Extract structured query parameters & merge multi-turn conversation context
    const filters = await aiService.parseNaturalLanguageQuery(message, activeFilters || {});

    let products = [];

    // Check if query contains product search intent
    const hasSearchIntent = Boolean(
      filters.category ||
      filters.subcategory ||
      filters.brand ||
      filters.maxPrice != null ||
      filters.minPrice != null ||
      filters.ram ||
      filters.storage ||
      filters.processor ||
      filters.gpu ||
      filters.cpu ||
      filters.refreshRate ||
      (filters.keywords && filters.keywords.length > 0) ||
      /product|item|show|need|want|find|search|buy|cheap|best|laptop|phone|shoe|watch|mobile|headphone|furniture|appliance/i.test(message)
    );

    if (hasSearchIntent) {
      // 2. Build trusted MongoDB query
      const queryObj = {};

      const categoryTarget = filters.subcategory || filters.category;
      if (categoryTarget) {
        const patterns = getCategoryRegexPatterns(categoryTarget);
        const regexList = patterns.map(p => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
        queryObj.$or = [
          { category: { $in: regexList } },
          { subcategory: { $in: regexList } },
          { name: { $in: regexList } }
        ];
      }

      if (filters.brand) {
        const brandRegex = new RegExp(filters.brand, 'i');
        const brandClause = { $or: [{ brand: brandRegex }, { name: brandRegex }] };
        if (queryObj.$or) {
          queryObj.$and = [{ $or: queryObj.$or }, brandClause];
          delete queryObj.$or;
        } else {
          queryObj.$or = brandClause.$or;
        }
      }

      // Hard Price Limits (STRICT, NEVER DROPPED)
      if (filters.minPrice != null || filters.maxPrice != null) {
        queryObj.price = {};
        if (filters.minPrice != null) queryObj.price.$gte = Number(filters.minPrice);
        if (filters.maxPrice != null) queryObj.price.$lte = Number(filters.maxPrice);
      }

      if (filters.rating != null) {
        queryObj.ratings = { $gte: Number(filters.rating) };
      }

      let sortOptions = { ratings: -1, isBestSeller: -1, price: 1 };
      if (filters.sort === 'price-asc') sortOptions = { price: 1 };
      else if (filters.sort === 'price-desc') sortOptions = { price: -1 };
      else if (filters.sort === 'rating') sortOptions = { ratings: -1 };

      // Query Database
      const dbProducts = await Product.find(queryObj).sort(sortOptions);

      // 3. SECOND VALIDATION LAYER: Verify every product satisfies hard constraints
      products = dbProducts.filter(p => validateProductConstraints(p, filters));

      // 4. Relevance & Spec Ranking over strictly matched products
      const isGamingLaptopQuery = Boolean(
        filters.subcategory === 'Gaming Laptops' ||
        (filters.category === 'Laptops' && /gaming|rtx|gtx|gpu|graphics/i.test(message))
      );

      if (products.length > 0) {
        if (filters.sort === 'price-asc') {
          products.sort((a, b) => a.price - b.price);
        } else if (isGamingLaptopQuery || filters.intent === 'PRODUCT_RECOMMENDATION' || filters.sort === 'gpu-tier') {
          products.sort((a, b) => calculateGamingLaptopScore(b) - calculateGamingLaptopScore(a));
        } else if (message) {
          products = rankProducts(products, message);
        }
      }
    }

    console.log(`[AI Chat] Query: "${message}", Filters: ${JSON.stringify(filters)} -> Matched DB Products: ${products.length}`);

    // 5. Generate AI response narrative grounded strictly in verified products
    const aiResult = await aiService.chatAssistant({
      message,
      matchedProducts: products,
      filters
    });

    res.status(200).json({
      success: true,
      reply: aiResult.reply,
      products: products.slice(0, 6),
      activeFilters: filters
    });
  } catch (error) {
    next(error);
  }
};

// @desc Parse Natural Language Search Query
// @route POST /api/v1/ai/smart-search
exports.smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

    const parsedParams = await aiService.parseNaturalLanguageQuery(query);
    res.status(200).json({ success: true, parsedParams });
  } catch (error) {
    next(error);
  }
};

// @desc Compare multiple products with AI matrix
// @route POST /api/v1/ai/compare
exports.compareProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Product IDs array is required' });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    const comparison = await aiService.generateComparison(products);
    res.status(200).json({ success: true, comparison, products });
  } catch (error) {
    next(error);
  }
};

// @desc Get Personalized Recommendations
// @route POST /api/v1/ai/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const { category } = req.body;
    const products = await Product.find();

    let recommended = products.filter(p => p.isFeatured || p.isTrending);
    if (category) {
      const catMatch = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      if (catMatch.length > 0) recommended = catMatch;
    }

    res.status(200).json({
      success: true,
      recommendations: recommended.slice(0, 4)
    });
  } catch (error) {
    next(error);
  }
};
