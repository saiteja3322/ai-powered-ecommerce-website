import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingBag, Heart, Sparkles, Search, User, LogOut, ChevronDown, Scale, Tag, Layers, ArrowRight 
} from 'lucide-react';
import { toggleChatbot, parseSmartSearch } from '../redux/slices/aiSlice';
import { setFilter, fetchProducts } from '../redux/slices/productSlice';
import { switchRole, logout } from '../redux/slices/authSlice';
import { openCompareModal } from '../redux/slices/compareSlice';
import api from '../services/api';
import MegaMenu from './MegaMenu';
import { formatINR } from '../utils/formatCurrency';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const compareItems = useSelector(state => state.compare.selectedProducts);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const searchContainerRef = useRef(null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Debounced Search Suggestions Fetcher
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSuggestLoading(true);
        const data = await api.get(`/products/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        if (data && data.suggestions) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSuggestLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search autocomplete modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = async (queryText) => {
    const query = queryText.trim();
    setShowSuggestions(false);

    if (!query) {
      dispatch(setFilter({ search: '', category: '' }));
      dispatch(fetchProducts({ search: '' }));
      navigate('/shop');
      return;
    }

    const isNL = query.toLowerCase().includes('under') || query.toLowerCase().includes('suggest best');
    
    if (isNL) {
      try {
        const parsed = await dispatch(parseSmartSearch(query)).unwrap();
        const searchFilterObj = {
          search: parsed.searchTerm || query,
          category: parsed.category || '',
          maxPrice: parsed.maxPrice || '',
          sort: parsed.sort || 'newest'
        };
        dispatch(setFilter(searchFilterObj));
        dispatch(fetchProducts(searchFilterObj));
      } catch (err) {
        dispatch(setFilter({ search: query, category: '' }));
        dispatch(fetchProducts({ search: query }));
      }
    } else {
      // Clear category when searching fresh keyword unless specified
      dispatch(setFilter({ search: query, category: '' }));
      dispatch(fetchProducts({ search: query }));
    }

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    if (item.type === 'product') {
      navigate(`/product/${item.id}`);
    } else if (item.type === 'category') {
      dispatch(setFilter({ category: item.text, search: '' }));
      dispatch(fetchProducts({ category: item.text }));
      navigate(`/shop?category=${encodeURIComponent(item.text)}`);
    } else if (item.type === 'brand') {
      dispatch(setFilter({ brand: item.text, search: '' }));
      dispatch(fetchProducts({ brand: item.text }));
      navigate(`/shop?brand=${encodeURIComponent(item.text)}`);
    }
  };

  const handleToggleAdmin = () => {
    const newRole = user?.role === 'admin' ? 'customer' : 'admin';
    dispatch(switchRole(newRole));
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0' }}>
      {/* Top Banner Announcement */}
      <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)', color: '#94a3b8', fontSize: '0.8rem', padding: '0.4rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            🔥 <strong>FESTIVE DHAMAKA:</strong> Up to 50% OFF + 10% Instant Discount on HDFC & SBI Cards. Code: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>SAVE20</span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {user && (
              <span style={{ cursor: 'pointer', color: user?.role === 'admin' ? '#38bdf8' : 'white', fontWeight: 600 }} onClick={handleToggleAdmin}>
                🛡️ View Mode: <span style={{ textDecoration: 'underline' }}>{user?.role === 'admin' ? 'ADMIN DASHBOARD' : 'CUSTOMER STORE'}</span> (Click to switch)
              </span>
            )}
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span>🇮🇳 FREE Shipping over ₹499</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem', gap: '1.5rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
            O
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>OmniStore</span>
            <span style={{ fontSize: '0.7rem', display: 'block', color: '#2563eb', fontWeight: 700, marginTop: -4, letterSpacing: '0.1em' }}>INDIA AI</span>
          </div>
        </Link>

        {/* Category & Mega Menu Trigger */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
            className="btn btn-outline"
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
          >
            Categories <ChevronDown size={16} />
          </button>
          {isMegaMenuOpen && <MegaMenu onClose={() => setIsMegaMenuOpen(false)} />}
        </div>

        {/* Smart Search Bar with Autocomplete Suggestions */}
        <div ref={searchContainerRef} style={{ flex: 1, maxWidth: 520, position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search products, brands e.g. 'iPhone 15', 'samsng', 'mac'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
              style={{ width: '100%', padding: '0.65rem 3rem 0.65rem 2.8rem', borderRadius: 9999, border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s', background: '#f8fafc' }}
            />
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <button type="submit" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', borderRadius: 9999, padding: '0.35rem 0.8rem', border: 'none', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
              <Sparkles size={13} /> Ask AI
            </button>
          </form>

          {/* Autocomplete Dropdown Modal */}
          {showSuggestions && (
            <div style={{
              position: 'absolute',
              top: '115%',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              zIndex: 300,
              maxHeight: 380,
              overflowY: 'auto'
            }}>
              {isSuggestLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  Searching suggestions...
                </div>
              ) : suggestions.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  Press Enter to search for <strong>"{searchQuery}"</strong>
                </div>
              ) : (
                <div style={{ padding: '0.5rem 0' }}>
                  {suggestions.map((item, index) => {
                    if (item.type === 'category' || item.type === 'brand') {
                      return (
                        <div
                          key={`cat_b_${index}`}
                          onClick={() => handleSuggestionClick(item)}
                          style={{
                            padding: '0.55rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'space-between',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                            {item.type === 'category' ? <Layers size={15} color="#2563eb" /> : <Tag size={15} color="#059669" />}
                            <span>Search in <strong>{item.text}</strong> ({item.type})</span>
                          </div>
                          <ArrowRight size={14} color="#94a3b8" />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`prod_${item.id}`}
                        onClick={() => handleSuggestionClick(item)}
                        style={{
                          padding: '0.6rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <img 
                          src={item.thumbnail} 
                          alt={item.text} 
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} 
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.text}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {item.brand} • {item.category}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                          {formatINR(item.price)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Icons & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          {/* AI Floating Chatbot Trigger */}
          <button 
            onClick={() => dispatch(toggleChatbot())}
            className="btn btn-ai"
            style={{ padding: '0.5rem 0.9rem', borderRadius: 9999, fontSize: '0.8rem' }}
            title="Open AI Shopping Assistant"
          >
            <Sparkles size={16} /> AI Support
          </button>

          {/* AI Product Compare Indicator */}
          {compareItems.length > 0 && (
            <button 
              onClick={() => dispatch(openCompareModal())} 
              style={{ position: 'relative', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.5rem', color: '#2563eb' }}
              title="Compare selected products"
            >
              <Scale size={20} />
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#2563eb', color: 'white', fontSize: '0.7rem', fontWeight: 700, borderRadius: 9999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {compareItems.length}
              </span>
            </button>
          )}

          {/* Wishlist */}
          <Link to={user ? "/user/dashboard" : "/login"} style={{ position: 'relative', color: '#0f172a' }} title="Wishlist">
            <Heart size={22} />
            {wishlistItems.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -8, background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, borderRadius: 9999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" style={{ position: 'relative', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }} title="Cart">
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={22} />
              {totalCartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: '#2563eb', color: 'white', fontSize: '0.7rem', fontWeight: 700, borderRadius: 9999, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalCartCount}
                </span>
              )}
            </div>
          </Link>

          {/* User Account / Login Button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 9999, padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
              >
                <User size={18} color="#0f172a" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</span>
              </button>

              {isProfileOpen && (
                <div style={{ position: 'absolute', right: 0, top: '120%', background: 'white', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', width: 200, padding: '0.5rem 0', zIndex: 200 }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</p>
                    <span className="badge badge-primary" style={{ marginTop: 6, fontSize: '0.65rem' }}>{user.role?.toUpperCase()}</span>
                  </div>
                  
                  <Link to="/user/dashboard" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#0f172a' }}>
                    📦 My Orders & Profile
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, background: '#eff6ff' }}>
                      ⚡ Admin Analytics & Products
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
                    <button 
                      onClick={() => { dispatch(logout()); setIsProfileOpen(false); navigate('/login'); }}
                      style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#ef4444', background: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', cursor: 'pointer' }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', borderRadius: 9999 }}>
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;
