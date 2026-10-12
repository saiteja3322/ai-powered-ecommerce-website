import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import AICompareModal from './components/AICompareModal';
import ToastNotification from './components/ToastNotification';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuthPage from './pages/AuthPage';

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedUserRoute = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedUserRoute>
                  <UserDashboardPage />
                </ProtectedUserRoute>
              } 
            />
            <Route path="/login" element={<AuthPage />} />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Floating AI Widgets & Notifications */}
        <ToastNotification />
        <AIChatbot />
        <AICompareModal />

        <Footer />
      </div>
    </Router>
  );
}

export default App;
