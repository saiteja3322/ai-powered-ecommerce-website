import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const loadStoredProducts = () => {
  try {
    const data = localStorage.getItem('products');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveStoredProducts = (items) => {
  try {
    localStorage.setItem('products', JSON.stringify(items));
  } catch (e) {}
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params = {}, { rejectWithValue }) => {
  try {
    // Filter out empty params
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });

    const query = new URLSearchParams(cleanParams).toString();
    const data = await api.get(`/products?${query}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.message || 'Unable to load products. Please try again.');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue, getState }) => {
  try {
    const data = await api.get(`/products/${id}`);
    return data.product;
  } catch (err) {
    const state = getState();
    const existing = state.products.items.find(item => item._id === id);
    if (existing) {
      return existing;
    }
    const stored = loadStoredProducts().find(item => item._id === id);
    if (stored) {
      return stored;
    }
    return rejectWithValue(err.message || 'Product not found');
  }
});

export const createProduct = createAsyncThunk('products/createProduct', async (productData, { rejectWithValue }) => {
  try {
    const data = await api.post('/products', productData);
    return data.product;
  } catch (err) {
    const localProduct = {
      ...productData,
      _id: 'prd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString()
    };
    return localProduct;
  }
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, productData }, { rejectWithValue }) => {
  try {
    const data = await api.put(`/products/${id}`, productData);
    return data.product;
  } catch (err) {
    return { ...productData, _id: id };
  }
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return id;
  }
});

const initialItems = loadStoredProducts();

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: initialItems,
    selectedProduct: null,
    total: initialItems.length,
    page: 1,
    pages: 1,
    loading: false,
    error: null,
    filters: {
      category: '',
      brand: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      minDiscount: '',
      rating: '',
      sort: 'newest'
    }
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: '',
        brand: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        minDiscount: '',
        rating: '',
        sort: 'newest'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const fetched = action.payload.products || [];
        state.items = fetched;
        state.total = action.payload.total !== undefined ? action.payload.total : fetched.length;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        if (fetched.length > 0) {
          saveStoredProducts(fetched);
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to load products. Please try again.';
      })
      // Fetch By Id
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedProduct = null;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        const existingIdx = state.items.findIndex(item => item._id === action.payload._id);
        if (existingIdx !== -1) {
          state.items[existingIdx] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
        state.total = state.items.length;
        saveStoredProducts(state.items);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
        if (state.selectedProduct?._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
        saveStoredProducts(state.items);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
        state.total = Math.max(0, state.items.length);
        if (state.selectedProduct?._id === action.payload) {
          state.selectedProduct = null;
        }
        saveStoredProducts(state.items);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilter, resetFilters } = productSlice.actions;
export default productSlice.reducer;
