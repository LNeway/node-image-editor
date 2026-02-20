import { NodeTypeDefinition } from '../types';

export const ImageImportNode: NodeTypeDefinition = {
  type: 'image_import',
  label: 'node.input.image_import',
  category: 'input',
  description: 'node.input.image_import.description',

  inputs: [],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'filePath', label: 'node.image_import.file', type: 'text', default: '' },
  ],

  execute: () => {
    // Will be implemented with image codec in Phase 10
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
