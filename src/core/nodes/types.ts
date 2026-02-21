export type DataType = 'image' | 'mask' | 'number' | 'color' | 'bbox';

export interface ExecutionContext {
  nodeId: string;
  inputs: Record<string, NodeOutput>;
  params: Record<string, any>;
  gpu: any;
  outputSize: { width: number; height: number };
}

export interface PortDefinition {
  key: string;
  label: string;
  dataType: DataType;
  required?: boolean;
}

export interface ParamDefinition {
  key: string;
  label: string;
  type: 'slider' | 'select' | 'color' | 'checkbox' | 'number' | 'text' | 'file';
  min?: number;
  max?: number;
  step?: number;
  default: any;
  options?: { label: string; value: string }[];
  accept?: string;
}

export interface NodeOutput {
  type: 'image' | 'mask' | 'number' | 'color' | 'bbox';
  texture?: WebGLTexture | null;
  dataUrl?: string | null;
  width?: number;
  height?: number;
  value?: number | { r: number; g: number; b: number; a: number } | { x: number; y: number; w: number; h: number };
}

export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: string;
  description?: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  params: ParamDefinition[];
  getOutputSize?: (inputs: Record<string, NodeOutput>, params: Record<string, any>) => { width: number; height: number };
  execute: (context: ExecutionContext) => Record<string, NodeOutput>;
}
