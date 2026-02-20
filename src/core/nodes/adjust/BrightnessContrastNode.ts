import { NodeTypeDefinition } from '../types';

export const BrightnessContrastNode: NodeTypeDefinition = {
  type: 'brightness_contrast',
  label: 'node.adjust.brightness_contrast',
  category: 'adjust',
  description: 'node.adjust.brightness_contrast.description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
    { key: 'mask', label: 'node.common.mask', dataType: 'mask', required: false },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    {
      key: 'brightness',
      label: 'node.brightness_contrast.brightness',
      type: 'slider',
      min: -1,
      max: 1,
      step: 0.01,
      default: 0,
    },
    {
      key: 'contrast',
      label: 'node.brightness_contrast.contrast',
      type: 'slider',
      min: 0,
      max: 3,
      step: 0.01,
      default: 1,
    },
  ],

  execute: () => {
    // Will be implemented with GPU context in Phase 1
    return {
      image: {
        type: 'image' as const,
        texture: null,
        width: 0,
        height: 0,
      },
    };
  },
};
