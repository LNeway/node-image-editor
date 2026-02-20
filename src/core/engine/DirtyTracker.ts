import { GraphEdge } from './types';

export class DirtyTracker {
  private dirtyNodes: Map<string, 'param_change' | 'input_change' | 'connection_change'> = new Map();

  markDirty(nodeId: string, reason: 'param_change' | 'input_change' | 'connection_change'): void {
    // param_change takes highest priority
    const existing = this.dirtyNodes.get(nodeId);
    if (!existing || reason === 'param_change') {
      this.dirtyNodes.set(nodeId, reason);
    }
  }

  markDownstreamDirty(nodeId: string, edges: GraphEdge[]): void {
    const downstream = this.getDownstreamNodes(nodeId, edges);
    downstream.forEach((id) => this.markDirty(id, 'input_change'));
  }

  getDownstreamNodes(nodeId: string, edges: GraphEdge[]): string[] {
    const result: string[] = [];
    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      edges
        .filter((e) => e.source === current)
        .forEach((e) => {
          if (!visited.has(e.target)) {
            result.push(e.target);
            queue.push(e.target);
          }
        });
    }

    return result;
  }

  getDirtyNodes(): Set<string> {
    return new Set(this.dirtyNodes.keys());
  }

  clearDirty(nodeId: string): void {
    this.dirtyNodes.delete(nodeId);
  }

  clearAll(): void {
    this.dirtyNodes.clear();
  }

  isDirty(nodeId: string): boolean {
    return this.dirtyNodes.has(nodeId);
  }
}
