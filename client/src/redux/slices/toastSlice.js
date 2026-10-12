import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    message: null,
    type: 'success', // 'success' | 'info' | 'error'
    icon: '🛒'
  },
  reducers: {
    showToast: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'success';
      state.icon = action.payload.icon || '🛒';
    },
    hideToast: (state) => {
      state.message = null;
    }
  }
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
