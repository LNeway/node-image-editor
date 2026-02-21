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
        let imageData = params.imageData;
        
        // 如果是相对路径，转换为完整路径
        if (imageData && typeof imageData === 'string' && !imageData.startsWith('data:') && !imageData.startsWith('http')) {
          imageData = imageData;
        }
        
        if (imageData && typeof imageData === 'string' && (imageData.startsWith('data:') || imageData.startsWith('/'))) {
          console.log('[Execution] Found image_import node with data, updating preview');
          
          // 如果是路径，先加载为 base64
          const loadImage = (src: string) => {
            // 尝试直接使用
            if (src.startsWith('data:')) {
              dispatch(setPreviewTexture(src));
              const img = new Image();
              img.onload = () => {
                dispatch(setPreviewSize({ width: img.width, height: img.height }));
              };
              img.src = src;
              return;
            }
            
            // 路径需要通过 fetch 加载
            fetch(src)
              .then(r => r.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = reader.result as string;
                  dispatch(setPreviewTexture(dataUrl));
                  const img = new Image();
                  img.onload = () => {
                    dispatch(setPreviewSize({ width: img.width, height: img.height }));
                  };
                  img.src = dataUrl;
                };
                reader.readAsDataURL(blob);
              })
              .catch(() => {
                console.log('[Execution] Failed to load image:', src);
              });
          };
          
          loadImage(imageData);
          return;
        }
      }
    }
    
    // No image found - clear preview (but keep panel visible in demo mode)
    // dispatch(setPreviewTexture(null));
  }, [graphNodes, graphEdges, dispatch]);
}
