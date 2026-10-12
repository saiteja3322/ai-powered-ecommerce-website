import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import api from '../services/api';
import { Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';

import { formatINR } from '../utils/formatCurrency';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, subtotal, tax, shipping, discount, grandTotal, coupon } = useSelector(state => state.cart);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await api.post('/coupons/validate', { code: couponCode, cartTotal: subtotal });
      dispatch(applyCoupon({
        code: res.code,
        discountType: res.discountType,
        discountValue: res.discountValue,
        discountAmount: res.discountAmount
      }));
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <div style={{ background: '#eff6ff', width: 80, height: 80, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#2563eb' }}>
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Explore our catalog for top laptops, smartphones, and fashion gear.</p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', borderRadius: 12 }}>
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '2.5rem auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Shopping Cart ({items.length} Items)</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Cart Items Table */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
          {items.map(item => (
            <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: '1.25rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
              
              <img 
                src={item.thumbnail || DEFAULT_FALLBACK} 
                alt={item.name} 
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }} 
              />

              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: 4 }}>{item.name}</h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Brand: {item.brand} | Category: {item.category}</p>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb', marginTop: 4, display: 'block' }}>{formatINR(item.price)}</span>
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))} style={{ padding: '0.3rem 0.6rem', background: '#f8fafc', border: 'none', fontWeight: 700, cursor: 'pointer' }}>-</button>
                <span style={{ padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>{item.quantity}</span>
                <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))} style={{ padding: '0.3rem 0.6rem', background: '#f8fafc', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>

              {/* Remove */}
              <button onClick={() => dispatch(removeFromCart(item._id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                <Trash2 size={18} />
              </button>

            </div>
          ))}

          {/* Coupon Code Input */}
          <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Tag size={16} color="#2563eb" /> Apply Promo Code or Gift Coupon
            </h4>

            {coupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.6rem 1rem', borderRadius: 10 }}>
                <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>
                  ✓ Coupon <strong>{coupon.code}</strong> applied (-{formatINR(discount)})
                </span>
                <button onClick={() => dispatch(removeCoupon())} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Try 'WELCOME100' or 'FESTIVE20' or 'FLAT1000'" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '0.55rem 0.9rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
                <button type="submit" disabled={couponLoading} className="btn btn-dark" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem', borderRadius: 10 }}>
                  Apply
                </button>
              </form>
            )}
            {couponError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 6 }}>{couponError}</p>}
          </div>

        </div>

        {/* Order Summary Box */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '1.5rem', height: 'fit-content', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>Order Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatINR(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GST Tax (18%):</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatINR(tax)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Charges:</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? '#16a34a' : '#0f172a' }}>
                {shipping === 0 ? 'FREE' : formatINR(shipping)}
              </span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                <span>Discount ({coupon?.code}):</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', borderTop: '2px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <span>Grand Total:</span>
              <span style={{ color: '#2563eb' }}>{formatINR(grandTotal)}</span>
            </div>
          </div>

          <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 12 }}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
