import { nodeRegistry } from './NodeRegistry';
import { ImageImportNode } from './input/ImageImportNode';
import { SolidColorNode } from './input/SolidColorNode';
import { BrightnessContrastNode } from './adjust/BrightnessContrastNode';
import { LevelsNode, HSLNode, ColorBalanceNode } from './adjust/MoreAdjustNodes';
import { GaussianBlurNode } from './filter/GaussianBlurNode';
import { BlendNode } from './composite/BlendNode';
import { ImageExportNode } from './output/ImageExportNode';
import { PreviewOutputNode } from './output/PreviewOutputNode';
import { ResizeNode, CropNode, RotateNode, FlipNode } from './transform/TransformNodes';

export type { NodeTypeDefinition, DataType, PortDefinition, ParamDefinition, NodeOutput } from './types';
export type { ExecutionContext } from '../engine/ExecutionEngine';

// Register all nodes
function registerAllNodes() {
  // Input nodes
  nodeRegistry.register(ImageImportNode);
  nodeRegistry.register(SolidColorNode);

  // Adjust nodes
  nodeRegistry.register(BrightnessContrastNode);
  nodeRegistry.register(LevelsNode);
  nodeRegistry.register(HSLNode);
  nodeRegistry.register(ColorBalanceNode);

  // Filter nodes
  nodeRegistry.register(GaussianBlurNode);

  // Transform nodes
  nodeRegistry.register(ResizeNode);
  nodeRegistry.register(CropNode);
  nodeRegistry.register(RotateNode);
  nodeRegistry.register(FlipNode);

  // Composite nodes
  nodeRegistry.register(BlendNode);

  // Output nodes
  nodeRegistry.register(ImageExportNode);
  nodeRegistry.register(PreviewOutputNode);

  console.log('All nodes registered:', nodeRegistry.getAll().map(n => n.type));
}

registerAllNodes();
