import React from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

const AIReviewSummaryCard = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '1px solid #cbd5e1',
      borderRadius: 16,
      padding: '1.5rem',
      margin: '1.5rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#2563eb' }}>
        <Sparkles size={20} />
        <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f172a' }}>AI Sentiment & Review Summary</h3>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.2rem', fontStyle: 'italic', background: 'white', padding: '0.8rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        "{summary.verdict}"
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Pros */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <ThumbsUp size={16} /> Key Pros
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {summary.pros?.map((pro, idx) => (
              <li key={idx} style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <ThumbsDown size={16} /> Things to Consider
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {summary.cons?.map((con, idx) => (
              <li key={idx} style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIReviewSummaryCard;
