const express = require('express');
const { validateCoupon, getCoupons, createCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/validate', validateCoupon);

router.use(protect, authorize('admin'));
router.get('/', getCoupons);
router.post('/', createCoupon);

module.exports = router;
