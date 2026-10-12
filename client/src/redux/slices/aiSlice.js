import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const sendChatMessage = createAsyncThunk('ai/sendChatMessage', async ({ message, history, activeFilters }, { rejectWithValue }) => {
  try {
    const data = await api.post('/ai/chat', { message, history, activeFilters });
    return {
      reply: data.reply,
      products: data.products || [],
      activeFilters: data.activeFilters || {},
      isFallback: data.isFallback || false
    };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const parseSmartSearch = createAsyncThunk('ai/parseSmartSearch', async (query, { rejectWithValue }) => {
  try {
    const data = await api.post('/ai/smart-search', { query });
    return data.parsedParams;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    isChatOpen: false,
    chatHistory: [
      { sender: 'bot', text: '👋 Hello! I am **OmniAI**, your personal shopping assistant. Ask me anything about laptops, mobile phones, shoes, warranties, or recommendations!' }
    ],
    chatLoading: false,
    activeFilters: {},
    smartSearchActive: false,
    lastParsedParams: null
  },
  reducers: {
    toggleChatbot: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    clearChatHistory: (state) => {
      state.chatHistory = [
        { sender: 'bot', text: 'Chat history cleared. How can I help you today?' }
      ];
      state.activeFilters = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state, action) => {
        state.chatLoading = true;
        state.chatHistory.push({ sender: 'user', text: action.meta.arg.message });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.activeFilters = action.payload.activeFilters || {};
        state.chatHistory.push({
          sender: 'bot',
          text: action.payload.reply,
          products: action.payload.products,
          isFallback: action.payload.isFallback
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.chatLoading = false;
        state.chatHistory.push({ sender: 'bot', text: '⚠️ Sorry, I ran into an issue processing your request. Please try again.' });
      })
      .addCase(parseSmartSearch.fulfilled, (state, action) => {
        state.smartSearchActive = true;
        state.lastParsedParams = action.payload;
      });
  }
});

export const { toggleChatbot, clearChatHistory } = aiSlice.actions;
export default aiSlice.reducer;
