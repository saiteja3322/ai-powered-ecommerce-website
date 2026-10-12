const express = require('express');
const {
  getProducts,
  getSearchSuggestions,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  generateAIDescription,
  getCategories
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/suggestions', getSearchSuggestions);
router.post('/generate-ai-description', protect, authorize('admin'), generateAIDescription);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
