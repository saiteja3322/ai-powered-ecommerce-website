import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAIComparison = createAsyncThunk('compare/fetchAIComparison', async (productIds, { rejectWithValue }) => {
  try {
    const data = await api.post('/ai/compare', { productIds });
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const compareSlice = createSlice({
  name: 'compare',
  initialState: {
    selectedProducts: [],
    isOpen: false,
    comparisonResult: null,
    loading: false,
    error: null
  },
  reducers: {
    toggleCompareProduct: (state, action) => {
      const product = action.payload;
      const index = state.selectedProducts.findIndex(p => p._id === product._id);
      if (index >= 0) {
        state.selectedProducts.splice(index, 1);
      } else {
        if (state.selectedProducts.length < 4) {
          state.selectedProducts.push(product);
        }
      }
    },
    openCompareModal: (state) => {
      state.isOpen = true;
    },
    closeCompareModal: (state) => {
      state.isOpen = false;
    },
    clearCompareList: (state) => {
      state.selectedProducts = [];
      state.comparisonResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAIComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisonResult = action.payload.comparison;
      })
      .addCase(fetchAIComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { toggleCompareProduct, openCompareModal, closeCompareModal, clearCompareList } = compareSlice.actions;
export default compareSlice.reducer;
