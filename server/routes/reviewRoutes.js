const express = require('express');
const { addReview, getProductReviews, getAIReviewSummary } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/ai-summary', getAIReviewSummary);
router.post('/', protect, addReview);

module.exports = router;
