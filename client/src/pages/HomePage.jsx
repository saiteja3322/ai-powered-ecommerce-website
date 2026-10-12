import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { fetchProducts, setFilter } from '../redux/slices/productSlice';
import { Sparkles, ArrowRight, TrendingUp, Award, Star, ShieldCheck, Zap } from 'lucide-react';

const brands = [
  { name: 'Apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300' },
  { name: 'Sony', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' },
  { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300' },
  { name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
  { name: 'Adidas', logo: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300' }
];

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const trendingProducts = products.filter(p => p.isTrending || p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const flashSaleProducts = products.filter(p => p.isFlashSale).slice(0, 4);

  const handleCategoryClick = (catName) => {
    dispatch(setFilter({ category: catName }));
    dispatch(fetchProducts());
    navigate(`/shop?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div>
      {/* Hero Banner Carousel */}
      <HeroBanner />

      <div className="container">
        
        {/* Quick Categories Icons Strip */}
        <section style={{ margin: '1.5rem 0 2.5rem 0', background: 'white', borderRadius: 16, padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.4rem', justifyContent: 'flex-start' }}>
            {[
              { name: 'Mobiles', icon: '📱', color: '#eff6ff' },
              { name: 'Laptops', icon: '💻', color: '#f0fdf4' },
              { name: 'Electronics', icon: '🎧', color: '#faf5ff' },
              { name: 'Gaming', icon: '🎮', color: '#fff7ed' },
              { name: 'Fashion', icon: '👕', color: '#fdf2f8' },
              { name: 'Shoes', icon: '👟', color: '#f1f5f9' },
              { name: 'Watches', icon: '⌚', color: '#eff6ff' },
              { name: 'Kitchen', icon: '🍳', color: '#fff7ed' },
              { name: 'Furniture', icon: '🛋️', color: '#fefce8' },
              { name: 'Beauty', icon: '✨', color: '#fdf2f8' },
              { name: 'Sports', icon: '⚽', color: '#f0fdf4' },
              { name: 'Books', icon: '📚', color: '#eff6ff' },
              { name: 'Home Appliances', icon: '📺', color: '#f0fdf4' }
            ].map(cat => (
              <div 
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 85, cursor: 'pointer', textAlign: 'center' }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 9999, background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 6, border: '1px solid #e2e8f0', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {cat.icon}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bank Offers Promotional Banner */}
        <section style={{ margin: '2rem 0', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', borderRadius: 16, padding: '1.25rem 2rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 8px 20px rgba(37,99,235,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1rem', borderRadius: 12, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>
              💳 BANK OFFER
            </div>
            <div>
              <h3 style={{ color: 'white', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>10% Instant Discount on HDFC & SBI Bank Credit/Debit Cards</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#bfdbfe' }}>Min order ₹4,999 • Max discount ₹1,500 • No Cost EMI Available on leading banks</p>
            </div>
          </div>
          <button onClick={() => navigate('/shop')} className="btn btn-dark" style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem', background: 'white', color: '#1e3a8a', fontWeight: 700, border: 'none', borderRadius: 10 }}>
            Shop Festive Deals
          </button>
        </section>

        {/* AI Personalized Recommendations Section */}
        <section style={{ margin: '3.5rem 0', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 24, padding: '2.5rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>
                <Sparkles size={12} /> PERSONALIZED FOR YOU
              </span>
              <h2 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>AI Smart Recommendations</h2>
            </div>
            <button onClick={() => navigate('/shop')} className="btn btn-ai" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Explore AI Recommendations
            </button>
          </div>

          <div className="grid-products">
            {(trendingProducts.length > 0 ? trendingProducts : products.slice(0, 4)).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Flash Sale Banner Grid */}
        <section style={{ margin: '3.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Zap size={24} color="#ef4444" fill="#ef4444" />
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Deals of the Day & Flash Sales</h2>
          </div>

          <div className="grid-products">
            {(flashSaleProducts.length > 0 ? flashSaleProducts : products.slice(0, 4)).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Best Sellers Grid */}
        <section style={{ margin: '3.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Award size={24} color="#2563eb" />
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Bestsellers of India</h2>
          </div>

          <div className="grid-products">
            {(bestSellers.length > 0 ? bestSellers : products.slice(0, 4)).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section style={{ margin: '3.5rem 0', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 2.5rem auto' }}>
            <span className="badge badge-primary">VERIFIED BUYERS</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: 6, marginBottom: 8 }}>Loved by Shoppers Across India</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Over 50,000+ verified customer reviews with 99.4% satisfaction score in Bengaluru, Mumbai, Delhi & Hyderabad.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.6rem' }}>
                <Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem', fontStyle: 'italic' }}>
                "The AI natural language search made finding a 5G phone under ₹30,000 so fast. Delivered to Bengaluru in 1 day!"
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Rajesh Sharma</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Software Engineer, Bengaluru</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.6rem' }}>
                <Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem', fontStyle: 'italic' }}>
                "The GST invoice feature for tax claim and No-Cost EMI options on UPI made buying my MacBook Pro super convenient."
              </p>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Ananya Rao</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Design Director, Mumbai</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
