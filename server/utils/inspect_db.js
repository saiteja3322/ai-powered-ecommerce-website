const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { sampleProducts } = require('./seedData');

async function inspectData() {
  console.log("=== SEED DATA PRODUCT CATEGORIES & SUBCATEGORIES ===");
  const catMap = {};
  sampleProducts.forEach((p, idx) => {
    const key = `category: "${p.category}", subcategory: "${p.subcategory}"`;
    if (!catMap[key]) catMap[key] = [];
    catMap[key].push({ id: p._id, name: p.name, brand: p.brand, price: p.price });
  });

  for (const [catSub, list] of Object.entries(catMap)) {
    console.log(`\nGroup [${catSub}] (Count: ${list.length}):`);
    list.slice(0, 3).forEach(item => {
      console.log(`  - [${item.brand}] ${item.name} (₹${item.price})`);
    });
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("\n=== DATABASE ACTUAL PRODUCT CATEGORIES & SUBCATEGORIES ===");
    const dbProducts = await Product.find({});
    console.log(`Total Products in Database: ${dbProducts.length}`);
    const dbCatMap = {};
    dbProducts.forEach(p => {
      const key = `category: "${p.category}", subcategory: "${p.subcategory}"`;
      if (!dbCatMap[key]) dbCatMap[key] = [];
      dbCatMap[key].push({ id: p._id, name: p.name, brand: p.brand, price: p.price });
    });
    for (const [catSub, list] of Object.entries(dbCatMap)) {
      console.log(`\nDB Group [${catSub}] (Count: ${list.length}):`);
      list.slice(0, 3).forEach(item => {
        console.log(`  - [${item.brand}] ${item.name} (₹${item.price})`);
      });
    }
    await mongoose.disconnect();
  } catch (err) {
    console.log("Could not connect to live DB (might not be running or timeout):", err.message);
  }
}

inspectData();
