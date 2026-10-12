import React from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';

import { formatINR } from '../utils/formatCurrency';

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 720, padding: '2rem' }}>
        
        {/* Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <span className="badge badge-success">OFFICIAL GST TAX INVOICE</span>
            <h3 style={{ fontSize: '1.2rem', marginTop: 4 }}>Order #{order._id}</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="invoice-printable" style={{ padding: '1rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#2563eb', fontWeight: 800 }}>OmniStore India Pvt Ltd</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Outer Ring Road, Bellandur<br />
                Bengaluru, Karnataka 560103<br />
                <strong>GSTIN:</strong> 29AAAAA0000A1Z5<br />
                support@omnistore.in
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
              <p><strong>Invoice Date:</strong> {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{order.status}</span></p>
              <p><strong>Payment Mode:</strong> {order.paymentMethod}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: 4 }}>Customer Delivery Address</h4>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country || 'India'}</p>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Item Description</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'right' }}>{formatINR(item.price)}</td>
                  <td style={{ padding: '0.75rem 0.8rem', textAlign: 'right', fontWeight: 700 }}>{formatINR(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 280, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{formatINR(order.itemsPrice || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST Tax (18%):</span>
                <span>{formatINR(order.taxPrice || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : formatINR(order.shippingPrice)}</span>
              </div>
              {order.discountPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount:</span>
                  <span>-{formatINR(order.discountPrice)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '2px solid #0f172a', paddingTop: '0.5rem', marginTop: '0.4rem' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#2563eb' }}>{formatINR(order.totalPrice || 0)}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            Thank you for shopping with OmniStore India! This is a computer-generated tax invoice.
          </div>

        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
