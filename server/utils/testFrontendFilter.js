const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { matchesCategoryFilter: clientMatches } = require('../../client/src/utils/categoryMapping');

async function testFrontendFilterOnApiProducts() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  await mongoose.connect(uri);

  const { getCategoryRegexPatterns } = require('../utils/categoryMapping');
  const patterns = getCategoryRegexPatterns('Electronics');
  const regexList = patterns.map(p => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  const queryObj = {
    $or: [
      { category: { $in: regexList } },
      { subcategory: { $in: regexList } }
    ]
  };

  const dbProducts = await Product.find(queryObj);
  console.log(`Backend returned ${dbProducts.length} products for Electronics`);

  let passed = 0;
  let failed = 0;

  dbProducts.forEach(p => {
    const pCat = p.category || p.mainCategory || p.subCategory || '';
    const pSub = p.subcategory || '';
    const match = clientMatches(pCat, pSub, 'Electronics');
    if (match) {
      passed++;
    } else {
      failed++;
      console.log(`❌ FAILED FRONTEND MATCH: Name: "${p.name}", Category: "${pCat}", Subcategory: "${pSub}"`);
    }
  });

  console.log(`Client matchesCategoryFilter summary: Passed=${passed}, Failed=${failed}`);
  await mongoose.disconnect();
}

testFrontendFilterOnApiProducts().catch(console.error);
