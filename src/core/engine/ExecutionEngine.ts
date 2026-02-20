import { GraphEdge, ExecutionResult } from './types';
import { DirtyTracker } from './DirtyTracker';
import { topologicalSort } from './TopologySorter';
import { GPUContext } from '../gpu';
import { nodeRegistry } from '../nodes/NodeRegistry';
import { NodeOutput } from '../nodes/types';

export interface ExecutionContext {
  nodeId: string;
  inputs: Record<string, NodeOutput>;
  params: Record<string, any>;
  gpu: GPUContext;
  outputSize: { width: number; height: number };
}

export class ExecutionEngine {
  private dirtyTracker: DirtyTracker;
  private nodeResults: Map<string, Record<string, NodeOutput>> = new Map();
  private executeCallbacks: ((results: ExecutionResult[]) => void)[] = [];
  private debounceTimeout: number | null = null;
  private debounceMs: number = 100;
  private gpuContext: GPUContext | null = null;
  private nodes: Map<string, any> = new Map();
  private edges: GraphEdge[] = [];

  constructor() {
    this.dirtyTracker = new DirtyTracker();
  }

  /**
   * 设置 GPU Context
   */
  setGPUContext(gpu: GPUContext): void {
    this.gpuContext = gpu;
  }

  /**
   * 更新节点图数据
   */
  setGraph(nodes: any[], edges: GraphEdge[]): void {
    // 更新节点映射
    this.nodes.clear();
    nodes.forEach((node) => {
      this.nodes.set(node.id, node);
    });
    this.edges = edges;

    // 所有节点都需要重新执行
    this.markAllDirty();
  }

  /**
   * 标记所有节点需要重新执行
   */
  markAllDirty(): void {
    this.nodes.forEach((_, nodeId) => {
      this.dirtyTracker.markDirty(nodeId, 'param_change');
    });
    this.scheduleExecution();
  }

  markNodeDirty(nodeId: string, reason: 'param_change' | 'input_change' | 'connection_change'): void {
    this.dirtyTracker.markDirty(nodeId, reason);
    this.scheduleExecution();
  }

  markDownstreamDirty(nodeId: string, edges?: GraphEdge[]): void {
    const graphEdges = edges || this.edges;
    this.dirtyTracker.markDownstreamDirty(nodeId, graphEdges);
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
    if (!this.gpuContext) {
      console.warn('GPUContext not set, skipping execution');
      return;
    }

    const dirtyNodes = this.dirtyTracker.getDirtyNodes();
    if (dirtyNodes.size === 0) return;

    // 拓扑排序
    const nodeArray = Array.from(this.nodes.values());
    const sortedIds = topologicalSort(nodeArray, this.edges, dirtyNodes);

    const results: ExecutionResult[] = [];

    // 按拓扑顺序执行每个脏节点
    for (const nodeId of sortedIds) {
      try {
        const result = this.executeNode(nodeId);
        results.push(result);
        this.nodeResults.set(nodeId, result.outputs);
        this.dirtyTracker.clearDirty(nodeId);
      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        results.push({
          nodeId,
          outputs: {},
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 通知回调
    this.executeCallbacks.forEach((cb) => cb(results));
  }

  private executeNode(nodeId: string): ExecutionResult {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const nodeType = node.type;
    const nodeDef = nodeRegistry.get(nodeType);

    if (!nodeDef) {
      throw new Error(`Node type ${nodeType} not registered`);
    }

    // 收集输入数据
    const inputs: Record<string, NodeOutput> = {};
    const nodeEdges = this.edges.filter((e) => e.target === nodeId);

    for (const edge of nodeEdges) {
      const sourceResult = this.nodeResults.get(edge.source);
      
      if (sourceResult) {
        // 获取源节点的输出
        const outputKey = edge.targetHandle || 'image';
        inputs[outputKey] = sourceResult[outputKey];
      }
    }

    // 获取输出尺寸
    const outputSize = this.getOutputSize(nodeId, inputs, node.data);

    // 创建执行上下文
    const context: ExecutionContext = {
      nodeId,
      inputs,
      params: node.data || {},
      gpu: this.gpuContext as GPUContext,
      outputSize,
    };

    // 执行节点
    const outputs = nodeDef.execute(context);

    return {
      nodeId,
      outputs,
    };
  }

  private getOutputSize(nodeId: string, inputs: Record<string, NodeOutput>, params: Record<string, any>): { width: number; height: number } {
    const node = this.nodes.get(nodeId);
    if (!node) return { width: 1920, height: 1080 };

    const nodeType = node.type;
    const nodeDef = nodeRegistry.get(nodeType);

    // 如果节点定义了 getOutputSize，使用它
    if (nodeDef?.getOutputSize) {
      return nodeDef.getOutputSize(inputs, params);
    }

    // 否则使用第一个图像输入的尺寸
    for (const input of Object.values(inputs)) {
      if (input && typeof input === 'object' && 'width' in input && 'height' in input) {
        return { width: input.width!, height: input.height! };
      }
    }

    // 默认尺寸
    return { width: 1920, height: 1080 };
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

  getNodeResult(nodeId: string): Record<string, NodeOutput> | undefined {
    return this.nodeResults.get(nodeId);
  }

  getAllResults(): Map<string, Record<string, NodeOutput>> {
    return this.nodeResults;
  }

  dispose(): void {
    if (this.debounceTimeout !== null) {
      clearTimeout(this.debounceTimeout);
    }
    this.nodeResults.clear();
    this.executeCallbacks = [];
  }
}

// 单例实例
let engineInstance: ExecutionEngine | null = null;

export function getExecutionEngine(): ExecutionEngine {
  if (!engineInstance) {
    engineInstance = new ExecutionEngine();
  }
  return engineInstance;
}
