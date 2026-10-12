const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountAmount: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', CouponSchema);
