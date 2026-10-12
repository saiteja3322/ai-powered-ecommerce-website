import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { toggleCompareProduct } from '../redux/slices/compareSlice';
import { showToast } from '../redux/slices/toastSlice';
import AIReviewSummaryCard from '../components/AIReviewSummaryCard';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Star, Heart, Scale, ShoppingBag, Truck, ShieldCheck, Check, Sparkles } from 'lucide-react';

import { formatINR } from '../utils/formatCurrency';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedProduct: product, items: allProducts, loading } = useSelector(state => state.products);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const compareItems = useSelector(state => state.compare.selectedProducts);

  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [reviews, setReviews] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.thumbnail || product.images?.[0]);
      if (product.availableColors && product.availableColors.length > 0) {
        setSelectedColor(product.availableColors[0]);
      }
      if (product.availableSizes && product.availableSizes.length > 0) {
        setSelectedSize(product.availableSizes[0]);
      }
      // Fetch reviews & AI summary
      api.get(`/reviews/product/${product._id}`)
        .then(res => setReviews(res.reviews || []))
        .catch(() => {});

      api.get(`/reviews/product/${product._id}/ai-summary`)
        .then(res => setAiSummary(res.summary))
        .catch(() => setAiSummary(product.aiSummary));
    }
  }, [product]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 20 }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', background: 'white', borderRadius: 24, margin: '3rem auto', border: '1px solid #e2e8f0', maxWidth: 600 }}>
        <div style={{ background: '#fef2f2', color: '#ef4444', width: 64, height: 64, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Sparkles size={32} />
        </div>
        <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '0.5rem' }}>Product Not Found</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          The product you are looking for may have been removed, deleted by the admin, or is currently unavailable.
        </p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', borderRadius: 12 }}>
          Back to Shop Catalog
        </button>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some(item => item._id === product._id);
  const isCompared = compareItems.some(item => item._id === product._id);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity, selectedColor, selectedSize }));
    dispatch(showToast({
      message: `Added ${quantity} unit(s) of "${product.name}" to your cart!`,
      type: 'success',
      icon: '🛒'
    }));
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity, selectedColor, selectedSize }));
    dispatch(showToast({
      message: `Proceeding to checkout with "${product.name}"...`,
      type: 'info',
      icon: '⚡'
    }));
    navigate('/checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: newRating,
        title: newTitle || 'Great Product',
        comment: newComment
      });
      setReviews([res.review, ...reviews]);
      setNewComment('');
      setNewTitle('');
    } catch (err) {
      alert('Error submitting review: ' + err.message);
    }
  };

  const relatedProducts = allProducts.filter(p => p.category === product.category && p._id !== product._id).slice(0, 4);
  const frequentlyBoughtTogether = allProducts.filter(p => p._id !== product._id).slice(0, 2);

  const bundleTotal = product.price + frequentlyBoughtTogether.reduce((s, p) => s + p.price, 0);

  const handleAddBundleToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    frequentlyBoughtTogether.forEach(p => dispatch(addToCart({ ...p, quantity: 1 })));
    dispatch(showToast({
      message: `Added complete 3-item bundle to your cart!`,
      type: 'success',
      icon: '📦'
    }));
  };

  return (
    <div className="container" style={{ margin: '2.5rem auto' }}>
      
      {/* Product Top Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: 'white', padding: '2.5rem', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        {/* Left Column: Image Gallery */}
        <div>
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0', height: 420, marginBottom: '1rem', background: '#f8fafc' }}>
            <img 
              src={activeImage || product.thumbnail || DEFAULT_FALLBACK} 
              alt={product.name} 
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {product.images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: activeImage === img ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    opacity: activeImage === img ? 1 : 0.6
                  }}
                >
                  <img src={img} alt="thumb" onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & CTAs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">{product.brand}</span>
            <span className="badge badge-success">{product.category}</span>
            <span className="badge badge-ai">GST INVOICE AVAILABLE</span>
            {product.stock > 0 ? (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>In Stock ({product.stock} units left)</span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>Out of Stock</span>
            )}
          </div>

          <h1 style={{ fontSize: '1.8rem', lineHeight: 1.25, color: '#0f172a', marginBottom: '0.75rem' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              <Star size={18} fill="#f59e0b" /> <Star size={18} fill="#f59e0b" /> <Star size={18} fill="#f59e0b" /> <Star size={18} fill="#f59e0b" /> <Star size={18} fill="#f59e0b" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{product.ratings} / 5</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({product.numOfReviews || reviews.length} verified customer reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span style={{ fontSize: '1.2rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                {formatINR(product.originalPrice)}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="badge badge-sale">SAVE {product.discountPercent}% TODAY</span>
            )}
          </div>

          {/* Indian EMI & Delivery highlights */}
          <div style={{ background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.825rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 4, fontWeight: 700, color: '#2563eb' }}>
              💳 No-Cost EMI starting from {formatINR(Math.round(product.price / 12))}/month
            </div>
            <div style={{ color: '#16a34a', fontWeight: 600 }}>
              🚚 FREE Delivery Tomorrow to Bengaluru, Mumbai, Delhi & Metro cities
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {product.description}
          </p>

          {/* Available Colors Selector */}
          {product.availableColors && product.availableColors.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Select Color: <span style={{ color: '#2563eb' }}>{selectedColor}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.availableColors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: 10,
                      fontSize: '0.825rem',
                      border: selectedColor === color ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selectedColor === color ? '#eff6ff' : 'white',
                      color: selectedColor === color ? '#2563eb' : '#334155',
                      fontWeight: selectedColor === color ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Sizes / Variants Selector */}
          {product.availableSizes && product.availableSizes.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Select Size / Variant: <span style={{ color: '#2563eb' }}>{selectedSize}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.availableSizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: 10,
                      fontSize: '0.825rem',
                      border: selectedSize === size ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selectedSize === size ? '#eff6ff' : 'white',
                      color: selectedSize === size ? '#2563eb' : '#334155',
                      fontWeight: selectedSize === size ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Features Bullet List */}
          {product.features && product.features.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '1rem 1.2rem', borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={16} color="#16a34a" /> Key Highlights & Features
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {product.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 12, overflow: 'hidden' }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.6rem 0.9rem', background: '#f8fafc', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}
              >-</button>
              <span style={{ padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.95rem' }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '0.6rem 0.9rem', background: '#f8fafc', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}
              >+</button>
            </div>

            <button onClick={handleAddToCart} className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem', flex: 1, borderRadius: 12 }}>
              <ShoppingBag size={18} /> Add to Cart
            </button>

            <button onClick={handleBuyNow} className="btn btn-dark" style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem', borderRadius: 12 }}>
              Buy Now
            </button>
          </div>

          {/* Wishlist & Compare Quick Buttons */}
          <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', fontSize: '0.85rem' }}>
            <button 
              onClick={() => {
                const nextState = !isWishlisted;
                dispatch(toggleWishlist(product));
                dispatch(showToast({
                  message: nextState ? `Saved "${product.name}" to your wishlist!` : `Removed "${product.name}" from wishlist`,
                  type: nextState ? 'success' : 'info',
                  icon: nextState ? '❤️' : '💔'
                }));
              }} 
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: isWishlisted ? '#ef4444' : '#64748b', cursor: 'pointer', fontWeight: 600 }}
            >
              <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} /> {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            </button>

            <button onClick={() => dispatch(toggleCompareProduct(product))} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: isCompared ? '#2563eb' : '#64748b', cursor: 'pointer', fontWeight: 600 }}>
              <Scale size={18} /> {isCompared ? 'Added to Compare Matrix' : 'Compare Product'}
            </button>
          </div>

        </div>

      </div>

      {/* Frequently Bought Together Bundle */}
      {frequentlyBoughtTogether.length > 0 && (
        <section style={{ margin: '3rem 0', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#2563eb" /> Frequently Bought Together
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ textDecoration: 'none', textAlign: 'center', width: 120 }}>
                <img src={product.thumbnail} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid #cbd5e1', margin: '0 auto 4px auto' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'block', height: 32, overflow: 'hidden' }}>{product.name}</span>
                <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 800 }}>{formatINR(product.price)}</span>
              </div>

              {frequentlyBoughtTogether.map(p => (
                <React.Fragment key={p._id}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94a3b8' }}>+</span>
                  <div style={{ textAlign: 'center', width: 120 }}>
                    <img src={p.thumbnail} alt={p.name} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid #cbd5e1', margin: '0 auto 4px auto' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'block', height: 32, overflow: 'hidden' }}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 800 }}>{formatINR(p.price)}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem', marginLeft: 'auto' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Bundle Total Price:</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>{formatINR(bundleTotal)}</div>
              <button onClick={handleAddBundleToCart} className="btn btn-primary" style={{ marginTop: '0.75rem', padding: '0.6rem 1.2rem', fontSize: '0.85rem', borderRadius: 10 }}>
                Add All 3 to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* AI Sentiment & Review Summary */}
      <AIReviewSummaryCard summary={aiSummary || product.aiSummary} />

      {/* Specifications Table */}
      {product.specifications && product.specifications.length > 0 && (
        <section style={{ margin: '3rem 0', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Technical Specifications</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
            {product.specifications.map((spec, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>{spec.key}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Write & View Customer Reviews */}
      <section style={{ margin: '3rem 0', background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Customer Reviews ({reviews.length})</h3>

        {/* Submit Form */}
        <form onSubmit={handleSubmitReview} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.8rem' }}>Write a Customer Review</h4>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rating:</label>
            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1' }}>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
            </select>
          </div>

          <input 
            type="text" 
            placeholder="Review Headline (e.g. Outstanding quality & fast delivery!)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: '0.8rem', fontSize: '0.85rem' }}
          />

          <textarea 
            rows="3" 
            placeholder="Write your honest detailed review..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: '1rem', fontSize: '0.85rem' }}
          />

          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
            Submit Review
          </button>
        </form>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((rev, idx) => (
            <div key={idx} style={{ padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{rev.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                {'★'.repeat(rev.rating)}
              </div>
              <h5 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.3rem' }}>{rev.title}</h5>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ margin: '3rem 0' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Related Products</h2>
          <div className="grid-products">
            {relatedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetailPage;
