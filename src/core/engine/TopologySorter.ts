import { GraphEdge } from './types';

export interface GraphNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position: { x: number; y: number };
}

export function topologicalSort(
  nodes: GraphNode[],
  edges: GraphEdge[],
  dirtyNodeIds: Set<string>
): string[] {
  if (nodes.length === 0) return [];

  // Build adjacency list (forward and reverse)
  const adjacency = new Map<string, string[]>();
  const reverseAdj = new Map<string, string[]>();

  nodes.forEach((node) => {
    adjacency.set(node.id, []);
    reverseAdj.set(node.id, []);
  });

  edges.forEach((edge) => {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);

    const revNeighbors = reverseAdj.get(edge.target) || [];
    revNeighbors.push(edge.source);
    reverseAdj.set(edge.target, revNeighbors);
  });

  // Find all nodes that need to be executed (dirty nodes + all their dependencies)
  const toExecute = new Set<string>();
  const queue = [...dirtyNodeIds];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (toExecute.has(nodeId)) continue;
    toExecute.add(nodeId);

    // Add all upstream dependencies
    const upstream = reverseAdj.get(nodeId) || [];
    upstream.forEach((dep) => {
      if (!toExecute.has(dep)) {
        queue.push(dep);
      }
    });
  }

  // If no dirty nodes, return empty (nothing to execute)
  if (toExecute.size === 0) return [];

  // Build in-degree map for nodes to execute
  const inDegree = new Map<string, number>();
  nodes.forEach((node) => {
    if (toExecute.has(node.id)) {
      const upstream = reverseAdj.get(node.id) || [];
      const relevantDeps = upstream.filter((dep) => toExecute.has(dep));
      inDegree.set(node.id, relevantDeps.length);
    }
  });

  // Kahn's algorithm
  const result: string[] = [];
  const startNodes = nodes
    .filter((n) => toExecute.has(n.id) && (inDegree.get(n.id) || 0) === 0)
    .map((n) => n.id);

  const processQueue = [...startNodes];

  while (processQueue.length > 0) {
    const nodeId = processQueue.shift()!;
    result.push(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    neighbors.forEach((neighbor) => {
      if (!toExecute.has(neighbor)) return;

      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        processQueue.push(neighbor);
      }
    });
  }

  return result;
}

export function detectCycle(nodes: GraphNode[], edges: GraphEdge[]): boolean {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((node) => adjacency.set(node.id, []));

  edges.forEach((edge) => {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}
