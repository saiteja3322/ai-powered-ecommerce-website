const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);

router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
