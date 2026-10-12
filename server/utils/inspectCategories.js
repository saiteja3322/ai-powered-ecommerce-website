const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

async function inspectCategories() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  await mongoose.connect(uri);

  const categories = await Product.distinct('category');
  const subcategories = await Product.distinct('subcategory');

  console.log('Distinct Categories in DB:', categories);
  console.log('Distinct Subcategories in DB:', subcategories);

  const elecProds = await Product.find({ category: 'Electronics' });
  console.log('Products with category === "Electronics":', elecProds.length);

  const allElecProds = await Product.find({
    $or: [
      { category: 'Electronics' },
      { category: 'Mobiles' },
      { category: 'Laptops' },
      { category: 'Headphones' },
      { category: 'Smartwatches' }
    ]
  });
  console.log('Products with tech categories:', allElecProds.length);

  await mongoose.disconnect();
}

inspectCategories().catch(console.error);
