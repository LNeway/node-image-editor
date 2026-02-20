export interface GraphNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DirtyNode {
  nodeId: string;
  reason: 'param_change' | 'input_change' | 'connection_change';
}

export interface ExecutionResult {
  nodeId: string;
  outputs: Record<string, any>;
  error?: string;
}
