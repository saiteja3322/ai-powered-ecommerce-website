import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../redux/slices/toastSlice';
import { X } from 'lucide-react';

const ToastNotification = () => {
  const dispatch = useDispatch();
  const { message, type, icon } = useSelector(state => state.toast);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        borderRadius: 14,
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.2)',
        background: type === 'error' ? '#fef2f2' : type === 'info' ? '#eff6ff' : '#f0fdf4',
        color: type === 'error' ? '#dc2626' : type === 'info' ? '#1d4ed8' : '#15803d',
        border: `1.5px solid ${type === 'error' ? '#fca5a5' : type === 'info' ? '#93c5fd' : '#86efac'}`,
        fontSize: '0.9rem',
        fontWeight: 700,
        fontFamily: "'Outfit', sans-serif",
        animation: 'slideIn 0.3s ease-out',
        backdropFilter: 'blur(10px)'
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => dispatch(hideToast())}
        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, padding: 2, display: 'flex', alignItems: 'center' }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastNotification;
