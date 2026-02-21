import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../../src/store/uiSlice';
import { useExecutionManager } from '../../src/hooks/useExecutionManager';

describe('useExecutionManager', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        ui: uiReducer,
      },
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
    const store = createTestStore();
    const { result } = renderHook(
      () => useExecutionManager([], []),
      { wrapper: wrapper(store) }
    );

    // 初始状态下 previewTexture 应该为 null
    const state = store.getState();
    expect(state.ui.previewTexture).toBeNull();
  });

  it('应该在有图片导入节点且有 imageData 时设置预览', () => {
    const store = createTestStore();
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const nodes = [
      {
        id: 'image_import-1',
        data: {
          nodeType: 'image_import',
          params: {
            imageData: testImageData,
          },
        },
      },
    ];

    const { result } = renderHook(
      () => useExecutionManager(nodes, []),
      { wrapper: wrapper(store) }
    );

    // 由于是异步加载图片，需要等待
    // 这里我们验证 store 状态是否正确更新 - 应该有数据
    const state = store.getState();
    // 验证预览纹理已被设置（不是 null）
    expect(state.ui.previewTexture).toBe(testImageData);
  });

  it('应该忽略非图片导入节点', () => {
    const store = createTestStore();
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const nodes = [
      {
        id: 'blur-1',
        data: {
          nodeType: 'gaussian_blur',
          params: {
            imageData: testImageData,
          },
        },
      },
    ];

    renderHook(
      () => useExecutionManager(nodes, []),
      { wrapper: wrapper(store) }
    );

    const state = store.getState();
    // 应该保持 null，因为不是 image_import 节点
    expect(state.ui.previewTexture).toBeNull();
  });

  it('应该在节点没有 imageData 参数时清除预览', () => {
    const store = createTestStore();

    const nodes = [
      {
        id: 'image_import-1',
        data: {
          nodeType: 'image_import',
          params: {},
        },
      },
    ];

    renderHook(
      () => useExecutionManager(nodes, []),
      { wrapper: wrapper(store) }
    );

    const state = store.getState();
    // 应该保持 null，因为没有 imageData
    expect(state.ui.previewTexture).toBeNull();
  });
});
