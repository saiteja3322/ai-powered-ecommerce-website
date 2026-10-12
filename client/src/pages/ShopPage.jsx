import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts, setFilter, resetFilters } from '../redux/slices/productSlice';
import { Filter, Sparkles, RefreshCcw, Search, AlertTriangle, Percent } from 'lucide-react';

import { formatINR } from '../utils/formatCurrency';
import { rankProducts, normalizeText } from '../utils/searchNormalization';
import { matchesCategoryFilter } from '../utils/categoryMapping';

const getProductCategory = (p) => p.category || p.mainCategory || p.subCategory || '';

const DISCOUNT_OPTIONS = [
  { label: 'All Discounts', value: '' },
  { label: '10% or more', value: '10' },
  { label: '20% or more', value: '20' },
  { label: '30% or more', value: '30' },
  { label: '40% or more', value: '40' },
  { label: '50% or more', value: '50' }
];

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, filters, total, pages, page, loading, error } = useSelector(state => state.products);

  const [priceRange, setPriceRange] = useState(filters.maxPrice || 300000);
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedDiscount, setSelectedDiscount] = useState(filters.minDiscount || '');
  const [minRating, setMinRating] = useState(filters.rating || '');

  // Fetch products whenever Redux filter parameters change
  useEffect(() => {
    const paramsToFetch = {};
    if (filters.search) paramsToFetch.search = filters.search;
    if (filters.category) paramsToFetch.category = filters.category;
    if (filters.maxPrice) paramsToFetch.maxPrice = filters.maxPrice;
    if (filters.minDiscount) paramsToFetch.minDiscount = filters.minDiscount;
    if (filters.rating) paramsToFetch.rating = filters.rating;
    if (filters.sort) paramsToFetch.sort = filters.sort;

    dispatch(fetchProducts(paramsToFetch));
  }, [dispatch, filters.search, filters.category, filters.maxPrice, filters.minDiscount, filters.rating, filters.sort]);

  // Read URL search params on mount & back/forward navigation
  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    const maxPriceFromUrl = searchParams.get('maxPrice');
    const discountFromUrl = searchParams.get('minDiscount') || searchParams.get('discount');
    const sortFromUrl = searchParams.get('sort');

    const filterUpdates = {};
    if (catFromUrl !== null && catFromUrl !== filters.category) {
      filterUpdates.category = catFromUrl;
    } else if (catFromUrl === null && filters.category) {
      filterUpdates.category = '';
    }

    if (searchFromUrl !== null && searchFromUrl !== filters.search) {
      filterUpdates.search = searchFromUrl;
    } else if (searchFromUrl === null && filters.search) {
      filterUpdates.search = '';
    }

    if (maxPriceFromUrl !== null && Number(maxPriceFromUrl) !== Number(filters.maxPrice)) {
      filterUpdates.maxPrice = Number(maxPriceFromUrl);
    }
    if (discountFromUrl !== null && discountFromUrl !== filters.minDiscount) {
      filterUpdates.minDiscount = discountFromUrl;
    }
    if (sortFromUrl !== null && sortFromUrl !== filters.sort) {
      filterUpdates.sort = sortFromUrl;
    }

    if (Object.keys(filterUpdates).length > 0) {
      dispatch(setFilter(filterUpdates));
    }
  }, [searchParams]);

  // Keep local filter inputs synced with Redux filter state
  useEffect(() => {
    setSelectedCategory(filters.category || '');
    setPriceRange(filters.maxPrice || 300000);
    setSelectedDiscount(filters.minDiscount || '');
    setMinRating(filters.rating || '');
  }, [filters]);

  // Dynamically extract main category items for sidebar
  const dynamicCategories = useMemo(() => {
    const mainCategories = ['Electronics', 'Mobiles', 'Laptops', 'Gaming', 'Fashion', 'Shoes', 'Furniture', 'Beauty', 'Books', 'Home & Kitchen'];
    const cats = new Set(mainCategories);
    products.forEach(p => {
      const c = getProductCategory(p);
      if (c) cats.add(c);
      if (p.subcategory && p.subcategory !== 'General') cats.add(p.subcategory);
    });
    return ['', ...Array.from(cats)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    dispatch(setFilter({ category: cat, search: '' }));
    const newParams = new URLSearchParams(searchParams);
    if (cat) {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const handleDiscountSelect = (disc) => {
    setSelectedDiscount(disc);
    dispatch(setFilter({ minDiscount: disc }));
    const newParams = new URLSearchParams(searchParams);
    if (disc) {
      newParams.set('minDiscount', disc);
    } else {
      newParams.delete('minDiscount');
      newParams.delete('discount');
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setPriceRange(300000);
    setSelectedDiscount('');
    setMinRating('');
    dispatch(resetFilters());
    setSearchParams({});
    dispatch(fetchProducts());
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    dispatch(setFilter({ sort: newSort }));
    const newParams = new URLSearchParams(searchParams);
    if (newSort && newSort !== 'newest') {
      newParams.set('sort', newSort);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  // Rank products using client relevance algorithm if search query is active
  const rankedProducts = useMemo(() => {
    if (!filters.search || !filters.search.trim()) {
      return products;
    }
    return rankProducts(products, filters.search);
  }, [products, filters.search]);

  // Apply combined facet filters (Category + Price Range + Discount + Rating)
  const filteredProducts = useMemo(() => {
    return rankedProducts.filter(product => {
      // 1. Category Filter using centralized mapping
      if (filters.category && filters.category.trim() !== '') {
        const matches = matchesCategoryFilter(
          getProductCategory(product),
          product.subcategory,
          filters.category
        );
        if (!matches) return false;
      }

      // 2. Price Filter
      const price = Number(product.price);
      if (!isNaN(price)) {
        if (filters.maxPrice) {
          const maxP = Number(filters.maxPrice);
          if (!isNaN(maxP) && price > maxP) return false;
        }
        if (filters.minPrice) {
          const minP = Number(filters.minPrice);
          if (!isNaN(minP) && price < minP) return false;
        }
      }

      // 3. Discount Filter (10%+, 20%+, etc.)
      if (filters.minDiscount && filters.minDiscount.trim() !== '') {
        const targetDisc = Number(filters.minDiscount);
        const prodDisc = Number(product.discountPercent ?? (
          product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0
        ));
        if (!isNaN(targetDisc) && prodDisc < targetDisc) return false;
      }

      // 4. Rating Filter
      if (filters.rating) {
        const targetRating = Number(filters.rating);
        const prodRating = Number(product.ratings ?? product.rating ?? 0);
        if (!isNaN(targetRating) && prodRating < targetRating) return false;
      }

      return true;
    });
  }, [rankedProducts, filters.category, filters.maxPrice, filters.minPrice, filters.minDiscount, filters.rating]);

  // Sorting Pipeline
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (filters.sort === 'price-asc') return list.sort((a, b) => Number(a.price) - Number(b.price));
    if (filters.sort === 'price-desc') return list.sort((a, b) => Number(b.price) - Number(a.price));
    if (filters.sort === 'rating') return list.sort((a, b) => Number(b.ratings ?? b.rating ?? 0) - Number(a.ratings ?? a.rating ?? 0));
    if (filters.sort === 'discount') {
      return list.sort((a, b) => {
        const discA = Number(a.discountPercent ?? (a.originalPrice > a.price ? Math.round(((a.originalPrice - a.price) / a.originalPrice) * 100) : 0));
        const discB = Number(b.discountPercent ?? (b.originalPrice > b.price ? Math.round(((b.originalPrice - b.price) / b.originalPrice) * 100) : 0));
        return discB - discA;
      });
    }
    
    // Default: keep relevance order if search exists, otherwise newest
    if (filters.search && filters.search.trim()) {
      return list;
    }
    return list.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
  }, [filteredProducts, filters.sort, filters.search]);

  return (
    <div className="container" style={{ margin: '2rem auto' }}>
      
      {/* Active Category / Search Query Banner */}
      {(filters.category || filters.search || filters.minDiscount) && (
        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #bfdbfe', borderRadius: 16, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Sparkles size={18} color="#2563eb" />
            <span style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
              Showing results for {filters.category ? <span>Category: <strong>"{filters.category}"</strong></span> : null}
              {filters.category && (filters.search || filters.minDiscount) ? ' • ' : null}
              {filters.search ? <span>Search: <strong>"{filters.search}"</strong></span> : null}
              {filters.search && filters.minDiscount ? ' • ' : null}
              {filters.minDiscount ? <span>Discount: <strong>"{filters.minDiscount}% or more"</strong></span> : null}
            </span>
          </div>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        
        {/* Sidebar Facet Filters */}
        <aside style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              <Filter size={18} /> Filters
            </div>
            <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
              <RefreshCcw size={12} /> Clear All
            </button>
          </div>

          {/* Dynamic Category Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>Categories</h4>
              {selectedCategory && (
                <button onClick={() => handleCategorySelect('')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                  All Products
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#475569', maxHeight: 260, overflowY: 'auto' }}>
              {dynamicCategories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <label 
                    key={cat || 'all'} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#2563eb' : '#475569',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      padding: '0.3rem 0.5rem',
                      borderRadius: 8
                    }}
                  >
                    <input 
                      type="radio" 
                      name="category" 
                      checked={isSelected}
                      onChange={() => handleCategorySelect(cat)}
                      style={{ accentColor: '#2563eb' }}
                    />
                    {cat || 'All Categories'}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 600 }}>Max Price</span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>{formatINR(priceRange)}</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="300000" 
              step="1000" 
              value={priceRange}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceRange(val);
                dispatch(setFilter({ maxPrice: val }));
                const newParams = new URLSearchParams(searchParams);
                newParams.set('maxPrice', val);
                setSearchParams(newParams);
              }}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>

          {/* Discount Filter (Replaces Brands) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <Percent size={15} color="#2563eb" />
              <h4 style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>Discount</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
              {DISCOUNT_OPTIONS.map(opt => {
                const isSelected = selectedDiscount === opt.value;
                return (
                  <label 
                    key={opt.value || 'all'}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#2563eb' : '#475569',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      padding: '0.3rem 0.5rem',
                      borderRadius: 8
                    }}
                  >
                    <input 
                      type="radio" 
                      name="discount" 
                      checked={isSelected}
                      onChange={() => handleDiscountSelect(opt.value)}
                      style={{ accentColor: '#2563eb' }}
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.6rem' }}>Minimum Rating</h4>
            <select 
              value={minRating} 
              onChange={(e) => { 
                const val = e.target.value;
                setMinRating(val); 
                dispatch(setFilter({ rating: val })); 
              }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="">Any Rating</option>
              <option value="4.8">⭐⭐⭐⭐⭐ 4.8 & Above</option>
              <option value="4.5">⭐⭐⭐⭐ 4.5 & Above</option>
              <option value="4.0">⭐⭐⭐⭐ 4.0 & Above</option>
            </select>
          </div>

        </aside>

        {/* Main Catalog View */}
        <main>
          {/* Header Controls Bar */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Showing <strong>{sortedProducts.length}</strong> of <strong>{products.length}</strong> Products
              {selectedCategory && <span style={{ marginLeft: 8, color: '#2563eb', fontWeight: 700 }}>({selectedCategory})</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Sort By:</span>
              <select 
                value={filters.sort || 'newest'} 
                onChange={handleSortChange}
                style={{ padding: '0.55rem 0.9rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#f8fafc', fontWeight: 600 }}
              >
                <option value="relevance">Relevance & Best Match</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {/* Network/API Error Banner */}
          {error ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#fef2f2', borderRadius: 16, border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
              <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#991b1b' }}>Unable to load products</h3>
              <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: 4 }}>
                {error || 'Please check your connection and try again.'}
              </p>
              <button onClick={() => dispatch(fetchProducts(filters))} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Retry Loading
              </button>
            </div>
          ) : loading && products.length === 0 ? (
            /* Loading Skeleton Grid */
            <div className="grid-products">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="skeleton" style={{ height: 320, borderRadius: 16 }} />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            /* Empty State Screen */
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No products match your selected filters.</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}>
                Try adjusting your price range, choosing another discount tier, or selecting another category.
              </p>
              <button onClick={handleReset} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid-products">
              {sortedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default ShopPage;
