/**
 * Centralized Category Configuration and Normalization Module (Client)
 * Hierarchical parent-child mapping for complete category tree matching.
 */

export const PARENT_CATEGORIES = {
  'Electronics': {
    canonical: 'Electronics',
    aliases: ['electronics', 'electronic', 'tech', 'gadgets', 'electronics & gadgets'],
    children: ['Laptops', 'Gaming Laptops', 'Mobiles', 'Smartphones', 'Tablets', 'Headphones', 'Earbuds', 'Smartwatches', 'Watches', 'Smart TVs', 'Cameras', 'Monitors', 'Keyboards', 'Mechanical keyboard', 'Mice', 'Gaming mouse', 'Gaming keyboard', 'Gaming headset', 'Gaming controller', 'Gaming Accessories', 'Audio', 'PlayStation 5', 'Xbox Series X', 'Gaming Consoles', 'Consoles']
  },
  'Fashion': {
    canonical: 'Fashion',
    aliases: ['fashion', 'apparel', 'clothing', 'clothes', 'wear', 'outerwear', 'fashion & outerwear'],
    children: ["Men's Fashion", "Women's Fashion", 'Shirts', 'T-Shirts', 'Jeans', 'Jackets', 'Dresses', 'Winter Wear', 'Footwear', 'Shoes', 'Sneakers', 'Casual Shoes', 'Running Shoes']
  },
  'Home & Kitchen': {
    canonical: 'Home & Kitchen',
    aliases: ['home & kitchen', 'home and kitchen', 'kitchen', 'home appliances', 'kitchen appliances', 'appliances', 'home decor'],
    children: ['Furniture', 'Kitchen Appliances', 'Home Appliances', 'Air Fryer', 'Mixer Grinder', 'Electric Kettle', 'Microwave Oven', 'Coffee Maker', 'Rice Cooker', 'Vacuum Cleaner', 'Smart LED Bulbs', 'Cookware']
  },
  'Gaming': {
    canonical: 'Gaming',
    aliases: ['gaming', 'console', 'consoles', 'ps5', 'playstation', 'xbox', 'nintendo', 'gamepad', 'gaming accessories'],
    children: ['PlayStation 5', 'Xbox Series X', 'Gaming Laptops', 'Gaming Keyboard', 'Gaming Mouse', 'Gaming Headset', 'Gaming Controller', 'Mechanical keyboard']
  },
  'Beauty & Personal Care': {
    canonical: 'Beauty & Personal Care',
    aliases: ['beauty', 'beauty & personal care', 'beauty care', 'skincare', 'haircare', 'personal care'],
    children: ['Skincare', 'Haircare', 'Personal Care', 'Face Cleanser', 'Moisturizer', 'Sunscreen', 'Shampoo', 'Hair Dryer', 'Trimmer', 'Electric Shaver', 'Perfume']
  },
  'Books': {
    canonical: 'Books',
    aliases: ['book', 'books', 'reading', 'novel', 'novels', 'literature', 'education', 'technology books', 'business books'],
    children: ['Technology', 'Business', 'Education', 'Self-Help']
  }
};

export const SUBCATEGORIES = {
  "Men's Fashion": {
    canonical: "Men's Fashion",
    parent: 'Fashion',
    aliases: ["men's fashion", "mens fashion", "men fashion", "men's apparel", "men's clothing", "men's t-shirts", "men's shirts", "men's jeans", "men's jackets", "men t-shirt", "men shirt", "men jeans", "men jacket"]
  },
  "Women's Fashion": {
    canonical: "Women's Fashion",
    parent: 'Fashion',
    aliases: ["women's fashion", "womens fashion", "women fashion", "women's apparel", "women's clothing", "women's dresses", "women's tops", "women's jeans", "women's jackets", "women dress", "women top", "kurti"]
  },
  'Footwear': {
    canonical: 'Footwear',
    parent: 'Fashion',
    aliases: ['footwear', 'shoes', 'shoe', 'sneaker', 'sneakers', 'boots', 'boot', 'footwear & gear', 'sports shoes', 'casual shoes', 'running shoes']
  },
  'Laptops': {
    canonical: 'Laptops',
    parent: 'Electronics',
    aliases: ['laptop', 'laptops', 'macbook', 'macbooks', 'notebook', 'notebooks', 'laptops & macbooks', 'macbook air', 'macbook pro']
  },
  'Gaming Laptops': {
    canonical: 'Gaming Laptops',
    parent: 'Electronics',
    subParent: 'Laptops',
    aliases: ['gaming laptop', 'gaming laptops', 'rog strix', 'tuf gaming', 'loq', 'legion', 'nitro', 'predator', 'victus', 'omen', 'katana', 'cyborg', 'g15']
  },
  'Mobiles': {
    canonical: 'Mobiles',
    parent: 'Electronics',
    aliases: ['mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'smartphones', 'smartphones & 5g', '5g phones', 'iphone', 'iphones', 'cellphone', 'cellphones']
  },
  'Furniture': {
    canonical: 'Furniture',
    parent: 'Home & Kitchen',
    aliases: ['furniture', 'chair', 'chairs', 'office chair', 'gaming chair', 'table', 'tables', 'desk', 'desks', 'computer desk', 'study table', 'sofa', 'sofas', 'bookshelf', 'bookshelves', 'bedside table', 'wardrobe', 'wardrobes', 'recliner', 'recliners', 'dining table']
  },
  'Smartwatches': {
    canonical: 'Smartwatches',
    parent: 'Electronics',
    aliases: ['smartwatch', 'smartwatches', 'smart wearable', 'smart wearables', 'apple watch', 'watch', 'watches']
  },
  'Headphones': {
    canonical: 'Headphones',
    parent: 'Electronics',
    aliases: ['headphone', 'headphones', 'headset', 'headsets', 'earbud', 'earbuds', 'airpods', 'audio', 'anc wireless audio', 'earphones', 'earphone']
  },
  'Smart TVs': {
    canonical: 'Smart TVs',
    parent: 'Electronics',
    aliases: ['tv', 'tvs', 'television', 'televisions', 'smart tv', 'smart tvs']
  },
  'Tablets': {
    canonical: 'Tablets',
    parent: 'Electronics',
    aliases: ['tablet', 'tablets', 'ipad', 'ipads']
  }
};

export function normalizeCategoryName(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.toLowerCase().trim();

  // 1. Check Subcategories first for precise matching (e.g. "Men's Fashion" over general "Fashion")
  for (const [key, config] of Object.entries(SUBCATEGORIES)) {
    if (key.toLowerCase() === clean) return { ...config, isSubcategory: true };
    if (config.canonical.toLowerCase() === clean) return { ...config, isSubcategory: true };
    if (config.aliases.some(a => a.toLowerCase() === clean)) {
      return { ...config, isSubcategory: true };
    }
  }

  // 2. Check Parent Categories
  for (const [key, config] of Object.entries(PARENT_CATEGORIES)) {
    if (key.toLowerCase() === clean) return { ...config, isParent: true };
    if (config.canonical.toLowerCase() === clean) return { ...config, isParent: true };
    if (config.aliases.some(a => a.toLowerCase() === clean)) {
      return { ...config, isParent: true };
    }
  }

  // 3. Fallback Partial Match on Subcategories
  for (const [key, config] of Object.entries(SUBCATEGORIES)) {
    if (config.aliases.some(a => clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean))) {
      return { ...config, isSubcategory: true };
    }
  }

  // 4. Fallback Partial Match on Parent Categories
  for (const [key, config] of Object.entries(PARENT_CATEGORIES)) {
    if (config.aliases.some(a => clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean))) {
      return { ...config, isParent: true };
    }
  }

  return null;
}

export function matchesCategoryFilter(productCategory, productSubcategory, filterCategory) {
  if (!filterCategory || !filterCategory.trim()) return true;
  
  const normFilter = filterCategory.toLowerCase().trim();
  const prodCat = (productCategory || '').toLowerCase().trim();
  const prodSub = (productSubcategory || '').toLowerCase().trim();

  const config = normalizeCategoryName(normFilter);

  if (config) {
    const canonicalLower = config.canonical.toLowerCase();
    const aliasesLower = config.aliases ? config.aliases.map(a => a.toLowerCase()) : [];

    // If filtering by a Parent category (e.g. "Electronics" or "Fashion")
    if (config.isParent) {
      if (prodCat === canonicalLower || aliasesLower.includes(prodCat)) return true;
      if (config.children && config.children.some(ch => ch.toLowerCase() === prodSub || ch.toLowerCase() === prodCat)) return true;
    }

    // If filtering by a specific Subcategory (e.g. "Laptops", "Men's Fashion")
    if (config.isSubcategory) {
      if (prodCat === canonicalLower || aliasesLower.includes(prodCat)) return true;
      if (prodSub === canonicalLower || aliasesLower.includes(prodSub)) return true;
      return false; // Do not leak other subcategories under same parent!
    }
  }

  return prodCat.includes(normFilter) || normFilter.includes(prodCat) || prodSub.includes(normFilter) || normFilter.includes(prodSub);
}
