import { createSlice } from '@reduxjs/toolkit';

const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
const savedCoupon = JSON.parse(localStorage.getItem('coupon') || 'null');

const calculateTotals = (items, coupon) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = subtotal > 499 || items.length === 0 ? 0 : 99;
  
  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountAmount || coupon.discountValue || 0;
    }
  }

  const grandTotal = Math.max(0, subtotal + tax + shipping - discount);

  return { subtotal, tax, shipping, discount, grandTotal };
};

const initialTotals = calculateTotals(savedCart, savedCoupon);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: savedCart,
    coupon: savedCoupon,
    ...initialTotals
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find(item => item._id === product._id);
      if (existing) {
        existing.quantity += (product.quantity || 1);
      } else {
        state.items.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail || product.images[0],
          brand: product.brand,
          category: product.category,
          quantity: product.quantity || 1
        });
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
      const totals = calculateTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i._id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
      const totals = calculateTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
      const totals = calculateTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      localStorage.setItem('coupon', JSON.stringify(action.payload));
      const totals = calculateTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      localStorage.removeItem('coupon');
      const totals = calculateTotals(state.items, null);
      Object.assign(state, totals);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      localStorage.removeItem('cart');
      localStorage.removeItem('coupon');
      const totals = calculateTotals([], null);
      Object.assign(state, totals);
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
