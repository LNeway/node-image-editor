import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDispatch } from 'react-redux';
import { setSelectedNode } from '../../store/uiSlice';
import CustomNode from './CustomNode';
import ContextMenu from './ContextMenu';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface NodeCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
}

export default function NodeCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: NodeCanvasProps) {
  const dispatch = useDispatch();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    dispatch(setSelectedNode(node.id));
  }, [dispatch]);

  const onPaneClick = useCallback(() => {
    dispatch(setSelectedNode(null));
    setContextMenu(null);
  }, [dispatch]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        style={{ height: '100%', width: '100%' }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#00b894', strokeWidth: 2 },
        }}
      >
        <Controls
          className="!bg-bg-secondary !border-border-color !text-text-primary"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-bg-secondary !border-border-color"
          nodeColor="#00b894"
          maskColor="rgba(0, 0, 0, 0.5)"
          style={{
            backgroundColor: '#2d2d2d',
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={15}
          size={1}
          color="#404040"
        />
      </ReactFlow>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
