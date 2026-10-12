import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, forgotPasswordUser } from '../redux/slices/authSlice';
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleDemoFill = (role) => {
    setMode('login');
    if (role === 'admin') {
      setEmail('admin@ecommerce.com');
      setPassword('adminpassword123');
    } else {
      setEmail('customer@ecommerce.com');
      setPassword('customerpassword123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(res)) {
        if (res.payload.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/shop');
        }
      }
    } else if (mode === 'register') {
      const res = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(res)) {
        navigate('/shop');
      }
    } else if (mode === 'forgot') {
      const res = await dispatch(forgotPasswordUser(email));
      if (forgotPasswordUser.fulfilled.match(res)) {
        setForgotMsg('Password reset instructions & token sent successfully!');
      }
    }
  };

  return (
    <div className="container" style={{ margin: '3.5rem auto', maxWidth: 480 }}>
      <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e2e8f0', padding: '2.5rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
        
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontWeight: 800, fontSize: '1.4rem' }}>
            O
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
            {mode === 'login' && 'Sign In to OmniStore'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {mode === 'login' && 'Access cart, wishlist, orders & personalized AI recommendations'}
            {mode === 'register' && 'Join OmniStore India for zero-touch UPI payments & GST invoices'}
            {mode === 'forgot' && 'Enter your registered email address to receive reset instructions'}
          </p>
        </div>

        {/* Quick Demo Credentials Bar */}
        {mode === 'login' && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem 1rem', borderRadius: 12, marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem' }}>⚡ Quick Demo Login Shortcuts</div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button 
                type="button"
                onClick={() => handleDemoFill('customer')}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: 8 }}
              >
                👤 Customer Demo
              </button>
              <button 
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: 8 }}
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {forgotMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={18} /> {forgotMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Rajesh Sharma" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
                <UserIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.8rem', borderRadius: 12, fontSize: '0.95rem', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {mode === 'login' ? (
            <button 
              onClick={() => setMode('register')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Don't have an account? Register here
            </button>
          ) : (
            <button 
              onClick={() => { setMode('login'); setForgotMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
