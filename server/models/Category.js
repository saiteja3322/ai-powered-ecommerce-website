const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: 'package' },
  image: { type: String },
  description: { type: String },
  itemCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', CategorySchema);
