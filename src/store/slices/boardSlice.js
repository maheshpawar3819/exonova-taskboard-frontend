import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Async thunks
export const fetchBoards = createAsyncThunk(
  "board/fetchBoards",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/boards`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.boards;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch boards"
      );
    }
  }
);

export const createBoard = createAsyncThunk(
  "board/createBoard",
  async (boardData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/boards`, boardData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.board;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create board"
      );
    }
  }
);

export const deleteBoard = createAsyncThunk(
  "board/deleteBoard",
  async (boardId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return boardId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete board"
      );
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  "board/fetchBoardById",
  async (boardId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch board"
      );
    }
  }
);

export const updateBoard = createAsyncThunk(
  "board/updateBoard",
  async ({ boardId, updates }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/boards/${boardId}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update board"
      );
    }
  }
);

export const addBoardMember = createAsyncThunk(
  "board/addBoardMember",
  async ({ boardId, userId, role }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/boards/${boardId}/members`,
        { userId, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add board member"
      );
    }
  }
);

export const removeBoardMember = createAsyncThunk(
  "board/removeBoardMember",
  async ({ boardId, userId }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.delete(
        `${API_URL}/boards/${boardId}/members/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { boardId, userId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove board member"
      );
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  "board/updateMemberRole",
  async ({ boardId, userId, role }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/boards/${boardId}/members/${userId}/role`,
        { role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update member role"
      );
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create board
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.push(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch board by ID
      .addCase(fetchBoardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        // Store cards in the board object for easy access
        if (action.payload.cards) {
          state.currentBoard.cards = action.payload.cards;
        }
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update board
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        // Update current board if it's the one being updated
        if (
          state.currentBoard &&
          state.currentBoard._id === action.payload.board._id
        ) {
          state.currentBoard = action.payload.board;
        }
        // Update board in boards array
        const index = state.boards.findIndex(
          (board) => board._id === action.payload.board._id
        );
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add board member
      .addCase(addBoardMember.fulfilled, (state, action) => {
        if (
          state.currentBoard &&
          state.currentBoard._id === action.payload.board._id
        ) {
          state.currentBoard = action.payload.board;
        }
        // Update board in boards array
        const index = state.boards.findIndex(
          (board) => board._id === action.payload.board._id
        );
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
      })
      // Remove board member
      .addCase(removeBoardMember.fulfilled, (state, action) => {
        if (
          state.currentBoard &&
          state.currentBoard._id === action.payload.boardId
        ) {
          state.currentBoard = action.payload.board;
        }
        // Update board in boards array
        const index = state.boards.findIndex(
          (board) => board._id === action.payload.boardId
        );
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
      })
      // Update member role
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        if (
          state.currentBoard &&
          state.currentBoard._id === action.payload.board._id
        ) {
          state.currentBoard = action.payload.board;
        }
        // Update board in boards array
        const index = state.boards.findIndex(
          (board) => board._id === action.payload.board._id
        );
        if (index !== -1) {
          state.boards[index] = action.payload.board;
        }
      }) // Delete board
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter(
          (board) => board._id !== action.payload
        );
        if (state.currentBoard && state.currentBoard._id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentBoard, clearCurrentBoard } =
  boardSlice.actions;
export default boardSlice.reducer;
