import { NodeTypeDefinition } from '../types';

export const BrightnessContrastNode: NodeTypeDefinition = {
  type: 'brightness_contrast',
  label: 'node.adjust.brightness_contrast',
  category: 'adjust',
  description: 'node.adjust.brightness_contrast_description',

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
      // 没有输入图像，返回空输出
      return {
        image: {
          type: 'image' as const,
          texture: null,
          width: outputSize.width,
          height: outputSize.height,
        },
      };
    }

    // 使用 GPU 渲染
    const uniforms: Record<string, any> = {
      u_texture: imageInput.texture,
      u_brightness: params.brightness ?? 0,
      u_contrast: params.contrast ?? 1,
    };

    if (inputs.mask?.texture) {
      uniforms.u_mask = inputs.mask.texture;
    }

    const outputTexture = gpu.renderShader('brightness_contrast', uniforms, outputSize);

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
