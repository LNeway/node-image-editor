import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addNode, updateNode, removeNode, addEdge, removeEdge } from '../store/graphSlice';
import { ExecutionEngine, getExecutionEngine } from '../core/engine/ExecutionEngine';
import { createGPUContext } from '../core/gpu';
import { GraphEdge } from '../core/engine/types';

export function useEngine() {
  const dispatch = useDispatch();
  const engineRef = useRef<ExecutionEngine | null>(null);
  const gpuRef = useRef<ReturnType<typeof createGPUContext> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const edges = useSelector((state: RootState) => state.graph.edges);

  // Initialize GPU and Engine
  useEffect(() => {
    // Create hidden canvas for GPU
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    // Initialize GPU context
    try {
      gpuRef.current = createGPUContext(canvas);
      console.log('GPU Context initialized');
    } catch (e) {
      console.error('Failed to initialize GPU:', e);
    }

    // Initialize execution engine
    engineRef.current = getExecutionEngine();
    if (gpuRef.current) {
      engineRef.current.setGPUContext(gpuRef.current);
    }

    // Listen for execution results
    const unsubscribe = engineRef.current.onExecute((results) => {
      console.log('Execution results:', results);
    });

    return () => {
      unsubscribe();
      if (engineRef.current) {
        engineRef.current.dispose();
      }
      if (gpuRef.current) {
        gpuRef.current.dispose();
      }
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current);
      }
    };
  }, []);

  // Update graph when nodes/edges change
  useEffect(() => {
    if (engineRef.current) {
      // Convert edges to GraphEdge format
      const graphEdges: GraphEdge[] = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
      }));
      engineRef.current.setGraph(nodes, graphEdges);
    }
  }, [nodes, edges]);

  // Trigger execution
  const execute = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.markAllDirty();
    }
  }, []);

  // Node operations
  const createNode = useCallback((type: string, position: { x: number; y: number }) => {
    const id = `${type}_${Date.now()}`;
    const newNode = {
      id,
      type,
      position,
      data: {},
    };
    dispatch(addNode(newNode));
    return id;
  }, [dispatch]);

  const updateNodeParams = useCallback((nodeId: string, data: Record<string, any>) => {
    dispatch(updateNode({ id: nodeId, data }));
    if (engineRef.current) {
      engineRef.current.markNodeDirty(nodeId, 'param_change');
    }
  }, [dispatch]);

  const deleteNode = useCallback((nodeId: string) => {
    dispatch(removeNode(nodeId));
    if (engineRef.current) {
      engineRef.current.markAllDirty();
    }
  }, [dispatch]);

  const connect = useCallback((sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
    const id = `edge_${sourceId}_${targetId}_${Date.now()}`;
    dispatch(addEdge({
      id,
      source: sourceId,
      target: targetId,
      sourceHandle,
      targetHandle,
    }));
    if (engineRef.current) {
      engineRef.current.markDownstreamDirty(sourceId);
    }
  }, [dispatch]);

  const disconnect = useCallback((edgeId: string) => {
    dispatch(removeEdge(edgeId));
    if (engineRef.current) {
      engineRef.current.markAllDirty();
    }
  }, [dispatch]);

  return {
    execute,
    createNode,
    updateNodeParams,
    deleteNode,
    connect,
    disconnect,
    gpu: gpuRef.current,
    engine: engineRef.current,
  };
}
