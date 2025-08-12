import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';
import cardReducer from './slices/cardSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    card: cardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;

