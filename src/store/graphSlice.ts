import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
}

const initialState: GraphState = {
  nodes: [
    {
      id: 'solid_color-demo',
      type: 'custom',
      position: { x: 400, y: 300 },
      data: {
        label: '纯色填充',
        labelKey: 'node.input.solid_color',
        category: '输入',
        inputs: [],
        outputs: [{ name: 'image', type: 'image' }],
        nodeType: 'solid_color',
        params: {
          color: { r: 1, g: 0, b: 0, a: 1 }, // Red
          width: 1920,
          height: 1080,
        },
      },
    },
    {
      id: 'preview_output-demo',
      type: 'custom',
      position: { x: 750, y: 300 },
      data: {
        label: '预览输出',
        labelKey: 'node.output.preview_output',
        category: '输出',
        inputs: [{ name: 'image', type: 'image' }],
        outputs: [],
        nodeType: 'preview_output',
        params: {},
      },
    },
  ],
  edges: [
    {
      id: 'edge-solid',
      source: 'solid_color-demo',
      target: 'preview_output-demo',
      sourceHandle: 'image',
      targetHandle: 'image',
      type: 'custom',
      animated: true,
      style: { stroke: '#00b894', strokeWidth: 2 },
    },
  ],
};

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<Node>) => {
      state.nodes.push(action.payload);
    },
    updateNode: (state, action: PayloadAction<{ id: string; data: Record<string, any> }>) => {
      const index = state.nodes.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        // 创建新的节点对象以确保 React 检测到变化
        const oldNode = state.nodes[index];
        const newNode = {
          ...oldNode,
          data: { ...oldNode.data, ...action.payload.data },
        };
        // 创建新的数组引用以确保 useSelector 检测到变化
        state.nodes = [
          ...state.nodes.slice(0, index),
          newNode,
          ...state.nodes.slice(index + 1),
        ];
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((n) => n.id !== action.payload);
      state.edges = state.edges.filter(
        (e) => e.source !== action.payload && e.target !== action.payload
      );
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload);
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter((e) => e.id !== action.payload);
    },
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
  },
});

export const { addNode, updateNode, removeNode, addEdge, removeEdge, setNodes, setEdges } =
  graphSlice.actions;
export default graphSlice.reducer;
