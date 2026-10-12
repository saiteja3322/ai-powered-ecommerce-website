const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { getProducts } = require('../controllers/productController');

async function testApi() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  await mongoose.connect(uri);

  const req = {
    query: {
      category: 'Electronics'
    }
  };

  let jsonResult = null;
  let statusCode = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResult = data;
      return res;
    }
  };

  const next = (err) => {
    console.error("Controller error:", err);
  };

  await getProducts(req, res, next);

  console.log("Status Code:", statusCode);
  console.log("Success:", jsonResult?.success);
  console.log("Count:", jsonResult?.count);
  console.log("Total:", jsonResult?.total);
  if (jsonResult?.products) {
    console.log("Returned Product Sample Categories:");
    const cats = jsonResult.products.map(p => `${p.name} (cat: ${p.category}, sub: ${p.subcategory})`);
    console.log(cats.slice(0, 10));
  }

  await mongoose.disconnect();
}

testApi().catch(console.error);
