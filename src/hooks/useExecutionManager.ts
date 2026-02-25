import { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreviewTexture, setPreviewSize } from '../store/uiSlice';
import { RootState } from '../store';

/**
 * ExecutionManager - 执行节点链并更新预览
 * 简化版本：直接加载图片并显示
 */
export function useExecutionManager() {
  const dispatch = useDispatch();
  
  const graphNodes = useSelector((state: RootState) => state.graph.nodes);
  const graphEdges = useSelector((state: RootState) => state.graph.edges);

  // 使用 ref 存储之前的状态，只在数据实际变化时触发 effect
  // 这样可以排除 position 变化（拖拽节点时）导致的预览刷新
  const prevNodesDataRef = useRef<string>('');
  const prevEdgesDataRef = useRef<string>('');

  // 提取节点的data部分用于比较（排除position变化）
  // 只关心 nodeType 和 params 的变化，不关心位置变化
  const getNodesData = () => {
    return graphNodes.map(node => ({
      id: node.id,
      nodeType: node.data?.nodeType,
      params: node.data?.params,
    }));
  };

  // 序列化节点数据用于比较
  const currentNodesDataStr = JSON.stringify(getNodesData());
  
  // 序列化边数据用于比较
  const currentEdgesDataStr = JSON.stringify(graphEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
  })));
  
  // 检查数据是否真正变化
  const nodesDataChanged = prevNodesDataRef.current !== currentNodesDataStr;
  const edgesDataChanged = prevEdgesDataRef.current !== currentEdgesDataStr;
  
  // 只有当节点数据或边数据实际变化时才触发 effect
  const shouldExecute = nodesDataChanged || edgesDataChanged;
  
  if (nodesDataChanged) {
    prevNodesDataRef.current = currentNodesDataStr;
    console.log('[Execution] Nodes data changed, will trigger effect');
  }
  if (edgesDataChanged) {
    prevEdgesDataRef.current = currentEdgesDataStr;
    console.log('[Execution] Edges data changed, will trigger effect');
  }
  if (!shouldExecute) {
    console.log('[Execution] Data unchanged, skipping effect');
  }
  if (edgesDataChanged) {
    prevEdgesDataRef.current = currentEdgesDataStr;
  }

  // 加载图片
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // 执行节点链
  const executeChain = async (sourceNodeId: string): Promise<{ dataUrl: string; width: number; height: number } | null> => {
    // 找到最源头的节点（没有输入边的节点）
    const findSourceNode = (nodeId: string): string => {
      const incomingEdges = graphEdges.filter(e => e.target === nodeId);
      if (incomingEdges.length === 0) {
        return nodeId;
      }
      return findSourceNode(incomingEdges[0].source);
    };

    const sourceId = findSourceNode(sourceNodeId);
    console.log('[Execution] Source node:', sourceId);

    const nodesMap = new Map(graphNodes.map(n => [n.id, n]));
    
    // 按拓扑顺序执行：从源头到目标
    const executeOrder: string[] = [];
    let currentId = sourceId;
    
    while (currentId) {
      executeOrder.push(currentId);
      const nextEdge = graphEdges.find(e => e.source === currentId);
      if (!nextEdge) break;
      currentId = nextEdge.target;
    }
    
    console.log('[Execution] Execute order:', executeOrder);

    let currentDataUrl: string | null = null;
    let width = 1920;
    let height = 1080;

    for (const nodeId of executeOrder) {
      const node = nodesMap.get(nodeId);
      if (!node) continue;

      const nodeType = node.data?.nodeType;
      const params = node.data?.params || {};

      switch (nodeType) {
        case 'image_import': {
          const imageData = params.imageData;
          if (imageData && typeof imageData === 'string') {
            try {
              const img = await loadImage(imageData);
              width = img.width || 1920;
              height = img.height || 1080;
              currentDataUrl = imageData;
              console.log('[Execution] Loaded image:', imageData.slice(0, 50));
            } catch (e) {
              console.error('[Execution] Failed to load image:', imageData, e);
            }
          }
          break;
        }

        case 'solid_color': {
          const colorParam = params.color;
          // 确保 color 是有效对象，否则使用默认值
          const color = (colorParam && typeof colorParam === 'object' && 'r' in colorParam)
            ? colorParam 
            : { r: 0.5, g: 0.5, b: 0.5, a: 1 };
          width = params.width || 1920;
          height = params.height || 1080;
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const r = Math.round(color.r * 255);
            const g = Math.round(color.g * 255);
            const b = Math.round(color.b * 255);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${color.a})`;
            ctx.fillRect(0, 0, width, height);
          }
          currentDataUrl = canvas.toDataURL('image/png');
          break;
        }

        case 'preview_output':
          break;

        default:
          break;
      }
    }

    if (currentDataUrl) {
      return { dataUrl: currentDataUrl, width, height };
    }
    return null;
  };

  useEffect(() => {
    console.log('[Execution] useEffect triggered, nodes:', graphNodes.length);
    
    // 总是尝试执行，只要有 preview_output 节点
    const hasPreviewOutputNode = graphNodes.some(n => n.data?.nodeType === 'preview_output');
    if (!hasPreviewOutputNode) {
      console.log('[Execution] No preview output node, skipping');
      return;
    }

    // 找到连接到 preview_output 的边
    const previewInputEdges = graphEdges.filter(edge => {
      const targetNode = graphNodes.find(n => n.id === edge.target);
      return targetNode?.data?.nodeType === 'preview_output';
    });

    console.log('[Execution] previewInputEdges:', previewInputEdges.length);

    if (previewInputEdges.length === 0) {
      dispatch(setPreviewTexture(null));
      return;
    }

    const sourceNodeId = previewInputEdges[0].source;
    console.log('[Execution] Executing chain from:', sourceNodeId);
    
    executeChain(sourceNodeId).then(result => {
      if (result) {
        console.log('[Execution] Chain result:', result.dataUrl.slice(0, 50));
        dispatch(setPreviewTexture(result.dataUrl));
        dispatch(setPreviewSize({ width: result.width, height: result.height }));
      } else {
        console.log('[Execution] Chain result is null');
        dispatch(setPreviewTexture(null));
      }
    }).catch(err => {
      console.error('[Execution] Error:', err);
      dispatch(setPreviewTexture(null));
    });
  }, [shouldExecute, dispatch]);
}
