import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../../src/store/uiSlice';
import graphReducer from '../../src/store/graphSlice';
import { useExecutionManager } from '../../src/hooks/useExecutionManager';

describe('useExecutionManager - 数据驱动模式', () => {
  const createTestStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        ui: uiReducer,
        graph: graphReducer,
      },
      preloadedState,
    });
  };

  const wrapper = (store: ReturnType<typeof createTestStore>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在没有图片导入节点时清除预览', () => {
    const store = createTestStore({
      graph: { nodes: [], edges: [] },
      ui: { selectedNodeId: null, previewTexture: null, previewSize: { width: 1920, height: 1080 } }
    });

    renderHook(
      () => useExecutionManager(),
      { wrapper: wrapper(store) }
    );

    const state = store.getState();
    expect(state.ui.previewTexture).toBeNull();
  });

  it('应该在有图片导入节点且有 imageData 且连接到预览节点时设置预览', () => {
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const store = createTestStore({
      graph: {
        nodes: [
          {
            id: 'image_import-1',
            data: {
              nodeType: 'image_import',
              params: {
                imageData: testImageData,
              },
            },
          },
          {
            id: 'preview_output-1',
            data: {
              nodeType: 'preview_output',
              params: {},
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'image_import-1',
            target: 'preview_output-1',
            sourceHandle: 'image',
            targetHandle: 'image',
          },
        ],
      },
      ui: { selectedNodeId: null, previewTexture: null, previewSize: { width: 1920, height: 1080 } }
    });

    renderHook(
      () => useExecutionManager(),
      { wrapper: wrapper(store) }
    );

    const state = store.getState();
    // 验证预览纹理已被设置
    expect(state.ui.previewTexture).toBe(testImageData);
  });

  it('应该忽略非图片导入节点（当未连接到预览节点时）', () => {
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const store = createTestStore({
      graph: {
        nodes: [
          {
            id: 'blur-1',
            data: {
              nodeType: 'gaussian_blur',
              params: {
                imageData: testImageData,
              },
            },
          },
          {
            id: 'preview_output-1',
            data: {
              nodeType: 'preview_output',
              params: {},
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'blur-1',
            target: 'preview_output-1',
          },
        ],
      },
      ui: { selectedNodeId: null, previewTexture: null, previewSize: { width: 1920, height: 1080 } }
    });

    renderHook(
      () => useExecutionManager(),
      { wrapper: wrapper(store) }
    );

    const state = store.getState();
    // 应该保持 null，因为 gaussian_blur 不直接输出 dataUrl
    expect(state.ui.previewTexture).toBeNull();
  });

  it('应该在节点没有 imageData 参数时清除预览', () => {
    const store = createTestStore({
      graph: {
        nodes: [
          {
            id: 'image_import-1',
            data: {
              nodeType: 'image_import',
              params: {},
            },
          },
          {
            id: 'preview_output-1',
            data: {
              nodeType: 'preview_output',
              params: {},
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'image_import-1',
            target: 'preview_output-1',
          },
        ],
      },
      ui: { selectedNodeId: null, previewTexture: 'some-data', previewSize: { width: 1920, height: 1080 } }
    });

    renderHook(
      () => useExecutionManager(),
      { wrapper: wrapper(store) }
    );

    const state = store.getState();
    // 应该清除预览，因为没有 imageData
    expect(state.ui.previewTexture).toBeNull();
  });
});
