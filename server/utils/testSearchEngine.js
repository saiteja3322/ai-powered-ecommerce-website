const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const { rankProducts, expandQuery } = require('./searchNormalization');

const { getCategoryRegexPatterns, matchesCategoryFilter } = require('./categoryMapping');

const CATEGORY_TESTS = [
  'Fashion',
  "Men's Fashion",
  "Women's Fashion",
  'Electronics',
  'Laptops',
  'Smartphones',
  'Furniture'
];

async function runTests() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  await mongoose.connect(uri);

  console.log('====================================================');
  console.log('🚀 RUNNING CATEGORY FILTER VERIFICATION');
  console.log('====================================================\n');

  for (const catName of CATEGORY_TESTS) {
    const patterns = getCategoryRegexPatterns(catName);
    const regexList = patterns.map(p => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

    const dbProducts = await Product.find({
      $or: [
        { category: { $in: regexList } },
        { subcategory: { $in: regexList } }
      ]
    });

    const filtered = dbProducts.filter(p => matchesCategoryFilter(p.category, p.subcategory, catName));

    console.log(`🏷️  Category Click: "${catName}"`);
    console.log(`   Direct Patterns: [${patterns.slice(0, 5).join(', ')}${patterns.length > 5 ? '...' : ''}]`);
    console.log(`   DB Products Returned: ${filtered.length}`);
    filtered.forEach((p, idx) => {
      console.log(`     ${idx + 1}. [${p.brand}] ${p.name} | Category: ${p.category} | Subcategory: ${p.subcategory}`);
    });
    console.log('----------------------------------------------------');
  }

  await mongoose.disconnect();
  console.log('\n✅ ALL CATEGORY VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
