import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreviewTexture, setPreviewSize } from '../store/uiSlice';
import { RootState } from '../store';

/**
 * ExecutionManager - 自动检测图片导入节点并显示预览
 */
export function useExecutionManager() {
  const dispatch = useDispatch();
  const graphNodes = useSelector((state: RootState) => state.graph.nodes);
  const graphEdges = useSelector((state: RootState) => state.graph.edges);

  // Execute when nodes change - find any image_import node with image data
  useEffect(() => {
    // Find image_import node with image data
    for (const node of graphNodes) {
      const nodeType = (node.data as any)?.nodeType;
      if (nodeType === 'image_import') {
        const params = (node.data as any)?.params || {};
        const imageData = params.imageData;
        
        if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
          console.log('[Execution] Found image_import node with data, updating preview');
          
          // Load image to get dimensions
          const img = new Image();
          img.onload = () => {
            dispatch(setPreviewSize({ width: img.width, height: img.height }));
          };
          img.src = imageData;
          
          dispatch(setPreviewTexture(imageData));
          return;
        }
      }
    }
    
    // No image found - clear preview
    dispatch(setPreviewTexture(null));
  }, [graphNodes, graphEdges, dispatch]);
}
