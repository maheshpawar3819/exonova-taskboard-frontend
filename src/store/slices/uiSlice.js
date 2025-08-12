import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showCreateBoardModal: false,
  showCreateCardModal: false,
  showCardDetailsModal: false,
  selectedCard: null,
  notification: null,
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCreateBoardModal: (state) => {
      state.showCreateBoardModal = !state.showCreateBoardModal;
    },
    toggleCreateCardModal: (state) => {
      state.showCreateCardModal = !state.showCreateCardModal;
    },
    toggleCardDetailsModal: (state) => {
      state.showCardDetailsModal = !state.showCardDetailsModal;
    },
    setSelectedCard: (state, action) => {
      state.selectedCard = action.payload;
    },
    clearSelectedCard: (state) => {
      state.selectedCard = null;
    },
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
  },
});

export const {
  toggleCreateBoardModal,
  toggleCreateCardModal,
  toggleCardDetailsModal,
  setSelectedCard,
  clearSelectedCard,
  setNotification,
  clearNotification,
  toggleSidebar,
  closeSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
