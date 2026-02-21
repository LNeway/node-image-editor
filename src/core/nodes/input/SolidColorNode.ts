import { NodeTypeDefinition } from '../types';

export const SolidColorNode: NodeTypeDefinition = {
  type: 'solid_color',
  label: 'node.input.solid_color',
  category: 'input',
  description: 'node.input.solid_color.description',

  inputs: [],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'color', label: 'node.solid_color.color', type: 'color', default: { r: 0.5, g: 0.5, b: 0.5, a: 1 } },
    { key: 'width', label: 'node.solid_color.width', type: 'number', default: 1920, min: 1, max: 8192 },
    { key: 'height', label: 'node.solid_color.height', type: 'number', default: 1080, min: 1, max: 8192 },
  ],

  getOutputSize: (_, params) => {
    return {
      width: params?.width || 1920,
      height: params?.height || 1080,
    };
  },

  execute: ({ params, outputSize }) => {
    const color = params?.color || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
    const { width, height } = outputSize;
    
    // 生成 dataUrl 用于预览
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const r = Math.round(color.r * 255);
      const g = Math.round(color.g * 255);
      const b = Math.round(color.b * 255);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${color.a})`;
      ctx.fillRect(0, 0, width, height);
    }
    const dataUrl = canvas.toDataURL('image/png');
    
    return {
      image: {
        type: 'image' as const,
        texture: null,
        dataUrl,
        width,
        height,
      },
    };
  },
};
