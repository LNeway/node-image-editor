import { describe, it, expect } from 'vitest';
import { topologicalSort, detectCycle } from '../../src/core/engine/TopologySorter';

describe('TopologySorter', () => {
  const nodes = [
    { id: 'a', type: 'input', data: {}, position: { x: 0, y: 0 } },
    { id: 'b', type: 'adjust', data: {}, position: { x: 100, y: 0 } },
    { id: 'c', type: 'output', data: {}, position: { x: 200, y: 0 } },
  ];

  const edges = [
    { id: 'e1', source: 'a', target: 'b' },
    { id: 'e2', source: 'b', target: 'c' },
  ];

  it('should sort nodes in topological order', () => {
    const result = topologicalSort(nodes, edges, new Set(['b', 'c']));
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('c');
    const aIdx = result.indexOf('a');
    const bIdx = result.indexOf('b');
    const cIdx = result.indexOf('c');
    expect(aIdx).toBeLessThan(bIdx);
    expect(bIdx).toBeLessThan(cIdx);
  });

  it('should detect cycles', () => {
    const cyclicEdges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' },
      { id: 'e3', source: 'c', target: 'a' },
    ];
    expect(detectCycle(nodes, cyclicEdges)).toBe(true);
  });

  it('should return false for acyclic graph', () => {
    expect(detectCycle(nodes, edges)).toBe(false);
  });
});
