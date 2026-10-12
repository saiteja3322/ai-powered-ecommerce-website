import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
const savedToken = localStorage.getItem('token') || null;

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const forgotPasswordUser = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const data = await api.post('/auth/forgotpassword', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const resetPasswordUser = createAsyncThunk('auth/resetPassword', async ({ resetToken, password }, { rejectWithValue }) => {
  try {
    const data = await api.put(`/auth/resetpassword/${resetToken}`, { password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken,
    isAuthenticated: Boolean(savedToken && savedUser),
    loading: false,
    error: null,
    resetSuccess: false
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    switchRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPasswordUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.resetSuccess = true;
      });
  }
});

export const { logout, switchRole, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
