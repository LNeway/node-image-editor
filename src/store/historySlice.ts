import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  graphSnapshot: {
    nodes: any[];
    edges: any[];
  };
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  currentIndex: number;
}

const initialState: HistoryState = {
  past: [],
  future: [],
  currentIndex: -1,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushHistory: (state, action: PayloadAction<Omit<HistoryEntry, 'id' | 'timestamp'>>) => {
      // Fallback for crypto.randomUUID in case it's not available
      const generateId = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return crypto.randomUUID();
        }
        // Fallback: generate UUID-like string
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const entry: HistoryEntry = {
        ...action.payload,
        id: generateId(),
        timestamp: Date.now(),
      };
      // Remove future states when new action is performed
      state.future = [];
      state.past.push(entry);
      state.currentIndex = state.past.length - 1;
    },
    undo: (state) => {
      if (state.currentIndex >= 0) {
        state.currentIndex -= 1;
      }
    },
    redo: (state) => {
      if (state.currentIndex < state.past.length - 1) {
        state.currentIndex += 1;
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
      state.currentIndex = -1;
    },
  },
});

export const { pushHistory, undo, redo, clearHistory } = historySlice.actions;
export default historySlice.reducer;
