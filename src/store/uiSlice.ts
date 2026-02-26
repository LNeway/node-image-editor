import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  canvasTransform: { x: number; y: number; zoom: number };
  isPropertiesPanelOpen: boolean;
  isHistoryPanelOpen: boolean;
  isNodeLibraryOpen: boolean;
  // Preview state
  previewTexture: any;
  previewSize: { width: number; height: number };
}

const initialState: UIState = {
  selectedNodeId: null,
  selectedEdgeId: null,
  canvasTransform: { x: 0, y: 0, zoom: 1 },
  isPropertiesPanelOpen: true,
  isHistoryPanelOpen: false,
  isNodeLibraryOpen: true,
  previewTexture: null,
  previewSize: { width: 1920, height: 1080 },
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
    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },
    selectEdge: (state, action: PayloadAction<string | null>) => {
      state.selectedEdgeId = action.payload;
    },
    setPreviewTexture: (state, action: PayloadAction<any>) => {
      state.previewTexture = action.payload;
    },
    setPreviewSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.previewSize = action.payload;
    },
  },
});

export const {
  selectNode,
  setCanvasTransform,
  togglePropertiesPanel,
  toggleHistoryPanel,
  toggleNodeLibrary,
  setSelectedNode,
  selectEdge,
  setPreviewTexture,
  setPreviewSize,
} = uiSlice.actions;
export default uiSlice.reducer;
