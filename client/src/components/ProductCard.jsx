import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Heart, Star, Scale, Check, Eye } from 'lucide-react';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { toggleCompareProduct } from '../redux/slices/compareSlice';
import { showToast } from '../redux/slices/toastSlice';
import QuickViewModal from './QuickViewModal';

import { formatINR } from '../utils/formatCurrency';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const wishlistItems = useSelector(state => state.wishlist.items);
  const compareItems = useSelector(state => state.compare.selectedProducts);

  const isWishlisted = wishlistItems.some(item => item._id === product._id);
  const isCompared = compareItems.some(item => item._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    dispatch(showToast({
      message: `Added "${product.name}" to your cart!`,
      type: 'success',
      icon: '🛒'
    }));
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isWishlisted;
    dispatch(toggleWishlist(product));
    dispatch(showToast({
      message: nextState ? `Added "${product.name}" to your wishlist!` : `Removed "${product.name}" from wishlist`,
      type: nextState ? 'success' : 'info',
      icon: nextState ? '❤️' : '💔'
    }));
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isCompared;
    dispatch(toggleCompareProduct(product));
    dispatch(showToast({
      message: nextState ? `Added "${product.name}" to compare matrix!` : `Removed "${product.name}" from compare matrix`,
      type: 'info',
      icon: '⚖️'
    }));
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
      }}
      >
        {/* Top Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {product.discountPercent > 0 && (
            <span className="badge badge-sale">-{product.discountPercent}% OFF</span>
          )}
          {product.isFeatured && (
            <span className="badge badge-primary">FEATURED</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            background: 'white',
            border: 'none',
            borderRadius: 9999,
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            color: isWishlisted ? '#ef4444' : '#64748b'
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
        </button>

        {/* Image Thumbnail with Quick View Hover Overlay */}
        <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: '#f8fafc' }}>
          <Link to={`/product/${product._id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            <img 
              src={product.thumbnail || product.images?.[0] || DEFAULT_FALLBACK_IMAGE} 
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_FALLBACK_IMAGE;
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </Link>

          {/* Quick View Button Overlay */}
          <button
            onClick={handleOpenQuickView}
            style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.85)',
              color: 'white',
              border: 'none',
              borderRadius: 20,
              padding: '0.4rem 0.9rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)'}
          >
            <Eye size={14} /> Quick View
          </button>
        </div>

        {/* Details Container */}
        <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700 }}>
                <Star size={13} fill="#f59e0b" /> {product.ratings || 4.5} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({product.numOfReviews || 0})</span>
              </span>
            </div>

            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.4rem', height: 38, overflow: 'hidden' }}>
                {product.name}
              </h3>
            </Link>

            <p style={{ fontSize: '0.8rem', color: '#64748b', height: 34, overflow: 'hidden', marginBottom: '0.5rem', lineHeight: 1.4 }}>
              {product.shortDescription || product.description}
            </p>

            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, marginBottom: '0.75rem' }}>
              🚚 FREE Delivery Tomorrow to Metro Cities
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.9rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
              <button 
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ padding: '0.55rem', fontSize: '0.825rem', borderRadius: 10 }}
              >
                <ShoppingBag size={15} /> Add to Cart
              </button>

              <button 
                onClick={handleToggleCompare}
                style={{
                  background: isCompared ? '#eff6ff' : '#f1f5f9',
                  border: isCompared ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '0.55rem',
                  color: isCompared ? '#2563eb' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Add to Compare"
              >
                {isCompared ? <Check size={16} /> : <Scale size={16} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};

export default ProductCard;

