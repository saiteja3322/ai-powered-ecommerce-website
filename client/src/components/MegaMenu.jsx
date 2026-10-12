import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setFilter, fetchProducts } from '../redux/slices/productSlice';
import { Laptop, Shirt, Footprints, Home, ArrowRight, Zap, Award } from 'lucide-react';

const MegaMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectCategory = (catName) => {
    dispatch(setFilter({ category: catName }));
    dispatch(fetchProducts());
    onClose();
    navigate(`/shop?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '110%',
      left: 0,
      width: 780,
      background: 'white',
      borderRadius: 16,
      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
      border: '1px solid #e2e8f0',
      padding: '1.5rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr) 220px',
      gap: '1.5rem',
      zIndex: 200,
      animation: 'modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Category 1 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#2563eb', fontWeight: 700 }}>
          <Laptop size={18} /> Electronics & Tech
        </div>
        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Laptops')}>Laptops & MacBooks</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Mobiles')}>Smartphones & 5G</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Headphones')}>Wireless Headphones & Earbuds</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Smartwatches')}>Smart Wearables</li>
        </ul>
      </div>

      {/* Category 2 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#0f172a', fontWeight: 700 }}>
          <Shirt size={18} /> Fashion & Footwear
        </div>
        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Fashion')}>Men & Women Fashion</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Shoes')}>Performance Running Shoes & Sneakers</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Beauty')}>Beauty & Personal Care</li>
        </ul>
      </div>

      {/* Category 3 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
          <Home size={18} /> Home, Furniture & Books
        </div>
        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Furniture')}>Office & Home Furniture</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Home & Kitchen')}>Kitchen & Home Appliances</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Books')}>Bestselling Books</li>
          <li style={{ cursor: 'pointer' }} onClick={() => handleSelectCategory('Gaming')}>Gaming Consoles & Gear</li>
        </ul>
      </div>

      {/* Promo Sidebar Callout */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 12, padding: '1rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <span className="badge badge-ai" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>
            <Zap size={10} /> AI Exclusive
          </span>
          <h5 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '0.4rem' }}>MacBook Pro M3</h5>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Get instant $300 off with code SAVE20</p>
        </div>
        <button 
          onClick={() => handleSelectCategory('Electronics')}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1rem', cursor: 'pointer' }}
        >
          Explore Tech <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default MegaMenu;
