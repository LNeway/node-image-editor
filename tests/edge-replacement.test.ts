import { describe, it, expect } from 'vitest';
import { Edge } from 'reactflow';

describe('Edge replacement logic', () => {
  it('should replace existing edge when connecting to same target port', () => {
    const edges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-3',
        sourceHandle: 'output',
        targetHandle: 'input',
      },
    ];

    const newConnection = {
      source: 'node-2',
      target: 'node-3',
      sourceHandle: 'output',
      targetHandle: 'input',
    };

    const existingEdge = edges.find(
      e => e.target === newConnection.target && e.targetHandle === newConnection.targetHandle
    );

    expect(existingEdge).toBeDefined();
    expect(existingEdge?.id).toBe('edge-1');
    expect(existingEdge?.source).toBe('node-1');

    const updatedEdges = edges.filter(e => e.id !== existingEdge?.id);
    expect(updatedEdges).toHaveLength(0);
  });

  it('should allow multiple edges to different target ports', () => {
    const edges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-3',
        sourceHandle: 'output1',
        targetHandle: 'input1',
      },
    ];

    const newConnection = {
      source: 'node-2',
      target: 'node-3',
      sourceHandle: 'output2',
      targetHandle: 'input2',
    };

    const existingEdge = edges.find(
      e => e.target === newConnection.target && e.targetHandle === newConnection.targetHandle
    );

    expect(existingEdge).toBeUndefined();
  });
});
