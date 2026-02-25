import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import graphReducer, { setEdges, addEdge, removeEdge } from '../src/store/graphSlice';
import uiReducer, { selectEdge } from '../src/store/uiSlice';
import { Edge } from 'reactflow';

describe('Edge Selection and Deletion', () => {
  // Create a mock store for testing
  const createTestStore = (initialEdges: Edge[] = [], initialSelectedEdgeId: string | null = null) => {
    return configureStore({
      reducer: {
        graph: graphReducer,
        ui: uiReducer,
      },
      preloadedState: {
        graph: {
          nodes: [],
          edges: initialEdges,
        },
        ui: {
          selectedNodeId: null,
          selectedEdgeId: initialSelectedEdgeId,
          canvasTransform: { x: 0, y: 0, zoom: 1 },
          isPropertiesPanelOpen: true,
          isHistoryPanelOpen: false,
          isNodeLibraryOpen: true,
          previewTexture: null,
          previewSize: { width: 1920, height: 1080 },
        },
      },
    });
  };

  it('should add selectedEdgeId to UI state', () => {
    const store = createTestStore();
    const state = store.getState();
    expect(state.ui.selectedEdgeId).toBeNull();
  });

  it('should update selectedEdgeId when selectEdge is dispatched', () => {
    const store = createTestStore();
    store.dispatch(selectEdge('edge-1'));
    expect(store.getState().ui.selectedEdgeId).toBe('edge-1');
  });

  it('should clear selectedEdgeId when selectEdge is dispatched with null', () => {
    const store = createTestStore([], 'edge-1');
    store.dispatch(selectEdge(null));
    expect(store.getState().ui.selectedEdgeId).toBeNull();
  });

  it('should remove edge from graph when removeEdge is dispatched', () => {
    const initialEdges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'bezier',
        animated: true,
        style: { stroke: '#00b894', strokeWidth: 2 },
      },
    ];
    
    const store = createTestStore(initialEdges);
    store.dispatch(removeEdge('edge-1'));
    
    expect(store.getState().graph.edges).toHaveLength(0);
  });

  it('should handle edge selection and deletion workflow', () => {
    const initialEdges: Edge[] = [
      {
        id: 'edge-to-delete',
        source: 'node-1',
        target: 'node-2',
        type: 'bezier',
        animated: true,
        style: { stroke: '#00b894', strokeWidth: 2 },
      },
      {
        id: 'edge-to-keep',
        source: 'node-1',
        target: 'node-3',
        type: 'bezier',
        animated: true,
        style: { stroke: '#00b894', strokeWidth: 2 },
      },
    ];
    
    const store = createTestStore(initialEdges);
    
    // Select the edge
    store.dispatch(selectEdge('edge-to-delete'));
    expect(store.getState().ui.selectedEdgeId).toBe('edge-to-delete');
    
    // Delete the selected edge
    store.dispatch(removeEdge('edge-to-delete'));
    store.dispatch(selectEdge(null));
    
    // Verify the edge was removed and selection cleared
    expect(store.getState().graph.edges).toHaveLength(1);
    expect(store.getState().graph.edges[0].id).toBe('edge-to-keep');
    expect(store.getState().ui.selectedEdgeId).toBeNull();
  });

  // Regression test: edges should have selected property for visual feedback
  it('should add selected property to edges based on selectedEdgeId', () => {
    const initialEdges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'bezier',
        animated: true,
        style: { stroke: '#00b894', strokeWidth: 2 },
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        type: 'bezier',
        animated: true,
        style: { stroke: '#00b894', strokeWidth: 2 },
      },
    ];
    
    const store = createTestStore(initialEdges);
    
    // Simulate the edgesWithSelection logic from AppLayout
    const selectedEdgeId = store.getState().ui.selectedEdgeId;
    const edgesWithSelection = initialEdges.map(edge => ({
      ...edge,
      selected: edge.id === selectedEdgeId,
    }));
    
    // Initially no edge selected
    expect(edgesWithSelection.every(e => !e.selected)).toBe(true);
    
    // Select edge-1
    store.dispatch(selectEdge('edge-1'));
    const selectedEdgeIdAfter = store.getState().ui.selectedEdgeId;
    const edgesWithSelectionAfter = initialEdges.map(edge => ({
      ...edge,
      selected: edge.id === selectedEdgeIdAfter,
    }));
    
    // Verify edge-1 is selected and edge-2 is not
    expect(edgesWithSelectionAfter.find(e => e.id === 'edge-1')?.selected).toBe(true);
    expect(edgesWithSelectionAfter.find(e => e.id === 'edge-2')?.selected).toBe(false);
  });
});
