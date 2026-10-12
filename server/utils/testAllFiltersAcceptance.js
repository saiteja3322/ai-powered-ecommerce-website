const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { matchesCategoryFilter, PARENT_CATEGORIES, SUBCATEGORIES } = require('./categoryMapping');
const { getProducts } = require('../controllers/productController');

async function runAcceptanceTests() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_ecommerce';
  await mongoose.connect(uri);

  console.log("==================================================");
  console.log("           CATEGORIES & FILTERS ACCEPTANCE TESTS  ");
  console.log("==================================================");

  async function mockApiCall(queryParams) {
    let jsonResult = null;
    let statusCode = null;
    const req = { query: queryParams };
    const res = {
      status: (c) => { statusCode = c; return res; },
      json: (d) => { jsonResult = d; return res; }
    };
    await getProducts(req, res, (err) => console.error(err));
    
    // Perform secondary frontend filter check to simulate ShopPage.jsx
    const frontendProducts = (jsonResult?.products || []).filter(p => {
      if (queryParams.category) {
        const matchCat = matchesCategoryFilter(p.category, p.subcategory, queryParams.category);
        if (!matchCat) return false;
      }
      if (queryParams.maxPrice) {
        if (Number(p.price) > Number(queryParams.maxPrice)) return false;
      }
      if (queryParams.minDiscount) {
        const prodDisc = Number(p.discountPercent ?? (p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0));
        if (prodDisc < Number(queryParams.minDiscount)) return false;
      }
      return true;
    });

    return {
      status: statusCode,
      count: frontendProducts.length,
      products: frontendProducts
    };
  }

  // Test 1: Electronics Filter
  const electronics = await mockApiCall({ category: 'Electronics' });
  const test1 = electronics.count > 0 && electronics.products.every(p => matchesCategoryFilter(p.category, p.subcategory, 'Electronics'));
  console.log(`1. Electronics Filter: ${test1 ? 'PASS' : 'FAIL'} (Count: ${electronics.count})`);

  // Test 2: Laptops Filter
  const laptops = await mockApiCall({ category: 'Laptops' });
  const test2 = laptops.count > 0 && laptops.products.every(p => (p.category === 'Laptops' || p.subcategory === 'Laptops' || p.subcategory === 'Gaming Laptops'));
  console.log(`2. Laptops Filter: ${test2 ? 'PASS' : 'FAIL'} (Count: ${laptops.count})`);

  // Test 3: Smartphones / Mobiles Filter
  const mobiles = await mockApiCall({ category: 'Mobiles' });
  const test3 = mobiles.count > 0 && mobiles.products.every(p => (p.category === 'Mobiles' || p.subcategory === 'Smartphones'));
  console.log(`3. Smartphones Filter: ${test3 ? 'PASS' : 'FAIL'} (Count: ${mobiles.count})`);

  // Test 4: Furniture Filter
  const furniture = await mockApiCall({ category: 'Furniture' });
  const test4 = furniture.count > 0 && furniture.products.every(p => (p.category === 'Furniture' || p.subcategory === 'Furniture'));
  console.log(`4. Furniture Filter: ${test4 ? 'PASS' : 'FAIL'} (Count: ${furniture.count})`);

  // Test 5: Fashion Filter
  const fashion = await mockApiCall({ category: 'Fashion' });
  const test5 = fashion.count > 0 && fashion.products.every(p => matchesCategoryFilter(p.category, p.subcategory, 'Fashion'));
  console.log(`5. Fashion Filter: ${test5 ? 'PASS' : 'FAIL'} (Count: ${fashion.count})`);

  // Test 6: Combined Electronics + Price below ₹50,000
  const elecPrice = await mockApiCall({ category: 'Electronics', maxPrice: '50000' });
  const test6 = elecPrice.count > 0 && elecPrice.products.every(p => p.price <= 50000 && matchesCategoryFilter(p.category, p.subcategory, 'Electronics'));
  console.log(`6. Electronics + Price (< ₹50k): ${test6 ? 'PASS' : 'FAIL'} (Count: ${elecPrice.count})`);

  // Test 7: Combined Electronics + Discount
  const elecDiscount = await mockApiCall({ category: 'Electronics', minDiscount: '10' });
  const test7 = elecDiscount.count > 0 && elecDiscount.products.every(p => matchesCategoryFilter(p.category, p.subcategory, 'Electronics'));
  console.log(`7. Electronics + Discount (>=10%): ${test7 ? 'PASS' : 'FAIL'} (Count: ${elecDiscount.count})`);

  // Test 8: Combined Electronics + Sort
  const elecSort = await mockApiCall({ category: 'Electronics', sort: 'price-asc' });
  let isSorted = true;
  for (let i = 0; i < elecSort.products.length - 1; i++) {
    if (elecSort.products[i].price > elecSort.products[i + 1].price) { isSorted = false; break; }
  }
  const test8 = elecSort.count > 0 && isSorted;
  console.log(`8. Electronics + Sort (price-asc): ${test8 ? 'PASS' : 'FAIL'} (Count: ${elecSort.count})`);

  console.log("==================================================");

  await mongoose.disconnect();
}

runAcceptanceTests().catch(console.error);
