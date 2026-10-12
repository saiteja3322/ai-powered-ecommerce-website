const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { getCategoryRegexPatterns, matchesCategoryFilter } = require('./categoryMapping');
const Product = require('../models/Product');

async function testElectronicsFilter() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  await mongoose.connect(uri);

  console.log('--- TESTING BACKEND QUERY FOR "Electronics" ---');
  const patterns = getCategoryRegexPatterns('Electronics');
  console.log('Patterns for Electronics:', patterns);
  const regexList = patterns.map(p => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  
  const queryObj = {
    $or: [
      { category: { $in: regexList } },
      { subcategory: { $in: regexList } }
    ]
  };

  const backendProducts = await Product.find(queryObj);
  console.log(`Backend Products Returned for Electronics: ${backendProducts.length}`);

  console.log('\n--- TESTING FRONTEND SECONDARY FILTERING IN ShopPage.jsx ---');
  const frontendFiltered = backendProducts.filter(product => {
    const matches = matchesCategoryFilter(
      product.category || product.mainCategory || product.subCategory || '',
      product.subcategory,
      'Electronics'
    );
    return matches;
  });

  console.log(`Frontend Filtered Products for Electronics: ${frontendFiltered.length}`);

  if (backendProducts.length > 0 && frontendFiltered.length === 0) {
    console.error('🔴 BUG CONFIRMED: Backend returned products, but Frontend matchesCategoryFilter dropped ALL of them!');
  } else if (backendProducts.length === 0) {
    console.error('🔴 BUG CONFIRMED: Backend query returned 0 products for Electronics!');
  } else {
    console.log('✅ Both Backend & Frontend match properly!');
  }

  await mongoose.disconnect();
}

testElectronicsFilter().catch(err => {
  console.error(err);
  process.exit(1);
});
