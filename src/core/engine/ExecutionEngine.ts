import { GraphEdge, ExecutionResult } from './types';
import { DirtyTracker } from './DirtyTracker';

export class ExecutionEngine {
  private dirtyTracker: DirtyTracker;
  private nodeResults: Map<string, Record<string, any>> = new Map();
  private executeCallbacks: ((results: ExecutionResult[]) => void)[] = [];
  private debounceTimeout: number | null = null;
  private debounceMs: number = 100;

  constructor() {
    this.dirtyTracker = new DirtyTracker();
  }

  markNodeDirty(nodeId: string, reason: 'param_change' | 'input_change' | 'connection_change'): void {
    this.dirtyTracker.markDirty(nodeId, reason);
    this.scheduleExecution();
  }

  markDownstreamDirty(nodeId: string, edges: GraphEdge[]): void {
    this.dirtyTracker.markDownstreamDirty(nodeId, edges);
    this.scheduleExecution();
  }

  private scheduleExecution(): void {
    if (this.debounceTimeout !== null) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = window.setTimeout(() => {
      this.execute();
    }, this.debounceMs);
  }

  private execute(): void {
    const dirtyNodes = this.dirtyTracker.getDirtyNodes();
    if (dirtyNodes.size === 0) return;

    const results: ExecutionResult[] = [];

    // For now, just mark nodes as executed (actual GPU execution in Phase 1)
    dirtyNodes.forEach((nodeId) => {
      this.dirtyTracker.clearDirty(nodeId);
      results.push({
        nodeId,
        outputs: {},
      });
    });

    this.executeCallbacks.forEach((cb) => cb(results));
  }

  onExecute(callback: (results: ExecutionResult[]) => void): () => void {
    this.executeCallbacks.push(callback);
    return () => {
      const index = this.executeCallbacks.indexOf(callback);
      if (index > -1) {
        this.executeCallbacks.splice(index, 1);
      }
    };
  }

  getNodeResult(nodeId: string): Record<string, any> | undefined {
    return this.nodeResults.get(nodeId);
  }

  dispose(): void {
    if (this.debounceTimeout !== null) {
      clearTimeout(this.debounceTimeout);
    }
    this.nodeResults.clear();
    this.executeCallbacks = [];
  }
}
