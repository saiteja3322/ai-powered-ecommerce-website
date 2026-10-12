/**
 * Deterministic Natural Language Parser for Indian E-Commerce Product Queries
 */

const SUBCATEGORY_MAP = [
  { subcategory: 'Gaming Laptops', category: 'Laptops', keywords: ['gaming laptop', 'gaming laptops', 'rog strix', 'tuf gaming', 'loq', 'legion', 'nitro', 'predator', 'victus', 'omen', 'katana', 'cyborg'] },
  { subcategory: 'Laptops', category: 'Laptops', keywords: ['laptop', 'laptops', 'macbook', 'macbooks', 'notebook', 'notebooks'] },
  { subcategory: 'Mobiles', category: 'Mobiles', keywords: ['mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'smartphones', 'iphone', 'iphones', 'pixel'] },
  { subcategory: "Men's Fashion", category: 'Fashion', keywords: ["men's fashion", "mens fashion", "men fashion", "men's apparel", "men's clothing", "men's t-shirts", "men's shirts", "men's jeans", "men's jackets", "men shirt", "men jeans", "men jacket"] },
  { subcategory: "Women's Fashion", category: 'Fashion', keywords: ["women's fashion", "womens fashion", "women fashion", "women's apparel", "women's clothing", "women's dresses", "women's tops", "women's jeans", "women's jackets", "women dress", "women top", "kurti"] },
  { subcategory: 'Footwear', category: 'Fashion', keywords: ['shoe', 'shoes', 'sneaker', 'sneakers', 'boots', 'footwear', 'sandals', 'running shoes', 'casual shoes'] },
  { subcategory: 'Smartwatches', category: 'Electronics', keywords: ['smartwatch', 'smartwatches', 'apple watch', 'watch', 'watches'] },
  { subcategory: 'Headphones', category: 'Electronics', keywords: ['headphone', 'headphones', 'headset', 'earbuds', 'airpods', 'earphone', 'earphones', 'audio'] },
  { subcategory: 'Smart TVs', category: 'Electronics', keywords: ['tv', 'tvs', 'television', 'smart tv', 'smart tvs'] },
  { subcategory: 'Tablets', category: 'Electronics', keywords: ['tablet', 'tablets', 'ipad', 'ipads'] },
  { subcategory: 'Furniture', category: 'Home & Kitchen', keywords: ['furniture', 'chair', 'chairs', 'table', 'tables', 'desk', 'desks', 'sofa', 'sofas', 'bookshelf', 'bookshelves', 'bedside table', 'wardrobe', 'wardrobes', 'recliner', 'recliners', 'dining table'] },
  { subcategory: 'Kitchen Appliances', category: 'Home & Kitchen', keywords: ['kitchen', 'air fryer', 'fryer', 'mixer', 'grinder', 'kettle', 'microwave', 'oven', 'coffee maker', 'rice cooker', 'induction', 'cooktop', 'cookware'] },
  { subcategory: 'Home Appliances', category: 'Home & Kitchen', keywords: ['vacuum', 'vacuum cleaner', 'smart bulb', 'led bulb', 'water bottle'] },
  { subcategory: 'Beauty', category: 'Beauty & Personal Care', keywords: ['beauty', 'skincare', 'haircare', 'cleanser', 'face wash', 'moisturizer', 'sunscreen', 'shampoo', 'hair dryer', 'trimmer', 'shaver', 'perfume', 'fragrance'] },
  { subcategory: 'Books', category: 'Books', keywords: ['book', 'books', 'novel', 'reading'] },
  { subcategory: 'Gaming', category: 'Gaming', keywords: ['gaming', 'console', 'playstation', 'ps5', 'xbox', 'gamepad', 'controller'] }
];

const BRANDS_LIST = [
  'Apple', 'Samsung', 'Google', 'Dell', 'HP', 'ASUS', 'Acer', 'Lenovo', 'MSI', 'Xiaomi', 'OnePlus', 'Redmi', 'Realme', 'Nothing', 'Sony', 'LG',
  'Nike', 'Tommy Hilfiger', "Levi's", 'Zara', 'MANGO', 'Puma', 'Woodland', 'Fossil', 'Seiko', 'Ray-Ban', 'Adidas',
  'Philips', 'Sujata', 'IFB', "De'Longhi", 'Panasonic', 'Dyson', 'Prestige', 'Milton', 'Pigeon', 'Bajaj', 'Kent',
  'CeraVe', 'Neutrogena', 'La Roche-Posay', "L'Oréal Paris", 'Braun', 'Dior',
  'Microsoft', 'Razer', 'Logitech', 'HyperX', 'Keychron', 'boAt', 'Noise', 'Fire-Boltt', 'Amazfit', 'JBL', 'Boult',
  'Green Soul', 'Wakefit', 'Solimo', 'Nilkamal', 'DeckUp', 'Cellbell'
];

/**
 * Normalizes text price expressions to integers:
 * "50k" -> 50000, "50 K" -> 50000, "50 thousand" -> 50000, "₹50,000" -> 50000, "1 lakh" -> 100000, "1.5 lakh" -> 150000
 */
const normalizePriceString = (str) => {
  if (!str) return null;

  let cleaned = str.toString().toLowerCase().trim();
  cleaned = cleaned.replace(/₹|rs\.?|inr|,|\$/gi, '').trim();

  // Match pattern like 50k, 50 k, 70.5k
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*k$/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Match pattern like 50 thousand
  const thousandMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*thousand$/i);
  if (thousandMatch) {
    return Math.round(parseFloat(thousandMatch[1]) * 1000);
  }

  // Match pattern like 1.5 lakh / lac / 1 lakh
  const lakhMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)$/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
};

/**
 * Parses raw natural language text into a structured query object.
 */
const parseQuery = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      intent: 'SEARCH',
      category: null,
      subcategory: null,
      brand: null,
      maxPrice: null,
      minPrice: null,
      gpu: null,
      cpu: null,
      ram: null,
      storage: null,
      refreshRate: null,
      rating: null,
      keywords: [],
      sort: null,
      rawQuery: text || ''
    };
  }

  let raw = text.trim();
  let lower = raw.toLowerCase();

  let intent = 'SEARCH';
  let maxPrice = null;
  let minPrice = null;
  let category = null;
  let subcategory = null;
  let brand = null;
  let gpu = null;
  let cpu = null;
  let ram = null;
  let storage = null;
  let refreshRate = null;
  let rating = null;
  let sort = null;
  const keywords = [];

  // Check recommendation intent
  if (/\bbest\b|\btop\b|\brecommend\b|\bsuggest\b|\bmost powerful\b|\bcheapest\b/i.test(lower)) {
    intent = 'PRODUCT_RECOMMENDATION';
  }

  // 1. GPU Extraction (e.g. RTX 4060, RTX 4070, RTX 3050, RTX 4050, GTX)
  const gpuMatch = lower.match(/\b(rtx\s*\d{4}|gtx\s*\d{4}|radeon\s*rx\s*\d{4}m?)\b/i);
  if (gpuMatch) {
    gpu = gpuMatch[1].toUpperCase().replace(/\s+/g, ' ');
  }

  // 2. CPU Extraction (e.g. Intel i7, i5, i9, Ryzen 7, Ryzen 5, Core Ultra)
  const cpuMatch = lower.match(/\b(intel\s*core\s*i[3579]|core\s*i[3579]|i[3579]|ryzen\s*[3579]|core\s*ultra\s*[79])\b/i);
  if (cpuMatch) {
    cpu = cpuMatch[1].toUpperCase();
  }

  // 3. Refresh Rate Extraction (e.g. 144Hz, 165Hz, 240Hz)
  const refreshMatch = lower.match(/\b(\d{3}\s*hz)\b/i);
  if (refreshMatch) {
    refreshRate = refreshMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  // 4. Special Brand Inferences
  if (/\biphone\b/i.test(lower)) {
    brand = 'Apple';
    category = 'Electronics';
    subcategory = 'Mobiles';
  } else if (/\bmacbook\b/i.test(lower)) {
    brand = 'Apple';
    category = 'Electronics';
    subcategory = 'Laptops';
  }

  // 5. Brand Matching
  if (!brand) {
    for (const b of BRANDS_LIST) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(lower)) {
        brand = b;
        break;
      }
    }
  }

  // 6. Subcategory & Category Extraction
  for (const subObj of SUBCATEGORY_MAP) {
    if (subObj.keywords.some(kw => new RegExp(`\\b${kw}s?\\b`, 'i').test(lower))) {
      subcategory = subObj.subcategory;
      category = subObj.category;
      keywords.push(subObj.keywords[0]);
      break;
    }
  }

  if (!category) {
    if (/\belectronics\b/i.test(lower)) category = 'Electronics';
    else if (/\bfashion\b/i.test(lower)) category = 'Fashion';
    else if (/\bgaming\b/i.test(lower)) category = 'Gaming';
    else if (/\bfurniture\b/i.test(lower)) { category = 'Home & Kitchen'; subcategory = 'Furniture'; }
    else if (/\bkitchen\b/i.test(lower)) category = 'Home & Kitchen';
    else if (/\bbeauty\b/i.test(lower)) category = 'Beauty & Personal Care';
    else if (/\bbooks?\b/i.test(lower)) category = 'Books';
    else if (/\bshoes?\b|\bfootwear\b/i.test(lower)) { category = 'Fashion'; subcategory = 'Footwear'; }
    else if (/\bwatch(?:es)?\b|\bsmartwatch(?:es)?\b/i.test(lower)) { category = 'Electronics'; subcategory = 'Smartwatches'; }
  }

  // 7. Price Range Parsing ("between 40000 and 60000", "40k to 60k", "under 80000", "below 1 lakh", "under 50k")
  const betweenMatch = lower.match(/(?:between|from)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|thousand|lakh|lakhs|lac|lacs)?)\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|thousand|lakh|lakhs|lac|lacs)?)/i);
  if (betweenMatch && (lower.includes('between') || lower.includes('from') || lower.includes('to') || lower.includes('-'))) {
    minPrice = normalizePriceString(betweenMatch[1]);
    maxPrice = normalizePriceString(betweenMatch[2]);
  } else {
    // Max Price Parsing ("under 80000", "below 1 lakh", "under 50k", "less than 70000", "within 60k")
    const explicitMaxMatch = lower.match(/(?:under|below|less than|within|max|maximum|upto|up to|budget of)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|thousand|lakh|lakhs|lac|lacs)?)/i) ||
                             lower.match(/(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|thousand|lakh|lakhs|lac|lacs)?)\s*(?:under|below|less than)/i) ||
                             lower.match(/(\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|lakh|lakhs|lac|lacs))\s*(?:under|below|laptop|phone|shoes|watch|furniture)/i);

    if (explicitMaxMatch) {
      maxPrice = normalizePriceString(explicitMaxMatch[1]);
    } else {
      const simplePriceMatch = lower.match(/(?:under|below|less than)\s*(\d+)/i) || lower.match(/\b(\d{4,6})\b/);
      if (simplePriceMatch && (lower.includes('under') || lower.includes('below') || lower.includes('within') || lower.includes('cheap'))) {
        maxPrice = normalizePriceString(simplePriceMatch[1]);
      }
    }

    // Min Price Parsing ("above 40000", "more than 40k", "min 40000")
    const explicitMinMatch = lower.match(/(?:above|over|more than|exceeding|starting from|min|minimum)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?\s*(?:k|thousand|lakh|lakhs|lac|lacs)?)/i);
    if (explicitMinMatch) {
      minPrice = normalizePriceString(explicitMinMatch[1]);
    }
  }

  // 8. RAM Extraction ("16GB RAM", "16 gb", "8GB")
  const ramMatch = lower.match(/(\d+\s*gb)\s*(?:ram|memory)?/i);
  if (ramMatch) {
    ram = ramMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  // 9. Storage Extraction ("512GB", "256GB SSD", "1TB")
  const storageMatch = lower.match(/(\d+\s*(?:gb|tb))\s*(?:ssd|storage|hdd|rom)?/i);
  if (storageMatch) {
    const val = storageMatch[1].replace(/\s+/g, '').toUpperCase();
    if (!ram || val !== ram) {
      storage = val;
    }
  }

  // 10. Rating & Sorting
  if (/cheapest|lowest price|cheap/i.test(lower)) {
    sort = 'price-asc';
  } else if (/most powerful|highest specs|top performance|best gaming/i.test(lower)) {
    sort = 'gpu-tier';
  } else if (/best|top|popular|highest rated/i.test(lower)) {
    rating = 4.0;
    sort = 'gpu-tier';
  }

  return {
    intent,
    category,
    subcategory,
    brand,
    maxPrice,
    minPrice,
    gpu,
    cpu,
    ram,
    storage,
    refreshRate,
    rating,
    keywords,
    sort,
    rawQuery: text
  };
};

module.exports = {
  normalizePriceString,
  parseQuery
};
