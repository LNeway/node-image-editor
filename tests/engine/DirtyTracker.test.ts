import { describe, it, expect, beforeEach } from 'vitest';
import { DirtyTracker } from '../../src/core/engine/DirtyTracker';

describe('DirtyTracker', () => {
  let tracker: DirtyTracker;

  beforeEach(() => {
    tracker = new DirtyTracker();
  });

  it('should mark node as dirty', () => {
    tracker.markDirty('node1', 'param_change');
    expect(tracker.isDirty('node1')).toBe(true);
  });

  it('should clear dirty node', () => {
    tracker.markDirty('node1', 'param_change');
    tracker.clearDirty('node1');
    expect(tracker.isDirty('node1')).toBe(false);
  });

  it('should clear all dirty nodes', () => {
    tracker.markDirty('node1', 'param_change');
    tracker.markDirty('node2', 'input_change');
    tracker.clearAll();
    expect(tracker.getDirtyNodes().size).toBe(0);
  });

  it('should mark downstream nodes as dirty', () => {
    const edges = [
      { id: 'e1', source: 'node1', target: 'node2' },
      { id: 'e2', source: 'node2', target: 'node3' },
    ];

    tracker.markDownstreamDirty('node1', edges);
    expect(tracker.isDirty('node2')).toBe(true);
    expect(tracker.isDirty('node3')).toBe(true);
    expect(tracker.isDirty('node1')).toBe(false);
  });

  it('should prioritize param_change over input_change', () => {
    tracker.markDirty('node1', 'input_change');
    tracker.markDirty('node1', 'param_change');
    expect(tracker.isDirty('node1')).toBe(true);
  });
});
