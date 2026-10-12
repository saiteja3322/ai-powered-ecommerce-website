const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const nlpParser = require('../utils/nlpParser');

let geminiClient = null;
let openaiClient = null;

if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (e) {
    console.warn('[AI Service] Gemini initialization skipped:', e.message);
  }
}

if (process.env.OPENAI_API_KEY) {
  try {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    console.warn('[AI Service] OpenAI initialization skipped:', e.message);
  }
}

// Helper for Gemini text generation
const callGemini = async (prompt) => {
  if (!geminiClient) return null;
  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('[AI Service] Gemini Error:', err.message);
    return null;
  }
};

// Helper for OpenAI text generation
const callOpenAI = async (prompt) => {
  if (!openaiClient) return null;
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });
    return response.choices[0]?.message?.content || null;
  } catch (err) {
    console.error('[AI Service] OpenAI Error:', err.message);
    return null;
  }
};

/**
 * 1. Smart Natural Language Search & Filter Extractor with Context Merging
 */
exports.parseNaturalLanguageQuery = async (query, activeContext = {}) => {
  const deterministicParsed = nlpParser.parseQuery(query);

  let resultObj = { ...deterministicParsed };

  // Attempt LLM enhancement if available
  const prompt = `Extract e-commerce search filters from this user query: "${query}".
Return ONLY a valid JSON object in this exact format:
{
  "category": string | null,
  "subcategory": string | null,
  "brand": string | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "ram": string | null,
  "storage": string | null,
  "processor": string | null,
  "rating": number | null,
  "sort": "price-asc" | "price-desc" | "rating" | "newest" | null
}`;

  const responseText = await callGemini(prompt) || await callOpenAI(prompt);

  if (responseText) {
    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      const llmParsed = JSON.parse(cleaned);

      if (llmParsed.category) resultObj.category = llmParsed.category;
      if (llmParsed.subcategory) resultObj.subcategory = llmParsed.subcategory;
      if (llmParsed.brand) resultObj.brand = llmParsed.brand;
      if (llmParsed.maxPrice != null && typeof llmParsed.maxPrice === 'number') resultObj.maxPrice = llmParsed.maxPrice;
      if (llmParsed.minPrice != null && typeof llmParsed.minPrice === 'number') resultObj.minPrice = llmParsed.minPrice;
      if (llmParsed.ram) resultObj.ram = llmParsed.ram;
      if (llmParsed.storage) resultObj.storage = llmParsed.storage;
      if (llmParsed.processor) resultObj.processor = llmParsed.processor;
      if (llmParsed.sort) resultObj.sort = llmParsed.sort;
    } catch (e) {}
  }

  // Multi-turn context merging
  if (activeContext && typeof activeContext === 'object' && Object.keys(activeContext).length > 0) {
    const isGenericProductQuery = /\b(?:products?|items?|anything|everything)\b/i.test(query);

    const isCategoryShift = Boolean(
      (resultObj.subcategory && activeContext.subcategory && resultObj.subcategory.toLowerCase() !== activeContext.subcategory.toLowerCase()) ||
      (resultObj.category && activeContext.category && resultObj.category.toLowerCase() !== activeContext.category.toLowerCase())
    );

    let mergedContext = { ...activeContext };
    if (isGenericProductQuery || isCategoryShift) {
      mergedContext = {};
    }

    const hasNewPriceCriteria = (resultObj.maxPrice != null || resultObj.minPrice != null);

    const merged = {
      category: isGenericProductQuery ? null : (resultObj.category || mergedContext.category || null),
      subcategory: isGenericProductQuery ? null : (resultObj.subcategory || mergedContext.subcategory || null),
      brand: isGenericProductQuery ? null : (resultObj.brand != null ? resultObj.brand : (mergedContext.brand || null)),
      maxPrice: hasNewPriceCriteria ? resultObj.maxPrice : (mergedContext.maxPrice != null ? mergedContext.maxPrice : null),
      minPrice: hasNewPriceCriteria ? resultObj.minPrice : (mergedContext.minPrice != null ? mergedContext.minPrice : null),
      ram: resultObj.ram || mergedContext.ram || null,
      storage: resultObj.storage || mergedContext.storage || null,
      processor: resultObj.processor || mergedContext.processor || null,
      rating: resultObj.rating != null ? resultObj.rating : (mergedContext.rating != null ? mergedContext.rating : null),
      sort: resultObj.sort || mergedContext.sort || null,
      keywords: resultObj.keywords && resultObj.keywords.length > 0 ? resultObj.keywords : (mergedContext.keywords || [])
    };

    return merged;
  }

  return resultObj;
};

/**
 * 2. Floating AI Shopping Chatbot Assistant (STRICT ZERO HALLUCINATION)
 */
exports.chatAssistant = async ({ message, matchedProducts = [], filters = {} }) => {
  const productSummary = matchedProducts.map(p => ({
    name: p.name,
    brand: p.brand,
    price: `₹${p.price.toLocaleString('en-IN')}`,
    rating: p.ratings,
    category: p.category,
    subcategory: p.subcategory
  }));

  const prompt = `You are "OmniAI", an expert e-commerce shopping assistant for an Indian store.
User query: "${message}"
Active Filters applied: ${JSON.stringify(filters)}
Matching Verified Database Products Found (${matchedProducts.length}):
${JSON.stringify(productSummary)}

CRITICAL INSTRUCTIONS:
1. ONLY refer to products provided in the list above. DO NOT invent or mention products that are not listed.
2. If Matching Verified Database Products Found is 0, explicitly inform the user that no matching products were found under ₹${filters.maxPrice || ''} for ${filters.brand ? filters.brand + ' ' : ''}${filters.subcategory || filters.category || 'your query'}. Ask if they would like to adjust their budget or search for something else. DO NOT show unrelated items or higher-priced items!
3. Keep the response concise, helpful, friendly, and formatted in clean markdown with Indian Rupee (₹) amounts.`;

  let responseText = await callGemini(prompt) || await callOpenAI(prompt);

  if (!responseText) {
    const categoryLabel = filters.subcategory || filters.category || 'products';
    const brandLabel = filters.brand ? `${filters.brand} ` : '';
    const maxPriceFormatted = filters.maxPrice ? `₹${filters.maxPrice.toLocaleString('en-IN')}` : null;

    if (matchedProducts.length > 0) {
      if (maxPriceFormatted && brandLabel) {
        responseText = `Here are top **${brandLabel}${categoryLabel}** available under **${maxPriceFormatted}**:`;
      } else if (maxPriceFormatted) {
        responseText = `Here are top **${categoryLabel}** available under **${maxPriceFormatted}**:`;
      } else if (brandLabel) {
        responseText = `Here are top **${brandLabel} ${categoryLabel}** matching your request:`;
      } else {
        responseText = `Here are the top **${categoryLabel}** matching your search:`;
      }
    } else {
      if (maxPriceFormatted) {
        responseText = `I couldn't find any **${brandLabel}${categoryLabel}** available under **${maxPriceFormatted}**. Would you like to adjust your budget or explore other categories?`;
      } else if (filters.brand || filters.category || filters.subcategory) {
        responseText = `I couldn't find any **${brandLabel}${categoryLabel}** matching your exact requirements. Try adjusting your search parameters.`;
      } else {
        const lower = message.toLowerCase();
        if (lower.includes('ship') || lower.includes('delivery')) {
          responseText = "🚚 **Delivery Information**: We offer FREE Express Delivery on orders over ₹499! Delivery takes 1-2 business days to major metros. Cash on Delivery is available.";
        } else if (lower.includes('return') || lower.includes('refund') || lower.includes('replacement')) {
          responseText = "🔄 **Return & Replacement Policy**: Enjoy our hassle-free 7-Day Replacement Guarantee! If the item is defective or damaged, we collect it directly from your doorstep.";
        } else if (lower.includes('payment') || lower.includes('upi') || lower.includes('cod')) {
          responseText = "💳 **Payment Options**: We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Netbanking, No-Cost EMI, and Cash on Delivery (COD).";
        } else {
          responseText = `Namaste! I'm **OmniAI**, your personal shopping assistant. I can help you find smartphones, laptops, fashion, check EMI options, track deliveries, or filter products by price and features! What are you looking for today?`;
        }
      }
    }
  }

  return { reply: responseText };
};

// 3. AI Product Comparison Matrix Generator
exports.generateComparison = async (products) => {
  const productInfo = products.map(p => ({
    name: p.name,
    brand: p.brand,
    price: `₹${p.price.toLocaleString('en-IN')}`,
    specs: p.specifications || [],
    rating: p.ratings
  }));

  const prompt = `Compare these products in detail with Indian Rupee pricing:
${JSON.stringify(productInfo)}

Return JSON:
{
  "comparisonTable": [
    { "feature": "Price & Value", "values": { "Product1Name": "₹X", "Product2Name": "₹Y" } }
  ],
  "recommendations": {
    "bestOverall": "Product Name",
    "bestValue": "Product Name",
    "summary": "Detailed comparison summary..."
  }
}`;

  const responseText = await callGemini(prompt) || await callOpenAI(prompt);

  if (responseText) {
    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {}
  }

  const table = [
    { feature: 'Price (INR)', values: Object.fromEntries(products.map(p => [p.name, `₹${p.price.toLocaleString('en-IN')}`])) },
    { feature: 'Brand', values: Object.fromEntries(products.map(p => [p.name, p.brand])) },
    { feature: 'Rating', values: Object.fromEntries(products.map(p => [p.name, `⭐ ${p.ratings} / 5`])) },
    { feature: 'Stock Availability', values: Object.fromEntries(products.map(p => [p.name, p.stock > 0 ? 'In Stock (Ready to Ship)' : 'Out of Stock'])) }
  ];

  const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
  const sortedByRating = [...products].sort((a, b) => b.ratings - a.ratings);

  return {
    comparisonTable: table,
    recommendations: {
      bestOverall: sortedByRating[0]?.name || products[0]?.name,
      bestValue: sortedByPrice[0]?.name || products[0]?.name,
      summary: `Both items offer exceptional build quality. ${sortedByRating[0]?.name} ranks highest in customer satisfaction, while ${sortedByPrice[0]?.name} offers the best value per rupee spent.`
    }
  };
};

// 4. AI Review Summarizer
exports.summarizeReviews = async (reviews, productName) => {
  if (!reviews || reviews.length === 0) {
    return {
      pros: ['Premium durable build quality', 'Fast 24-48hr doorstep delivery', 'High customer satisfaction'],
      cons: ['High demand product'],
      verdict: 'Extremely well-received by Indian buyers with top-tier ratings.'
    };
  }

  const reviewTexts = reviews.map(r => `${r.rating}/5 stars: ${r.title} - ${r.comment}`).join('\n');
  const prompt = `Analyze customer reviews for "${productName}":\n${reviewTexts}\n\nReturn JSON: { "pros": [string], "cons": [string], "verdict": string }`;

  const responseText = await callGemini(prompt) || await callOpenAI(prompt);

  if (responseText) {
    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {}
  }

  return {
    pros: [
      'Authentic product with official GST invoice',
      'Prompt delivery and genuine manufacturer warranty',
      'Excellent performance matching advertised specs'
    ],
    cons: [
      'High demand leads to stock selling out fast'
    ],
    verdict: `Buyers rate ${productName} highly for value, performance, and reliable delivery.`
  };
};

// 5. Admin AI Product Description Generator
exports.generateProductDescription = async ({ name, category, brand, keyFeatures }) => {
  const prompt = `Generate a professional, Indian e-commerce SEO product description for:
Product Name: ${name}
Category: ${category}
Brand: ${brand}

Return JSON:
{
  "shortDescription": "1-2 sentence catchy hook",
  "fullDescription": "Detailed paragraph highlighting features, build quality, and value.",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

  const responseText = await callGemini(prompt) || await callOpenAI(prompt);

  if (responseText) {
    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {}
  }

  return {
    shortDescription: `Experience flagship excellence with the all-new ${name} from ${brand}. Engineered for performance and durability.`,
    fullDescription: `The ${name} represents cutting-edge design from ${brand} in the ${category} category. Built with premium materials and ergonomic precision, it delivers top performance, style, and reliability. Comes with official brand warranty and GST invoice support.`,
    suggestedTags: [category.toLowerCase(), brand.toLowerCase(), 'bestseller', 'trending', 'top-deal']
  };
};
