import { nodeRegistry } from './NodeRegistry';
import { ImageImportNode } from './input/ImageImportNode';
import { BrightnessContrastNode } from './adjust/BrightnessContrastNode';
import { GaussianBlurNode } from './filter/GaussianBlurNode';
import { BlendNode } from './composite/BlendNode';
import { ImageExportNode } from './output/ImageExportNode';
import { PreviewOutputNode } from './output/PreviewOutputNode';

export type { NodeTypeDefinition, DataType, PortDefinition, ParamDefinition, NodeOutput } from './types';
export type { ExecutionContext } from '../engine/ExecutionEngine';

// 注册所有节点
function registerAllNodes() {
  // 输入类
  nodeRegistry.register(ImageImportNode);

  // 调整类
  nodeRegistry.register(BrightnessContrastNode);

  // 滤镜类
  nodeRegistry.register(GaussianBlurNode);

  // 合成类
  nodeRegistry.register(BlendNode);

  // 输出类
  nodeRegistry.register(ImageExportNode);
  nodeRegistry.register(PreviewOutputNode);

  console.log('All nodes registered:', nodeRegistry.getAll().map(n => n.type));
}

registerAllNodes();
