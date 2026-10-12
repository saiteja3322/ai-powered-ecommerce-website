import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Clock } from 'lucide-react';

const slides = [
  {
    title: "Next-Gen Apple MacBook Pro M3 Max",
    subtitle: "Enterprise Creative Workstation",
    description: "40-core GPU, 36GB Unified Memory, up to 22 hrs battery life. Powered by AI content engines.",
    price: "₹1,54,900",
    originalPrice: "₹1,74,900",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    badge: "AI RECOMMENDED TOP PICK",
    category: "Laptops"
  },
  {
    title: "Sony WH-1000XM5 Wireless ANC",
    subtitle: "Pure Audio Perfection",
    description: "Auto NC Optimizer with V1 processor, 30-hour battery life, and crystal clear calling technology.",
    price: "₹24,990",
    originalPrice: "₹29,990",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    badge: "BEST SELLER 2026",
    category: "Electronics"
  },
  {
    title: "Nike Air Max Pulse Runner",
    subtitle: "Streetwear meets Speed",
    description: "Point-loaded Air cushioning for high-resilience energy return and lightweight breathability.",
    price: "₹11,995",
    originalPrice: "₹13,995",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    badge: "HOT FESTIVE DEAL",
    category: "Shoes"
  }
];

const HeroBanner = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Flash Sale Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section style={{ margin: '1.5rem 0' }}>
      <div className="container">
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #090d16 100%)',
          borderRadius: 24,
          padding: '3rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2rem',
          alignItems: 'center'
        }}>
          
          {/* Ambient Glow Effects */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

          {/* Left Text Content */}
          <div style={{ zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-ai">
                <Sparkles size={12} /> {slide.badge}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: 9999, fontSize: '0.75rem', color: '#93c5fd' }}>
                <Clock size={13} /> Flash Sale ends in: <strong>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</strong>
              </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, fontWeight: 800, color: 'white', marginBottom: '0.75rem', fontFamily: 'Outfit' }}>
              {slide.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.5rem' }}>
              {slide.subtitle}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: 480 }}>
              {slide.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.8rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'Outfit' }}>{slide.price}</span>
              <span style={{ fontSize: '1.2rem', color: '#64748b', textDecoration: 'line-through' }}>{slide.originalPrice}</span>
              <span className="badge badge-sale">SAVE 15% TODAY</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/shop')} 
                className="btn btn-primary"
                style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem', borderRadius: 12 }}
              >
                Shop Now <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/shop')} 
                className="btn btn-outline"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', padding: '0.8rem 1.4rem', borderRadius: 12 }}
              >
                Explore Catalog
              </button>
            </div>
          </div>

          {/* Right Image Showcase */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <img 
                src={slide.image} 
                alt={slide.title}
                style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }} 
              />
            </div>
          </div>

          {/* Carousel Dots */}
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 3 }}>
            {slides.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? 28 : 10,
                  height: 8,
                  borderRadius: 9999,
                  background: idx === currentSlide ? '#3b82f6' : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>

        </div>

        {/* Enterprise Value Props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.6rem', borderRadius: 12 }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 2 }}>FREE Express Shipping</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>On orders over ₹499 in India</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.6rem', borderRadius: 12 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 2 }}>Official Indian Warranty</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>100% Genuine with GST Invoice</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#faf5ff', color: '#9333ea', padding: '0.6rem', borderRadius: 12 }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 2 }}>7-Day Replacement</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Doorstep pickup & instant replacement</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroBanner;
