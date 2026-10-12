import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Sparkles, Scale, Trash2, CheckCircle2 } from 'lucide-react';
import { closeCompareModal, fetchAIComparison, clearCompareList } from '../redux/slices/compareSlice';

const AICompareModal = () => {
  const dispatch = useDispatch();
  const { isOpen, selectedProducts, comparisonResult, loading } = useSelector(state => state.compare);

  useEffect(() => {
    if (isOpen && selectedProducts.length >= 2) {
      const ids = selectedProducts.map(p => p._id);
      dispatch(fetchAIComparison(ids));
    }
  }, [isOpen, selectedProducts, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 900, padding: '1.75rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', color: 'white', padding: '0.5rem', borderRadius: 12 }}>
              <Scale size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 2 }}>AI Specs Comparison Matrix</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Comparing {selectedProducts.length} selected items with AI analysis</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button onClick={() => dispatch(clearCompareList())} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444' }}>
              <Trash2 size={14} /> Clear All
            </button>
            <button onClick={() => dispatch(closeCompareModal())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {selectedProducts.length < 2 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Scale size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h4>Select at least 2 products to run AI Comparison</h4>
            <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Click the compare icon on product cards in the store catalog.</p>
          </div>
        ) : (
          <div>
            {/* Products Header Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)`, gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748b', alignSelf: 'center' }}>Features</div>
              {selectedProducts.map(prod => (
                <div key={prod._id} style={{ textAlign: 'center' }}>
                  <img src={prod.thumbnail || prod.images?.[0]} alt={prod.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: 4 }}>{prod.name}</h4>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>${prod.price}</span>
                </div>
              ))}
            </div>

            {/* AI Summary Recommendation Box */}
            {comparisonResult?.recommendations && (
              <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #bfdbfe', borderRadius: 14, padding: '1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={16} /> AI Verdict & Recommendation
                </div>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                  {comparisonResult.recommendations.summary}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                  <div>🏆 <strong>Best Overall:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{comparisonResult.recommendations.bestOverall}</span></div>
                  <div>💡 <strong>Best Value:</strong> <span style={{ color: '#2563eb', fontWeight: 700 }}>{comparisonResult.recommendations.bestValue}</span></div>
                </div>
              </div>
            )}

            {/* Comparison Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <Sparkles size={20} className="animate-spin" /> Generating AI Spec Matrix...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {comparisonResult?.comparisonTable?.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: `180px repeat(${selectedProducts.length}, 1fr)`, gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: '#475569' }}>{row.feature}</div>
                    {selectedProducts.map(prod => (
                      <div key={prod._id} style={{ color: '#0f172a', fontWeight: 500 }}>
                        {row.values[prod.name] || 'N/A'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AICompareModal;
