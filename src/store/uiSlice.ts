import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  selectedNodeId: string | null;
  canvasTransform: { x: number; y: number; zoom: number };
  isPropertiesPanelOpen: boolean;
  isHistoryPanelOpen: boolean;
  isNodeLibraryOpen: boolean;
}

const initialState: UIState = {
  selectedNodeId: null,
  canvasTransform: { x: 0, y: 0, zoom: 1 },
  isPropertiesPanelOpen: true,
  isHistoryPanelOpen: false,
  isNodeLibraryOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },
    setCanvasTransform: (state, action: PayloadAction<{ x: number; y: number; zoom: number }>) => {
      state.canvasTransform = action.payload;
    },
    togglePropertiesPanel: (state) => {
      state.isPropertiesPanelOpen = !state.isPropertiesPanelOpen;
    },
    toggleHistoryPanel: (state) => {
      state.isHistoryPanelOpen = !state.isHistoryPanelOpen;
    },
    toggleNodeLibrary: (state) => {
      state.isNodeLibraryOpen = !state.isNodeLibraryOpen;
    },
  },
});

export const {
  selectNode,
  setCanvasTransform,
  togglePropertiesPanel,
  toggleHistoryPanel,
  toggleNodeLibrary,
} = uiSlice.actions;
export default uiSlice.reducer;
