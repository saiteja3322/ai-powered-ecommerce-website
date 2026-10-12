import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Shield, Lock, CreditCard, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: 'white', paddingTop: '4rem', paddingBottom: '2rem', marginTop: '4rem', borderTop: '1px solid #1e293b' }}>
      <div className="container">
        
        {/* Main Footer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Col 1: Brand & Newsletter */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ background: '#2563eb', color: 'white', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                O
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit' }}>OmniStore AI</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.2rem' }}>
              Next-generation enterprise e-commerce platform powered by Google Gemini & OpenAI.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="email" 
                placeholder="Your email address" 
                style={{ padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: 'white', fontSize: '0.8rem', outline: 'none', flex: 1 }}
              />
              <button className="btn btn-primary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.8rem' }}>
                Subscribe
              </button>
            </div>
          </div>

          {/* Col 2: Shop Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1.2rem' }}>Trending Categories</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <li><Link to="/shop?category=Mobiles">5G Mobiles & iPhones</Link></li>
              <li><Link to="/shop?category=Laptops">Gaming & Work Laptops</Link></li>
              <li><Link to="/shop?category=Electronics">ANC Audio & Wearables</Link></li>
              <li><Link to="/shop?category=Fashion">Men & Women Fashion</Link></li>
              <li><Link to="/shop?category=Home%20Appliances">Home & Smart Kitchen</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1.2rem' }}>Customer Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <li><Link to="/user/dashboard">Order Tracking & History</Link></li>
              <li><Link to="/user/dashboard">Saved Wishlist</Link></li>
              <li><a href="#returns">7-Day Replacement Guarantee</a></li>
              <li><a href="#gst">GST Invoice Tax Support</a></li>
              <li><a href="#contact">Contact 24/7 Helpline</a></li>
            </ul>
          </div>

          {/* Col 4: Enterprise Security & Payments */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1.2rem' }}>Accepted Payments</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span style={{ background: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: 6, color: '#38bdf8' }}>UPI / Google Pay</span>
              <span style={{ background: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: 6, color: '#a855f7' }}>PhonePe / Paytm</span>
              <span style={{ background: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: 6, color: '#4ade80' }}>Net Banking</span>
              <span style={{ background: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: 6, color: '#f97316' }}>Cash on Delivery</span>
              <span style={{ background: '#1e293b', padding: '0.35rem 0.65rem', borderRadius: 6, color: '#facc15' }}>No-Cost EMI</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Lock size={13} color="#16a34a" /> 256-Bit SSL Encrypted Payment Gateway
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            © {new Date().getFullYear()} OmniStore India Pvt Ltd. GSTIN: 29AAAAA0000A1Z5. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#gst">GST Tax Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
