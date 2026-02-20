import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from 'reactflow';
import { addNode, addEdge as addGraphEdge } from '../../store/graphSlice';
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
  
  // React Flow state
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Execution manager
  useExecutionManager();

  // 节点变化处理
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setRfNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  // 边变化处理
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setRfEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  // 连接处理 - 使用 React Flow 的 addEdge 返回新边
  const onConnect: OnConnect = useCallback(
    (connection) => {
      // 使用 React Flow 的 addEdge 创建新边
      setRfEdges((eds) => {
        // 创建新边配置
        const newEdge = {
          ...connection,
          id: `edge-${Date.now()}`,
          type: 'bezier',
          animated: true,
          style: { stroke: '#00b894', strokeWidth: 2 },
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        };
        
        // 使用 addEdge 处理并返回新边列表
        return addEdge(newEdge, eds);
      });
      
      // 同时更新 Redux store
      if (connection.source && connection.target) {
        dispatch(addGraphEdge({
          id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle || null,
          targetHandle: connection.targetHandle || null,
        }));
      }
    },
    [dispatch]
  );

  // 节点点击处理
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // 画布点击取消选中
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // 获取当前选中的节点数据
  const selectedNode = rfNodes.find(n => n.id === selectedNodeId);

  // 添加节点到画布
  const handleAddNode = useCallback((nodeType: string) => {
    const nodeDef = nodeRegistry.get(nodeType);
    if (!nodeDef) return;

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: 'custom',
      position: {
        x: 100 + (Math.random() * 200),
        y: 100 + (rfNodes.length * 120),
      },
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

    setRfNodes((nds) => [...nds, newNode]);
    dispatch(addNode(newNode));
  }, [dispatch, rfNodes.length, t]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1a1a1a] text-white">
      {/* 顶部工具栏 */}
      <TopToolbar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧节点库 */}
        <NodeLibrary onAddNode={handleAddNode} />
        
        {/* 中间画布 */}
        <div className="flex-1 relative">
          <NodeCanvas
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
          />
          
          {/* 悬浮预览面板 - 覆盖在画布上 */}
          <PreviewPanel />
        </div>
        
        {/* 右侧属性面板 */}
        <PropertiesPanel selectedNode={selectedNode} />
      </div>
      
      {/* 底部状态栏 */}
      <div className="h-8 bg-[#252525] border-t border-[#333] flex items-center px-4 text-sm text-[#666]">
        <span>Status Bar</span>
        <span className="ml-auto">Nodes: {rfNodes.length} | Edges: {rfEdges.length}</span>
      </div>
    </div>
  );
}
