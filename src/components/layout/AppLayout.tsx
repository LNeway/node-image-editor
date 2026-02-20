import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from 'reactflow';
import { addNode, addEdge as addGraphEdge } from '../../store/graphSlice';
import TopToolbar from '../layout/TopToolbar';
import NodeLibrary from '../node-library/NodeLibrary';
import NodeCanvas from '../canvas/NodeCanvas';
import PropertiesPanel from '../properties/PropertiesPanel';
import { nodeRegistry } from '../../core/nodes/NodeRegistry';

export default function AppLayout() {
  const dispatch = useDispatch();
  
  // React Flow state
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);

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

  // 连接处理
  const onConnect: OnConnect = useCallback(
    (connection) => {
      setRfEdges((eds) => addEdge({ ...connection, type: 'smoothstep', animated: true }, eds));
      
      // 同时更新 Redux store
      if (connection.source && connection.target) {
        dispatch(addGraphEdge({
          id: `${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        }));
      }
    },
    [dispatch]
  );

  // 添加节点到画布
  const handleAddNode = useCallback((nodeType: string) => {
    const nodeDef = nodeRegistry.get(nodeType);
    if (!nodeDef) return;

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: 'custom',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: nodeDef.label,
        category: nodeDef.category,
        inputs: nodeDef.inputs,
        outputs: nodeDef.outputs,
        params: nodeDef.params.reduce((acc: Record<string, unknown>, p) => {
          acc[p.key] = p.default;
          return acc;
        }, {}),
      },
    };

    setRfNodes((nds) => [...nds, newNode]);
    dispatch(addNode(newNode));
  }, [dispatch]);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary">
      {/* 顶部工具栏 */}
      <TopToolbar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧节点库 */}
        <NodeLibrary onAddNode={handleAddNode} />
        
        {/* 中间画布 */}
        <NodeCanvas
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
        
        {/* 右侧属性面板 */}
        <PropertiesPanel />
      </div>
      
      {/* 底部状态栏 */}
      <div className="h-8 bg-bg-secondary border-t border-border-color flex items-center px-4 text-sm text-text-secondary">
        <span>Status Bar</span>
        <span className="ml-auto">Nodes: {rfNodes.length} | Edges: {rfEdges.length}</span>
      </div>
    </div>
  );
}
