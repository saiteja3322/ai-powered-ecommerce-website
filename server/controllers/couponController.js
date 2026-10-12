const Coupon = require('../models/Coupon');

// @desc Validate coupon code
// @route POST /api/v1/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Please enter a coupon code' });

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart total of $${coupon.minPurchase} required to apply this coupon.`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountAmount) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountAmount;
    }

    res.status(200).json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountAmount,
      discountAmount: Math.min(discountAmount, cartTotal)
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all coupons (Admin)
// @route GET /api/v1/coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc Create coupon (Admin)
// @route POST /api/v1/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};
