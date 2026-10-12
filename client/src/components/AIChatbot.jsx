import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Bot, User, RefreshCw, ShoppingBag, Eye, Star } from 'lucide-react';
import { toggleChatbot, sendChatMessage, clearChatHistory } from '../redux/slices/aiSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { showToast } from '../redux/slices/toastSlice';
import { formatINR } from '../utils/formatCurrency';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

const suggestionChips = [
  "Laptops under ₹50,000",
  "Samsung phones under ₹40,000",
  "Nike shoes under ₹5,000",
  "Smartwatches under ₹10,000"
];

const AIChatbot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isChatOpen, chatHistory, chatLoading, activeFilters } = useSelector(state => state.ai);
  const productFilters = useSelector(state => state.products.filters);

  const [input, setInput] = useState('');
  const [addedItems, setAddedItems] = useState({});
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatOpen, chatLoading]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || chatLoading) return;

    const mergedFilters = {
      ...(productFilters?.category ? { category: productFilters.category } : {}),
      ...(activeFilters || {})
    };

    dispatch(sendChatMessage({ message: query, history: chatHistory, activeFilters: mergedFilters }));
    setInput('');
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    dispatch(showToast({
      message: `AI added "${product.name}" to your cart!`,
      type: 'success',
      icon: '🤖'
    }));
    setAddedItems(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  if (!isChatOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 400,
      height: 560,
      background: 'white',
      borderRadius: 20,
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
      border: '1px solid #cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '1rem 1.25rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '0.4rem', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', margin: 0, lineHeight: 1.2 }}>OmniAI Assistant</h4>
            <span style={{ fontSize: '0.7rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              ● Powered by Gemini & NLU Engine
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => dispatch(clearChatHistory())} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }} title="Reset Conversation">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => dispatch(toggleChatbot())} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Body */}
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {chatHistory.map((msg, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '0.5rem',
              maxWidth: '92%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              {msg.sender === 'bot' && (
                <div style={{ width: 28, height: 28, borderRadius: 9999, background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Bot size={16} />
                </div>
              )}
              
              <div style={{
                background: msg.sender === 'user' ? '#2563eb' : 'white',
                color: msg.sender === 'user' ? 'white' : '#0f172a',
                padding: '0.75rem 0.9rem',
                borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '0.85rem',
                lineHeight: 1.45,
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div style={{ width: 28, height: 28, borderRadius: 9999, background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <User size={16} />
                </div>
              )}
            </div>

            {/* Embedded Mini Product Cards */}
            {msg.sender === 'bot' && msg.products && msg.products.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                width: '100%',
                marginTop: '0.2rem',
                paddingLeft: '2.2rem'
              }}>
                {msg.products.map((product) => (
                  <div 
                    key={product._id}
                    style={{
                      background: 'white',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      padding: '0.6rem',
                      display: 'grid',
                      gridTemplateColumns: '70px 1fr',
                      gap: '0.6rem',
                      alignItems: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <img 
                      src={product.thumbnail || product.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_FALLBACK_IMAGE;
                      }}
                      style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, background: '#f1f5f9' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{product.brand}</span>
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          <Star size={11} fill="#f59e0b" /> {product.ratings || 4.5}
                        </span>
                      </div>
                      <h5 
                        onClick={() => navigate(`/product/${product._id}`)}
                        style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', margin: 0, cursor: 'pointer', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        title={product.name}
                      >
                        {product.name}
                      </h5>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatINR(product.price)}
                        </span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            onClick={() => navigate(`/product/${product._id}`)}
                            style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '0.25rem 0.45rem', fontSize: '0.7rem', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            title="View Details"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            style={{
                              background: addedItems[product._id] ? '#16a34a' : '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '0.25rem 0.45rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              transition: 'background 0.2s'
                            }}
                          >
                            <ShoppingBag size={12} /> {addedItems[product._id] ? 'Added!' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {chatLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontSize: '0.8rem', background: '#eff6ff', padding: '0.6rem 0.8rem', borderRadius: 12, width: 'fit-content', border: '1px solid #bfdbfe' }}>
            <Sparkles size={15} className="animate-spin" /> Finding the best products for you...
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div style={{ padding: '0.5rem 0.8rem', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
        {suggestionChips.map((chip, idx) => (
          <button 
            key={idx}
            onClick={() => handleSend(chip)}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 9999, padding: '0.25rem 0.6rem', fontSize: '0.7rem', color: '#475569', whiteSpace: 'nowrap', cursor: 'pointer' }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '0.75rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Type product query e.g. laptop under 50000..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: '0.55rem 0.9rem', borderRadius: 9999, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
        />
        <button 
          type="submit" 
          disabled={chatLoading}
          style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 9999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
