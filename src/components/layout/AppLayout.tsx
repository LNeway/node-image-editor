import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from 'reactflow';
import { addNode, addEdge as addGraphEdge, setNodes, setEdges } from '../../store/graphSlice';
import { selectNode } from '../../store/uiSlice';
import { RootState } from '../../store';
import TopToolbar from '../layout/TopToolbar';
import NodeLibrary from '../node-library/NodeLibrary';
import NodeCanvas from '../canvas/NodeCanvas';
import PropertiesPanel from '../properties/PropertiesPanel';
import PreviewPanel from '../preview/PreviewPanel';
import { nodeRegistry } from '../../core/nodes/NodeRegistry';
import { useTranslation } from 'react-i18next';
import { useExecutionManager } from '../../hooks/useExecutionManager';

export default function AppLayout() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  // ========== 数据驱动：所有状态从 Redux 读取 ==========
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const edges = useSelector((state: RootState) => state.graph.edges);
  const selectedNodeId = useSelector((state: RootState) => state.ui.selectedNodeId);
  
  // 执行引擎 - 从 Redux 读取数据
  useExecutionManager();

  // 节点变化处理 - 更新到 Redux
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // 使用 React Flow 的 applyNodeChanges 处理变化
      const newNodes = applyNodeChanges(changes, nodes);
      dispatch(setNodes(newNodes));
    },
    [dispatch, nodes]
  );

  // 边变化处理 - 更新到 Redux
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, edges);
      dispatch(setEdges(newEdges));
    },
    [dispatch, edges]
  );

  // 连接处理 - 更新到 Redux
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      
      // 创建新边配置
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: 'bezier',
        animated: true,
        style: { stroke: '#00b894', strokeWidth: 2 },
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      };
      
      // 使用 React Flow 的 addEdge 处理
      const updatedEdges = addEdge(newEdge, edges);
      dispatch(setEdges(updatedEdges));
      
      // 同时更新 Redux store
      dispatch(addGraphEdge(newEdge));
    },
    [dispatch, edges]
  );

  // 节点点击处理 - 更新 Redux
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    dispatch(selectNode(node.id));
  }, [dispatch]);

  // 画布点击取消选中 - 更新 Redux
  const handlePaneClick = useCallback(() => {
    dispatch(selectNode(null));
  }, [dispatch]);

  // 从 Redux 获取当前选中的节点
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // 添加节点到画布 - 更新 Redux
  const handleAddNode = useCallback((nodeType: string) => {
    const nodeDef = nodeRegistry.get(nodeType);
    if (!nodeDef) return;

    // 根据节点类型设置不同的默认位置
    const nodePositions: Record<string, { x: number; y: number }> = {
      image_import: { x: 100, y: 200 },
      gaussian_blur: { x: 450, y: 200 },
      preview_output: { x: 800, y: 200 },
      brightness_contrast: { x: 450, y: 200 },
      color_balance: { x: 450, y: 350 },
      hsl_adjust: { x: 450, y: 350 },
      levels: { x: 450, y: 350 },
      solid_color: { x: 100, y: 350 },
      flip: { x: 450, y: 200 },
      rotate: { x: 450, y: 200 },
      scale: { x: 450, y: 200 },
      crop: { x: 450, y: 200 },
      blend: { x: 450, y: 200 },
      image_export: { x: 800, y: 200 },
    };
    
    const defaultPos = nodePositions[nodeType] || { x: 100 + (nodes.length * 300), y: 200 };
    
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: 'custom',
      position: defaultPos,
      data: {
        label: t(nodeDef.label),
        labelKey: nodeDef.label,
        category: nodeDef.category,
        inputs: nodeDef.inputs,
        outputs: nodeDef.outputs,
        nodeType: nodeType,
        params: nodeDef.params.reduce((acc: Record<string, unknown>, p) => {
          acc[p.key] = p.default;
          return acc;
        }, {}),
      },
    };

    // 只更新 Redux store
    dispatch(addNode(newNode));
  }, [dispatch, nodes.length, t]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1a1a1a] text-white">
      {/* 顶部工具栏 */}
      <TopToolbar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧节点库 */}
        <NodeLibrary onAddNode={handleAddNode} />
        
        {/* 中间画布 - 数据来自 Redux */}
        <div className="flex-1 relative">
          <NodeCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
          />
          
          {/* 悬浮预览面板 - 覆盖在画布上 */}
          <PreviewPanel />
        </div>
        
        {/* 右侧属性面板 - 数据来自 Redux */}
        <PropertiesPanel selectedNode={selectedNode} />
      </div>
      
      {/* 底部状态栏 */}
      <div className="h-8 bg-[#252525] border-t border-[#333] flex items-center px-4 text-sm text-[#666]">
        <span>Status Bar</span>
        <span className="ml-auto">Nodes: {nodes.length} | Edges: {edges.length}</span>
      </div>
    </div>
  );
}
