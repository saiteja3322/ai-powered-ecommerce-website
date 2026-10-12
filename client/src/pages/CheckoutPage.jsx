import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder, resetOrderState } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import confetti from 'canvas-confetti';
import { ShieldCheck, CreditCard, Truck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

import { formatINR } from '../utils/formatCurrency';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, subtotal, tax, shipping, discount, grandTotal } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const { loading, successOrder } = useSelector(state => state.orders);

  const [step, setStep] = useState(1);

  // Address State
  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '102 Outer Ring Road, Bellandur',
    city: user?.addresses?.[0]?.city || 'Bengaluru',
    state: user?.addresses?.[0]?.state || 'Karnataka',
    zipCode: user?.addresses?.[0]?.zipCode || '560103',
    country: 'India'
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please sign in to place your order.');
      navigate('/login');
      return;
    }

    const orderData = {
      orderItems: items.map(i => ({
        product: i._id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.thumbnail
      })),
      shippingAddress: address,
      paymentMethod,
      itemsPrice: subtotal,
      taxPrice: tax,
      shippingPrice: shipping,
      discountPrice: discount,
      totalPrice: grandTotal
    };

    const res = await dispatch(createOrder(orderData)).unwrap();
    if (res) {
      dispatch(clearCart());
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setStep(4); // Order Confirmed Step
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 1.5rem', maxWidth: 480 }}>
        <div style={{ background: '#eff6ff', width: 70, height: 70, borderRadius: 9999, color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Lock size={36} />
        </div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Login Required to Checkout</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Please sign in to your OmniStore account to complete payment & delivery details.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', borderRadius: 12 }}>
          Sign In / Create Account <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (step === 4 && successOrder) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: 640 }}>
        <div style={{ background: '#f0fdf4', width: 90, height: 90, borderRadius: 9999, color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <CheckCircle2 size={56} />
        </div>
        <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>ORDER CONFIRMED</span>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Thank You for Your Order!</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Order ID: <strong>#{successOrder._id}</strong> | Tracking: <strong>DEL-IND-982341</strong>
        </p>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.85rem' }}>
          <h4 style={{ marginBottom: '0.8rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Shipping & Invoice Summary</h4>
          <p><strong>Recipient:</strong> {user?.name}</p>
          <p><strong>Delivery Address:</strong> {successOrder.shippingAddress?.street}, {successOrder.shippingAddress?.city}, {successOrder.shippingAddress?.state} {successOrder.shippingAddress?.zipCode}, {successOrder.shippingAddress?.country}</p>
          <p><strong>Payment Mode:</strong> {successOrder.paymentMethod}</p>
          <p style={{ color: '#2563eb', fontWeight: 700, marginTop: 4 }}>Total Paid (incl GST 18%): {formatINR(successOrder.totalPrice)}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => { dispatch(resetOrderState()); navigate('/user/dashboard'); }} className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', borderRadius: 12 }}>
            Track Order Status & GST Invoice
          </button>
          <button onClick={() => { dispatch(resetOrderState()); navigate('/shop'); }} className="btn btn-outline" style={{ padding: '0.8rem 1.4rem', borderRadius: 12 }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '2.5rem auto', maxWidth: 1000 }}>
      
      {/* Checkout Progress Stepper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', background: 'white', padding: '1.25rem 2rem', borderRadius: 16, border: '1px solid #e2e8f0' }}>
        <div style={{ color: step >= 1 ? '#2563eb' : '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 26, height: 26, borderRadius: 9999, background: step >= 1 ? '#2563eb' : '#e2e8f0', color: step >= 1 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
          Delivery Address
        </div>
        <div style={{ color: step >= 2 ? '#2563eb' : '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 26, height: 26, borderRadius: 9999, background: step >= 2 ? '#2563eb' : '#e2e8f0', color: step >= 2 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
          Payment Method
        </div>
        <div style={{ color: step >= 3 ? '#2563eb' : '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 26, height: 26, borderRadius: 9999, background: step >= 3 ? '#2563eb' : '#e2e8f0', color: step >= 3 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>3</span>
          Review & Pay
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Step Forms */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
          
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Indian Shipping Address</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Flat / House No. / Street</label>
                  <input type="text" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>City</label>
                  <input type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>State</label>
                  <input type="text" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>PIN Code</label>
                  <input type="text" value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Country</label>
                  <input type="text" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                </div>
              </div>

              <button onClick={() => setStep(2)} className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem', borderRadius: 10 }}>
                Continue to Payment Options <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Select Indian Payment Mode</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 12, border: paymentMethod === 'UPI' ? '2px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer', background: paymentMethod === 'UPI' ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                  <ShieldCheck size={24} color="#2563eb" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>UPI (Google Pay, PhonePe, Paytm, BHIM)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Instant 0% fee zero-touch payment via Virtual Payment Address (VPA)</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 12, border: paymentMethod === 'Cards' ? '2px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer', background: paymentMethod === 'Cards' ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'Cards'} onChange={() => setPaymentMethod('Cards')} />
                  <CreditCard size={24} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Credit / Debit Cards (RuPay, Visa, Mastercard)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>10% Instant Discount on HDFC & SBI Bank Cards</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 12, border: paymentMethod === 'Net Banking' ? '2px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer', background: paymentMethod === 'Net Banking' ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'Net Banking'} onChange={() => setPaymentMethod('Net Banking')} />
                  <ShieldCheck size={24} color="#9333ea" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Net Banking (HDFC, ICICI, SBI, Axis, Kotak)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Direct secure bank login redirect</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 12, border: paymentMethod === 'Cash on Delivery' ? '2px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer', background: paymentMethod === 'Cash on Delivery' ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} />
                  <Truck size={24} color="#ea580c" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pay cash upon package arrival at your doorstep</div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(1)} className="btn btn-outline" style={{ padding: '0.7rem 1.2rem', borderRadius: 10 }}>Back</button>
                <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '0.7rem 1.6rem', borderRadius: 10 }}>
                  Review Order Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Final Order Review</h3>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <p><strong>Deliver To:</strong> {address.street}, {address.city}, {address.state} {address.zipCode}</p>
                <p><strong>Payment Mode:</strong> {paymentMethod}</p>
              </div>

              {/* Items summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {items.map(i => (
                  <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{i.name} (x{i.quantity})</span>
                    <span style={{ fontWeight: 700 }}>{formatINR(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(2)} className="btn btn-outline" style={{ padding: '0.75rem 1.2rem', borderRadius: 10 }}>Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 1.8rem', borderRadius: 10, flex: 1 }}>
                  {loading ? 'Processing Order...' : `Complete Order (${formatINR(grandTotal)})`}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Summary */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '1.5rem', height: 'fit-content' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Total Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal ({items.length} items):</span><span>{formatINR(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST Tax (18%):</span><span>{formatINR(tax)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery Charges:</span><span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span></div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}><span>Discount:</span><span>-{formatINR(discount)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#2563eb', borderTop: '1.5px solid #e2e8f0', paddingTop: '0.6rem' }}>
              <span>Grand Total:</span><span>{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
