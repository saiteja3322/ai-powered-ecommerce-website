const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  discountPercent: { type: Number, default: 0 },
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  stock: { type: Number, required: true, default: 10 },
  images: [{ type: String }],
  thumbnail: { type: String, required: true },
  ratings: { type: Number, default: 4.5 },
  numOfReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  tags: [{ type: String }],
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  aiSummary: {
    pros: [{ type: String }],
    cons: [{ type: String }],
    verdict: { type: String }
  },
  subcategory: { type: String, trim: true, default: 'General' },
  sku: { type: String, trim: true, index: true },
  features: [{ type: String }],
  availableColors: [{ type: String }],
  availableSizes: [{ type: String }],
  warranty: { type: String, default: '1 Year Brand Warranty' },
  returnPolicy: { type: String, default: '7 Days Replacement Policy' },
  deliveryInfo: { type: String, default: 'Free Express Delivery in 2-4 business days' },
  createdAt: { type: Date, default: Date.now }
});

ProductSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  category: 'text', 
  subcategory: 'text', 
  tags: 'text',
  sku: 'text' 
});

ProductSchema.index({ category: 1, brand: 1, price: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ ratings: -1 });

module.exports = mongoose.model('Product', ProductSchema);

