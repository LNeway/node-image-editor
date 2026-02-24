import { NodeTypeDefinition } from '../types';

export const ImageImportNode: NodeTypeDefinition = {
  type: 'image_import',
  label: 'node.input.image_import',
  category: 'input',
  description: 'node.input.image_import_description',

  inputs: [],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'imageData', label: 'node.image_import.file', type: 'file', accept: 'image/*', default: '' },
  ],

  getOutputSize: (_inputs, params) => {
    // Try to get size from image data if available
    const imageData = params?.imageData;
    if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
      // We'll need to load the image to get dimensions
      // For now, return a default size
      return { width: 1920, height: 1080 };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ params }) => {
    const imageData = params?.imageData;
    
    // Return the image data for preview
    return {
      image: {
        type: 'image' as const,
        texture: null, // Will be WebGL texture later
        dataUrl: imageData || null, // Store data URL for preview
        width: 1920,
        height: 1080,
      },
    };
  },
};
