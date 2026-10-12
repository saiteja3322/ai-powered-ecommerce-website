import { createSlice } from '@reduxjs/toolkit';

const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: savedWishlist
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex(item => item._id === product._id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  }
});

export const { toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
