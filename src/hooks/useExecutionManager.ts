import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreviewTexture, setPreviewSize } from '../store/uiSlice';
import { RootState } from '../store';
import { Node, Edge } from 'reactflow';

/**
 * ExecutionManager - 执行节点链并更新预览
 * 遵循数据驱动原则：从 Redux store 读取节点数据
 * 遵循连接关系：执行完整的节点链并显示结果
 */
export function useExecutionManager() {
  const dispatch = useDispatch();
  
  const graphNodes = useSelector((state: RootState) => state.graph.nodes);
  const graphEdges = useSelector((state: RootState) => state.graph.edges);

  const prevEdgesRef = useRef<Edge[]>([]);
  const prevNodeParamsRef = useRef<Map<string, any>>(new Map());

  // 加载图片为 Image 对象
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // 应用 HSL 调整
  const applyHSLAdjust = (
    imageData: ImageData, 
    hue: number, 
    saturation: number, 
    lightness: number
  ): ImageData => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] / 255;
      let g = data[i + 1] / 255;
      let b = data[i + 2] / 255;

      // 转换为 HSL
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      // 应用调整
      const adjustedH = (h + hue / 360) % 1;
      const adjustedS = Math.max(0, Math.min(1, s + saturation / 100));
      const adjustedL = Math.max(0, Math.min(1, l + lightness / 100));

      // 转换回 RGB
      let r1 = 0, g1 = 0, b1 = 0;
      if (adjustedS === 0) {
        r1 = g1 = b1 = adjustedL;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = adjustedL < 0.5 ? adjustedL * (1 + adjustedS) : adjustedL + adjustedS - adjustedL * adjustedS;
        const p = 2 * adjustedL - q;
        r1 = hue2rgb(p, q, adjustedH + 1/3);
        g1 = hue2rgb(p, q, adjustedH);
        b1 = hue2rgb(p, q, adjustedH - 1/3);
      }

      data[i] = r1 * 255;
      data[i + 1] = g1 * 255;
      data[i + 2] = b1 * 255;
    }
    return imageData;
  };

  // 应用亮度/对比度调整
  const applyBrightnessContrast = (
    imageData: ImageData,
    brightness: number,
    contrast: number
  ): ImageData => {
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128 + brightness * 255;
      data[i + 1] = factor * (data[i + 1] - 128) + 128 + brightness * 255;
      data[i + 2] = factor * (data[i + 2] - 128) + 128 + brightness * 255;
    }
    return imageData;
  };

  // 执行节点链
  const executeChain = async (sourceNodeId: string): Promise<{ dataUrl: string; width: number; height: number } | null> => {
    // 拓扑排序：从源头到预览节点
    const getExecutionOrder = (startId: string): string[] => {
      const order: string[] = [startId];
      let currentId = startId;
      
      while (true) {
        // 找到连接到当前节点的下一节点
        const nextEdge = graphEdges.find(e => e.source === currentId);
        if (!nextEdge) break;
        
        currentId = nextEdge.target;
        order.push(currentId);
      }
      
      return order;
    };

    const nodeIds = getExecutionOrder(sourceNodeId);
    const nodesMap = new Map(graphNodes.map(n => [n.id, n]));

    // 从源头节点开始
    let currentDataUrl: string | null = null;
    let width = 1920;
    let height = 1080;

    for (const nodeId of nodeIds) {
      const node = nodesMap.get(nodeId);
      if (!node) continue;

      const nodeType = node.data?.nodeType;
      const params = node.data?.params || {};

      switch (nodeType) {
        case 'image_import': {
          const imageData = params.imageData;
          if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
            const img = await loadImage(imageData);
            width = img.width;
            height = img.height;
            currentDataUrl = imageData;
          }
          break;
        }

        case 'solid_color': {
          const color = params.color || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
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

        case 'hsl_adjust': {
          if (!currentDataUrl) break;
          const img = await loadImage(currentDataUrl);
          width = img.width;
          height = img.height;
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, width, height);
            const adjusted = applyHSLAdjust(
              imageData,
              params.hue || 0,
              params.saturation || 0,
              params.lightness || 0
            );
            ctx.putImageData(adjusted, 0, 0);
          }
          currentDataUrl = canvas.toDataURL('image/png');
          break;
        }

        case 'brightness_contrast': {
          if (!currentDataUrl) break;
          const img = await loadImage(currentDataUrl);
          width = img.width;
          height = img.height;
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, width, height);
            const adjusted = applyBrightnessContrast(
              imageData,
              params.brightness || 0,
              params.contrast || 0
            );
            ctx.putImageData(adjusted, 0, 0);
          }
          currentDataUrl = canvas.toDataURL('image/png');
          break;
        }

        case 'gaussian_blur': {
          if (!currentDataUrl) break;
          const img = await loadImage(currentDataUrl);
          width = img.width;
          height = img.height;
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.filter = `blur(${params.radius || 5}px)`;
            ctx.drawImage(img, 0, 0);
          }
          currentDataUrl = canvas.toDataURL('image/png');
          break;
        }

        case 'preview_output': {
          // 预览节点，结束
          break;
        }

        default:
          // 未支持的节点类型，透传
          break;
      }
    }

    if (currentDataUrl) {
      return { dataUrl: currentDataUrl, width, height };
    }
    return null;
  };

  const hasPreviewRelevantChange = (nodes: Node[], edges: Edge[]): boolean => {
    const prevEdges = prevEdgesRef.current;
    if (edges.length !== prevEdges.length) {
      prevEdgesRef.current = edges;
      return true;
    }
    
    const edgeChanged = edges.some((edge, i) => {
      const prev = prevEdges[i];
      return !prev || edge.source !== prev.source || edge.target !== prev.target;
    });
    if (edgeChanged) {
      prevEdgesRef.current = edges;
      return true;
    }

    const prevParams = prevNodeParamsRef.current;
    const currentParams = new Map<string, any>();
    
    for (const node of nodes) {
      const nodeType = node.data?.nodeType;
      const params = node.data?.params || {};
      const key = `${node.id}-${nodeType}`;
      currentParams.set(key, JSON.stringify(params));
      
      const prevParamStr = prevParams.get(key);
      if (!prevParamStr || prevParamStr !== JSON.stringify(params)) {
        prevNodeParamsRef.current = currentParams;
        return true;
      }
    }
    
    if (prevParams.size !== currentParams.size) {
      prevNodeParamsRef.current = currentParams;
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (!hasPreviewRelevantChange(graphNodes, graphEdges)) {
      return;
    }

    // 找到连接到 preview_output 的边
    const previewInputEdges = graphEdges.filter(edge => {
      const targetNode = graphNodes.find(n => n.id === edge.target);
      return targetNode?.data?.nodeType === 'preview_output';
    });

    if (previewInputEdges.length === 0) {
      dispatch(setPreviewTexture(null));
      return;
    }

    // 执行节点链
    const sourceNodeId = previewInputEdges[0].source;
    
    executeChain(sourceNodeId).then(result => {
      if (result) {
        console.log('[Execution] Executed node chain, updating preview');
        dispatch(setPreviewTexture(result.dataUrl));
        dispatch(setPreviewSize({ width: result.width, height: result.height }));
      } else {
        dispatch(setPreviewTexture(null));
      }
    }).catch(err => {
      console.error('[Execution] Error executing chain:', err);
      dispatch(setPreviewTexture(null));
    });
  }, [graphNodes, graphEdges, dispatch]);
}
