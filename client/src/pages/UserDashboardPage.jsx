import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import ProductCard from '../components/ProductCard';
import InvoiceModal from '../components/InvoiceModal';
import { Package, Heart, MapPin, User, FileText, CheckCircle, Truck, Clock } from 'lucide-react';

import { formatINR } from '../utils/formatCurrency';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

const UserDashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { myOrders } = useSelector(state => state.orders);
  const wishlistItems = useSelector(state => state.wishlist.items);

  const [activeTab, setActiveTab] = useState('orders');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="container" style={{ margin: '2.5rem auto' }}>
      
      {/* Header Profile Bar */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '2rem', borderRadius: 20, marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={user?.name} style={{ width: 64, height: 64, borderRadius: 9999, border: '3px solid #3b82f6' }} />
          <div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 2 }}>{user?.name || 'Customer Profile'}</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user?.email || 'customer@ecommerce.com'} • Account Member</p>
          </div>
        </div>

        <span className="badge badge-ai" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          ROLE: {user?.role?.toUpperCase() || 'CUSTOMER'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: 700, color: activeTab === 'orders' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'orders' ? '3px solid #2563eb' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Package size={18} /> My Orders ({myOrders.length})
        </button>

        <button 
          onClick={() => setActiveTab('wishlist')}
          style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: 700, color: activeTab === 'wishlist' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'wishlist' ? '3px solid #2563eb' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Heart size={18} /> Saved Wishlist ({wishlistItems.length})
        </button>

        <button 
          onClick={() => setActiveTab('addresses')}
          style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: 700, color: activeTab === 'addresses' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'addresses' ? '3px solid #2563eb' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <MapPin size={18} /> Saved Addresses
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <Package size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <h4>No orders found</h4>
            </div>
          ) : (
            myOrders.map(order => (
              <div key={order._id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Order ID:</span> <strong>#{order._id}</strong>
                    <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>|</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Date:</span> <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : 'badge-primary'}`}>
                      {order.status}
                    </span>
                    <button onClick={() => setSelectedInvoiceOrder(order)} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      <FileText size={14} /> Tax Invoice
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={item.image || DEFAULT_FALLBACK} 
                        alt={item.name} 
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} 
                      />
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ color: '#64748b' }}>Qty: {item.quantity} × {formatINR(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Status Timeline */}
                <div style={{ background: '#f8fafc', padding: '0.8rem 1.25rem', borderRadius: 12, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                  <span>Tracking: <strong>{order.trackingNumber || 'DEL-IND-982341'}</strong></span>
                  <span>Payment Mode: <strong>{order.paymentMethod}</strong></span>
                  <span>Total Amount: <strong style={{ color: '#2563eb' }}>{formatINR(order.totalPrice)}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <Heart size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <h4>Your wishlist is empty</h4>
            </div>
          ) : (
            <div className="grid-products">
              {wishlistItems.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', maxWidth: 600 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Saved Shipping Address</h3>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <p><strong>{user?.name || 'Customer Name'}</strong></p>
            <p>{user?.addresses?.[0]?.street || '102 Outer Ring Road, Bellandur'}</p>
            <p>{user?.addresses?.[0]?.city || 'Bengaluru'}, {user?.addresses?.[0]?.state || 'Karnataka'} {user?.addresses?.[0]?.zipCode || '560103'}</p>
            <p>India</p>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

    </div>
  );
};

export default UserDashboardPage;
