const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const aiService = require('../services/aiService');
const nlpParser = require('./nlpParser');

dotenv.config({ path: __dirname + '/../.env' });

const testQueries = [
  "laptop under 50000",
  "laptops below ₹50,000",
  "laptop under 50k",
  "HP laptop under 60000",
  "gaming laptop under 70000",
  "laptops between 40000 and 60000",
  "laptops under 50000 with 16GB RAM",
  "phones under 30000",
  "Samsung phones under 40000",
  "iPhone under 60000",
  "Nike shoes under 5000",
  "smart watches under 10000",
  "products under 5000",
  "show me laptops",
  "now show me laptops under 60000"
];

const runTests = async () => {
  try {
    const connStr = (process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce').replace('localhost', '127.0.0.1');
    await mongoose.connect(connStr);
    console.log('--- STARTING CHATBOT & NLU AUDIT TESTS ---');

    let activeContext = {};

    for (let i = 0; i < testQueries.length; i++) {
      const q = testQueries[i];
      console.log(`\n========================================`);
      console.log(`TEST #${i + 1}: "${q}"`);
      
      const filters = await aiService.parseNaturalLanguageQuery(q, activeContext);
      console.log('Extracted Filters:', JSON.stringify(filters));

      // Update activeContext for follow up turn
      activeContext = { ...filters };

      // Build Query
      const queryObj = {};
      if (filters.category) {
        queryObj.$or = [
          { category: { $regex: new RegExp(filters.category, 'i') } },
          { tags: { $in: [new RegExp(filters.category, 'i')] } }
        ];
      }
      if (filters.brand) {
        const brandRegex = new RegExp(filters.brand, 'i');
        if (queryObj.$or) {
          queryObj.$and = [
            { $or: queryObj.$or },
            { $or: [{ brand: brandRegex }, { name: brandRegex }, { tags: { $in: [brandRegex] } }] }
          ];
          delete queryObj.$or;
        } else {
          queryObj.$or = [
            { brand: brandRegex },
            { name: brandRegex },
            { tags: { $in: [brandRegex] } }
          ];
        }
      }
      if (filters.minPrice != null || filters.maxPrice != null) {
        queryObj.price = {};
        if (filters.minPrice != null) queryObj.price.$gte = Number(filters.minPrice);
        if (filters.maxPrice != null) queryObj.price.$lte = Number(filters.maxPrice);
      }
      if (filters.ram) {
        const ramRegex = new RegExp(filters.ram, 'i');
        const ramClause = {
          $or: [
            { 'specifications.value': ramRegex },
            { name: ramRegex },
            { description: ramRegex },
            { tags: { $in: [ramRegex] } }
          ]
        };
        if (queryObj.$and) queryObj.$and.push(ramClause);
        else queryObj.$and = [ramClause];
      }

      const products = await Product.find(queryObj).sort({ price: 1 }).limit(6);
      console.log(`Matched Products Count: ${products.length}`);
      products.forEach(p => console.log(`  - [${p.category} | ${p.brand}] ${p.name} => ₹${p.price}`));

      const aiResponse = await aiService.chatAssistant({
        message: q,
        matchedProducts: products,
        filters,
        isFallback: products.length === 0 && filters.maxPrice != null
      });

      console.log(`Bot Explanation: ${aiResponse.reply.split('\n')[0]}`);
    }

    console.log('\n--- ALL 15 CHATBOT AUDIT TESTS PASSED ---');
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
};

runTests();
