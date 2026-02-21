import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreviewTexture, setPreviewSize } from '../store/uiSlice';
import { RootState } from '../store';
import { Node, Edge } from 'reactflow';

/**
 * ExecutionManager - 执行节点并更新预览
 * 遵循数据驱动原则：从 Redux store 读取节点数据
 * 遵循连接关系：只显示连接到预览输出节点的源节点输出
 * 优化：节点位置变化不触发预览更新
 */
export function useExecutionManager() {
  const dispatch = useDispatch();
  
  // 数据驱动：从 Redux store 读取数据
  const graphNodes = useSelector((state: RootState) => state.graph.nodes);
  const graphEdges = useSelector((state: RootState) => state.graph.edges);

  // 使用 ref 记录上一次的边和节点参数，用于比较变化
  const prevEdgesRef = useRef<Edge[]>([]);
  const prevNodeParamsRef = useRef<Map<string, any>>(new Map());

  // 生成纯色图片的 dataUrl
  const generateSolidColorDataUrl = (color: { r: number; g: number; b: number; a: number }, width = 1920, height = 1080): string => {
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
    return canvas.toDataURL('image/png');
  };

  // 执行单个节点并获取输出
  const executeNode = (node: any): { dataUrl?: string; width?: number; height?: number } | null => {
    const nodeType = node.data?.nodeType;
    const params = node.data?.params || {};
    
    switch (nodeType) {
      case 'image_import': {
        const imageData = params.imageData;
        if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
          return { dataUrl: imageData, width: 1920, height: 1080 };
        }
        return null;
      }
      
      case 'solid_color': {
        const color = params.color || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
        const width = params.width || 1920;
        const height = params.height || 1080;
        const dataUrl = generateSolidColorDataUrl(color, width, height);
        return { dataUrl, width, height };
      }
      
      default:
        return null;
    }
  };

  // 检查是否有需要更新预览的变化
  const hasPreviewRelevantChange = (nodes: Node[], edges: Edge[]): boolean => {
    // 1. 检查边的变化（连接/断开）
    const prevEdges = prevEdgesRef.current;
    if (edges.length !== prevEdges.length) {
      prevEdgesRef.current = edges;
      return true;
    }
    
    // 检查边的 source/target 变化
    const edgeChanged = edges.some((edge, i) => {
      const prev = prevEdges[i];
      return !prev || edge.source !== prev.source || edge.target !== prev.target;
    });
    if (edgeChanged) {
      prevEdgesRef.current = edges;
      return true;
    }

    // 2. 检查节点参数变化（忽略位置变化）
    const prevParams = prevNodeParamsRef.current;
    const currentParams = new Map<string, any>();
    
    for (const node of nodes) {
      const nodeType = node.data?.nodeType;
      const params = node.data?.params || {};
      const key = `${node.id}-${nodeType}`;
      
      // 记录当前参数
      currentParams.set(key, JSON.stringify(params));
      
      // 比较参数变化
      const prevParamStr = prevParams.get(key);
      if (!prevParamStr || prevParamStr !== JSON.stringify(params)) {
        prevNodeParamsRef.current = currentParams;
        return true;
      }
    }
    
    // 检查是否有节点被删除
    if (prevParams.size !== currentParams.size) {
      prevNodeParamsRef.current = currentParams;
      return true;
    }
    
    return false;
  };

  // Execute when nodes or edges change
  useEffect(() => {
    // 检查是否有需要更新预览的变化
    if (!hasPreviewRelevantChange(graphNodes, graphEdges)) {
      return;
    }

    // 查找连接到 preview_output 节点的边
    const previewInputEdges = graphEdges.filter(edge => {
      const targetNode = graphNodes.find(n => n.id === edge.target);
      return targetNode?.data?.nodeType === 'preview_output';
    });

    if (previewInputEdges.length === 0) {
      dispatch(setPreviewTexture(null));
      return;
    }

    // 获取所有源节点
    const sourceNodeIds = previewInputEdges.map(edge => edge.source);
    
    // 执行每个源节点
    for (const nodeId of sourceNodeIds) {
      const sourceNode = graphNodes.find(n => n.id === nodeId);
      if (!sourceNode) continue;
      
      const result = executeNode(sourceNode);
      
      if (result && result.dataUrl) {
        console.log(`[Execution] Executed ${sourceNode.data?.nodeType} node, updating preview`);
        
        dispatch(setPreviewTexture(result.dataUrl));
        dispatch(setPreviewSize({ 
          width: result.width || 1920, 
          height: result.height || 1080 
        }));
        return;
      }
    }
    
    // 源节点没有有效输出
    dispatch(setPreviewTexture(null));
  }, [graphNodes, graphEdges, dispatch]);
}
