import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import compareReducer from './slices/compareSlice';
import aiReducer from './slices/aiSlice';
import orderReducer from './slices/orderSlice';
import toastReducer from './slices/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    compare: compareReducer,
    ai: aiReducer,
    orders: orderReducer,
    toast: toastReducer
  }
});
