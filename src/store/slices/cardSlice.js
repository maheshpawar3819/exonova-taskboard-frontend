import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Async thunks
export const createCard = createAsyncThunk(
  'card/createCard',
  async ({ boardId, cardData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/cards`, {
        ...cardData,
        boardId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data || !response.data.card) {
        return rejectWithValue('Invalid response from server');
      }
      
      return response.data.card;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create card');
    }
  }
);

export const updateCard = createAsyncThunk(
  'card/updateCard',
  async ({ cardId, cardData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/cards/${cardId}`, cardData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.card;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update card');
    }
  }
);

export const deleteCard = createAsyncThunk(
  'card/deleteCard',
  async (cardId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/cards/${cardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return cardId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete card');
    }
  }
);

export const reorderCards = createAsyncThunk(
  'card/reorderCards',
  async (reorderData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/cards/reorder`, reorderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder cards');
    }
  }
);

const initialState = {
  cards: [],
  loading: false,
  error: null,
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCards: (state, action) => {
      state.cards = action.payload;
    },
    addCard: (state, action) => {
      state.cards.push(action.payload);
    },
    updateCardInState: (state, action) => {
      const index = state.cards.findIndex(card => card._id === action.payload._id);
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    removeCard: (state, action) => {
      state.cards = state.cards.filter(card => card._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Create card
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we're adding a new card, not duplicating
        const exists = state.cards.some(card => card._id === action.payload._id);
        if (!exists) {
          state.cards.push(action.payload);
        }
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update card
      .addCase(updateCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cards.findIndex(card => card._id === action.payload._id);
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete card
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = state.cards.filter(card => card._id !== action.payload);
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reorder cards
      .addCase(reorderCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderCards.fulfilled, (state, action) => {
        state.loading = false;
        // Update the reordered card in the state
        const index = state.cards.findIndex(card => card._id === action.payload.card._id);
        if (index !== -1) {
          state.cards[index] = action.payload.card;
        }
      })
      .addCase(reorderCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, addCard, updateCardInState, removeCard } = cardSlice.actions;
export default cardSlice.reducer;

