import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk('orders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const data = await api.post('/orders', orderData);
    return data.order;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/orders/myorders');
    return data.orders;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchAllOrdersAdmin = createAsyncThunk('orders/fetchAllOrdersAdmin', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/orders');
    return data.orders;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateOrderStatusAdmin = createAsyncThunk('orders/updateOrderStatusAdmin', async ({ id, status }, { rejectWithValue }) => {
  try {
    const data = await api.put(`/orders/${id}/status`, { status });
    return data.order;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    allOrders: [],
    currentOrder: null,
    loading: false,
    error: null,
    successOrder: null
  },
  reducers: {
    resetOrderState: (state) => {
      state.successOrder = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successOrder = action.payload;
        state.myOrders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload;
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.allOrders = action.payload;
      })
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.allOrders.findIndex(o => o._id === updated._id);
        if (idx !== -1) state.allOrders[idx] = updated;
      });
  }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
