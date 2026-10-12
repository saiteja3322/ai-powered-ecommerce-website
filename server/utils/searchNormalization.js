const Fuse = require('fuse.js');

/**
 * Common typo and synonym mappings
 */
const SYNONYMS_AND_CORRECTIONS = {
  samsng: 'samsung',
  samung: 'samsung',
  iphne: 'iphone',
  ipn: 'iphone',
  iphone15: 'iphone 15',
  iphone16: 'iphone 16',
  lapto: 'laptop',
  laptops: 'laptop',
  headphnes: 'headphones',
  headphone: 'headphones',
  earbud: 'earbuds',
  earphone: 'earbuds',
  earphones: 'earbuds',
  smartwatch: 'smart watch',
  mac: 'macbook',
  macbookpro: 'macbook pro',
  macbookair: 'macbook air',
  shoes: 'shoe',
  sneakers: 'shoe',
  sneaker: 'shoe',
  tshirt: 't-shirt',
  tshirts: 't-shirt',
  mobile: 'mobiles',
  phone: 'mobiles',
  phones: 'mobiles',
  smartphone: 'mobiles',
  smartphones: 'mobiles',
  tv: 'television',
  tvs: 'television'
};

/**
 * Normalize string for uniform comparison:
 * 1. Lowercase
 * 2. Trim
 * 3. Replace non-alphanumeric except hyphen/space
 * 4. Replace multiple spaces with a single space
 */
function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Stem/strip trailing plural 's' or 'es' safely without ruining short words
 */
function stemWord(word) {
  if (!word || word.length <= 3) return word;
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && !['yes', 'eyes'].includes(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && !['asus', 'boss'].includes(word)) return word.slice(0, -1);
  return word;
}

/**
 * Tokenize a normalized string into words, applying synonym corrections
 */
function tokenize(str) {
  const normalized = normalizeText(str);
  if (!normalized) return [];

  const rawTokens = normalized.split(/[\s-]+/).filter(Boolean);
  const processedTokens = [];

  for (const token of rawTokens) {
    const corrected = SYNONYMS_AND_CORRECTIONS[token] || token;
    const stemmed = stemWord(corrected);
    processedTokens.push(token, corrected, stemmed);
  }

  return Array.from(new Set(processedTokens));
}

/**
 * Expand query string with variations (e.g. joined words, hyphenated, token combinations)
 */
function expandQuery(queryStr) {
  const normalized = normalizeText(queryStr);
  if (!normalized) return { raw: '', tokens: [], variants: [] };

  const tokens = tokenize(normalized);
  const noSpace = normalized.replace(/\s+/g, '');
  const spaceJoined = normalized.replace(/-/g, ' ');
  const hyphenJoined = normalized.replace(/\s+/g, '-');

  // Check synonym directly on whole query
  const directSynonym = SYNONYMS_AND_CORRECTIONS[noSpace] || SYNONYMS_AND_CORRECTIONS[normalized];

  const variants = Array.from(
    new Set([
      normalized,
      noSpace,
      spaceJoined,
      hyphenJoined,
      directSynonym,
      ...tokens
    ].filter(Boolean))
  );

  return { raw: queryStr, normalized, tokens, variants };
}

/**
 * Calculate relevance score for a product given a query
 * Score scale: 0 (no match) to 1500+ (perfect match)
 */
function scoreProductRelevance(product, queryInfo) {
  const { normalized: normQ, tokens: qTokens, variants: qVariants } = queryInfo;
  if (!normQ) return 0;

  let score = 0;

  // Extract searchable fields
  const name = normalizeText(product.name || '');
  const brand = normalizeText(product.brand || '');
  const category = normalizeText(product.category || '');
  const subcategory = normalizeText(product.subcategory || '');
  const description = normalizeText(product.description || '');
  const shortDesc = normalizeText(product.shortDescription || '');
  const sku = normalizeText(product.sku || '');
  
  const tags = Array.isArray(product.tags) ? product.tags.map(t => normalizeText(t)) : [];
  const features = Array.isArray(product.features) ? product.features.map(f => normalizeText(f)) : [];
  const colors = Array.isArray(product.availableColors) ? product.availableColors.map(c => normalizeText(c)) : [];
  const sizes = Array.isArray(product.availableSizes) ? product.availableSizes.map(s => normalizeText(s)) : [];
  
  const specsStr = Array.isArray(product.specifications)
    ? product.specifications.map(sp => `${normalizeText(sp.key)} ${normalizeText(sp.value)}`).join(' ')
    : '';

  const nameNoSpace = name.replace(/\s+/g, '');
  const normQNoSpace = normQ.replace(/\s+/g, '');

  // 1. EXACT NAME MATCH
  if (name === normQ || nameNoSpace === normQNoSpace) {
    score += 1000;
  }

  // 2. NAME STARTS WITH QUERY
  else if (name.startsWith(normQ) || nameNoSpace.startsWith(normQNoSpace)) {
    score += 750;
  }

  // 3. NAME CONTAINS QUERY
  else if (name.includes(normQ) || (normQNoSpace.length >= 3 && nameNoSpace.includes(normQNoSpace))) {
    score += 500;
  }

  // 4. BRAND MATCH
  if (brand === normQ || normQ.includes(brand)) {
    score += 400;
  } else if (brand && normQ.includes(brand)) {
    score += 300;
  }

  // 5. CATEGORY & SUBCATEGORY MATCH
  if (category === normQ || subcategory === normQ) {
    score += 350;
  } else if (category.includes(normQ) || (normQ.length >= 3 && normQ.includes(category))) {
    score += 250;
  } else if (subcategory && (subcategory.includes(normQ) || normQ.includes(subcategory))) {
    score += 200;
  }

  // 6. TOKEN OVERLAP MATCH IN NAME & BRAND
  const mainTokens = qTokens.filter(t => t.length >= 2);
  let matchedNameTokens = 0;
  mainTokens.forEach(t => {
    if (name.includes(t)) matchedNameTokens++;
  });

  if (mainTokens.length > 0 && matchedNameTokens === mainTokens.length) {
    score += 300; // All query tokens found in product name
  } else if (matchedNameTokens > 0) {
    score += matchedNameTokens * 75;
  }

  // 7. TAGS, FEATURES, COLORS, SIZES MATCH
  tags.forEach(tag => {
    if (tag === normQ) score += 250;
    else if (qTokens.some(t => t.length >= 3 && tag.includes(t))) score += 80;
  });

  colors.forEach(col => {
    if (col === normQ || qTokens.includes(col)) score += 150;
  });

  sizes.forEach(sz => {
    if (sz === normQ || qTokens.includes(sz.toLowerCase())) score += 100;
  });

  features.forEach(ft => {
    if (qTokens.some(t => t.length >= 3 && ft.includes(t))) score += 40;
  });

  // 8. SPECIFICATIONS MATCH
  if (specsStr && qTokens.some(t => t.length >= 3 && specsStr.includes(t))) {
    score += 90;
  }

  // 9. DESCRIPTION & SKU MATCH
  if (sku && (sku === normQ || sku.includes(normQ))) {
    score += 300;
  }
  if (description.includes(normQ) || shortDesc.includes(normQ)) {
    score += 70;
  }

  return score;
}

/**
 * Perform relevance-based search and fuzzy match on a list of product documents
 */
function rankProducts(products, queryStr, options = {}) {
  if (!queryStr || !queryStr.trim()) {
    return products;
  }

  const queryInfo = expandQuery(queryStr);
  const { normalized: normQ, variants } = queryInfo;

  // 1. Calculate deterministic score for each product
  const scoredProducts = products.map(product => {
    const directScore = scoreProductRelevance(product, queryInfo);
    return { product, score: directScore };
  });

  // Filter products with score > 0
  let matched = scoredProducts.filter(item => item.score > 0);

  // 2. If direct scoring yielded few or no results, run Fuse.js fuzzy matching
  if (matched.length === 0 || matched.every(item => item.score < 100)) {
    const fuseOptions = {
      includeScore: true,
      threshold: 0.4, // Balanced sensitivity: 0 = exact, 1 = match anything
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'brand', weight: 0.2 },
        { name: 'category', weight: 0.15 },
        { name: 'subcategory', weight: 0.1 },
        { name: 'tags', weight: 0.1 },
        { name: 'availableColors', weight: 0.05 }
      ]
    };

    const fuse = new Fuse(products, fuseOptions);

    // Try search with raw query and variants
    let fuseResults = fuse.search(normQ);

    if (fuseResults.length === 0) {
      for (const variant of variants) {
        if (variant && variant !== normQ) {
          const vRes = fuse.search(variant);
          if (vRes.length > 0) {
            fuseResults = vRes;
            break;
          }
        }
      }
    }

    // Merge fuzzy results into matched list
    fuseResults.forEach(res => {
      const fuzzyScore = Math.round((1 - res.score) * 250); // Fuse score 0 is best
      const existingIdx = matched.findIndex(m => String(m.product._id) === String(res.item._id));
      if (existingIdx !== -1) {
        matched[existingIdx].score = Math.max(matched[existingIdx].score, fuzzyScore);
      } else if (fuzzyScore >= 80) {
        matched.push({ product: res.item, score: fuzzyScore });
      }
    });
  }

  // 3. Sort by score descending
  matched.sort((a, b) => b.score - a.score);

  return matched.map(item => item.product);
}

module.exports = {
  normalizeText,
  tokenize,
  expandQuery,
  scoreProductRelevance,
  rankProducts,
  SYNONYMS_AND_CORRECTIONS
};
