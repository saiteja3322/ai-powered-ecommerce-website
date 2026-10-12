import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Star, ShoppingBag, Heart, Check, ShieldCheck, Truck } from 'lucide-react';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { showToast } from '../redux/slices/toastSlice';
import { formatINR } from '../utils/formatCurrency';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

const QuickViewModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist.items);

  const [activeImage, setActiveImage] = useState(product?.thumbnail || product?.images?.[0] || DEFAULT_FALLBACK);
  const [selectedColor, setSelectedColor] = useState(product?.availableColors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.availableSizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isWishlisted = wishlistItems.some(item => item._id === product._id);

  const handleAddToCart = () => {
    dispatch(addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize
    }));
    dispatch(showToast({
      message: `Added "${product.name}" to your cart!`,
      type: 'success',
      icon: '🛒'
    }));
    onClose();
  };

  const handleToggleWishlist = () => {
    const nextState = !isWishlisted;
    dispatch(toggleWishlist(product));
    dispatch(showToast({
      message: nextState ? `Added "${product.name}" to wishlist!` : `Removed "${product.name}" from wishlist`,
      type: nextState ? 'success' : 'info',
      icon: nextState ? '❤️' : '💔'
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        maxWidth: 850,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        padding: '2rem'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
        >
          <X size={20} />
        </button>

        {/* Left Column: Image Gallery */}
        <div>
          <div style={{ borderRadius: 16, overflow: 'hidden', height: 320, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '0.8rem' }}>
            <img 
              src={activeImage} 
              alt={product.name}
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
              {product.images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
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

        {/* Right Column: Product Details & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-primary">{product.brand}</span>
              <span className="badge badge-success">{product.category}</span>
              {product.stock > 0 ? (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>In Stock</span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>Out of Stock</span>
              )}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
              {product.name}
            </h2>

            {/* Rating & Review Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                <Star size={16} fill="#f59e0b" /> {product.ratings || 4.5}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ({product.numOfReviews || 0} reviews)
              </span>
            </div>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="badge badge-sale">-{product.discountPercent}% OFF</span>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
              {product.shortDescription || product.description}
            </p>

            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div style={{ marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Color: <span style={{ color: '#2563eb' }}>{selectedColor}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {product.availableColors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        border: selectedColor === color ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedColor === color ? '#eff6ff' : 'white',
                        color: selectedColor === color ? '#2563eb' : '#334155',
                        fontWeight: selectedColor === color ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Size / Variant: <span style={{ color: '#2563eb' }}>{selectedSize}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {product.availableSizes.map((size, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        border: selectedSize === size ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedSize === size ? '#eff6ff' : 'white',
                        color: selectedSize === size ? '#2563eb' : '#334155',
                        fontWeight: selectedSize === size ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.4rem 0.7rem', background: '#f8fafc', border: 'none', fontWeight: 700, cursor: 'pointer' }}>-</button>
                <span style={{ padding: '0.4rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0.4rem 0.7rem', background: '#f8fafc', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', borderRadius: 10 }}
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>

              <button
                onClick={handleToggleWishlist}
                style={{
                  background: isWishlisted ? '#fef2f2' : '#f8fafc',
                  border: isWishlisted ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '0.6rem',
                  color: isWishlisted ? '#ef4444' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
              </button>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Truck size={14} /> FREE Express Delivery Available
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickViewModal;
