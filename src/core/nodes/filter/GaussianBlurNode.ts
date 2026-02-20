import { NodeTypeDefinition } from '../types';

export const GaussianBlurNode: NodeTypeDefinition = {
  type: 'gaussian_blur',
  label: 'node.filter.gaussian_blur',
  category: 'filter',
  description: 'node.filter.gaussian_blur.description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
    { key: 'mask', label: 'node.common.mask', dataType: 'mask', required: false },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    {
      key: 'radius',
      label: 'node.gaussian_blur.radius',
      type: 'slider',
      min: 0,
      max: 50,
      step: 0.5,
      default: 5,
    },
  ],

  getOutputSize: (inputs) => {
    const imageInput = inputs.image;
    if (imageInput && imageInput.width && imageInput.height) {
      return { width: imageInput.width, height: imageInput.height };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ inputs, params, gpu, outputSize }) => {
    const imageInput = inputs.image;

    if (!imageInput || !imageInput.texture) {
      return {
        image: {
          type: 'image' as const,
          texture: null,
          width: outputSize.width,
          height: outputSize.height,
        },
      };
    }

    const uniforms: Record<string, any> = {
      u_texture: imageInput.texture,
      u_radius: params.radius ?? 5,
    };

    if (inputs.mask?.texture) {
      uniforms.u_mask = inputs.mask.texture;
    }

    const outputTexture = gpu.renderShader('gaussian_blur', uniforms, outputSize);

    return {
      image: {
        type: 'image' as const,
        texture: outputTexture,
        width: outputSize.width,
        height: outputSize.height,
      },
    };
  },
};
