const Review = require('../models/Review');
const Product = require('../models/Product');
const aiService = require('../services/aiService');

// @desc Add a review for a product
// @route POST /api/v1/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      title,
      comment
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc Get reviews for a product
// @route GET /api/v1/reviews/product/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc Get AI Summary of customer reviews for a product
// @route GET /api/v1/reviews/product/:productId/ai-summary
exports.getAIReviewSummary = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    const productName = product ? product.name : 'Product';

    const summary = await aiService.summarizeReviews(reviews, productName);
    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};
