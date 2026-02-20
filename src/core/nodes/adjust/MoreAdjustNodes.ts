import { NodeTypeDefinition } from '../types';

// Levels Node - 调整色阶
export const LevelsNode: NodeTypeDefinition = {
  type: 'levels',
  label: 'node.adjust.levels',
  category: 'adjust',
  description: 'node.adjust.levels.description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'blackPoint', label: 'node.levels.black_point', type: 'slider', min: 0, max: 1, step: 0.01, default: 0 },
    { key: 'whitePoint', label: 'node.levels.white_point', type: 'slider', min: 0, max: 1, step: 0.01, default: 1 },
    { key: 'gamma', label: 'node.levels.gamma', type: 'slider', min: 0.1, max: 3, step: 0.1, default: 1 },
  ],

  getOutputSize: (inputs) => {
    const imageInput = inputs.image;
    if (imageInput && imageInput.width && imageInput.height) {
      return { width: imageInput.width, height: imageInput.height };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ inputs, params, outputSize }) => {
    const imageInput = inputs.image;

    if (!imageInput || !imageInput.texture) {
      return {
        image: {
          type: 'image' as const,
          texture: null,
          dataUrl: imageInput?.dataUrl || null,
          width: outputSize.width,
          height: outputSize.height,
        },
      };
    }

    return {
      image: {
        type: 'image' as const,
        texture: imageInput.texture,
        dataUrl: imageInput.dataUrl || null,
        width: outputSize.width,
        height: outputSize.height,
      },
    };
  },
};

// HSL Node - HSL 调整
export const HSLNode: NodeTypeDefinition = {
  type: 'hsl',
  label: 'node.adjust.hsl',
  category: 'adjust',
  description: 'node.adjust.hsl.description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'hue', label: 'node.hsl.hue', type: 'slider', min: -180, max: 180, step: 1, default: 0 },
    { key: 'saturation', label: 'node.hsl.saturation', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'lightness', label: 'node.hsl.lightness', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
  ],

  getOutputSize: (inputs) => {
    const imageInput = inputs.image;
    if (imageInput && imageInput.width && imageInput.height) {
      return { width: imageInput.width, height: imageInput.height };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ inputs, params, outputSize }) => {
    const imageInput = inputs.image;

    if (!imageInput || !imageInput.texture) {
      return {
        image: {
          type: 'image' as const,
          texture: null,
          dataUrl: imageInput?.dataUrl || null,
          width: outputSize.width,
          height: outputSize.height,
        },
      };
    }

    return {
      image: {
        type: 'image' as const,
        texture: imageInput.texture,
        dataUrl: imageInput.dataUrl || null,
        width: outputSize.width,
        height: outputSize.height,
      },
    };
  },
};

// Color Balance Node - 色彩平衡
export const ColorBalanceNode: NodeTypeDefinition = {
  type: 'color_balance',
  label: 'node.adjust.color_balance',
  category: 'adjust',
  description: 'node.adjust.color_balance.description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'shadowsR', label: 'node.color_balance.shadows_r', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'shadowsG', label: 'node.color_balance.shadows_g', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'shadowsB', label: 'node.color_balance.shadows_b', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'midtonesR', label: 'node.color_balance.midtones_r', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'midtonesG', label: 'node.color_balance.midtones_g', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'midtonesB', label: 'node.color_balance.midtones_b', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'highlightsR', label: 'node.color_balance.highlights_r', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'highlightsG', label: 'node.color_balance.highlights_g', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
    { key: 'highlightsB', label: 'node.color_balance.highlights_b', type: 'slider', min: -1, max: 1, step: 0.01, default: 0 },
  ],

  getOutputSize: (inputs) => {
    const imageInput = inputs.image;
    if (imageInput && imageInput.width && imageInput.height) {
      return { width: imageInput.width, height: imageInput.height };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ inputs, params, outputSize }) => {
    const imageInput = inputs.image;

    if (!imageInput || !imageInput.texture) {
      return {
        image: {
          type: 'image' as const,
          texture: null,
          dataUrl: imageInput?.dataUrl || null,
          width: outputSize.width,
          height: outputSize.height,
        },
      };
    }

    return {
      image: {
        type: 'image' as const,
        texture: imageInput.texture,
        dataUrl: imageInput.dataUrl || null,
        width: outputSize.width,
        height: outputSize.height,
      },
    };
  },
};
