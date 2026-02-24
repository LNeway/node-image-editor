import { NodeTypeDefinition } from '../types';

// Resize Node - 缩放
export const ResizeNode: NodeTypeDefinition = {
  type: 'resize',
  label: 'node.transform.resize',
  category: 'transform',
  description: 'node.transform.resize_description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'width', label: 'node.resize.width', type: 'number', default: 1920, min: 1, max: 8192 },
    { key: 'height', label: 'node.resize.height', type: 'number', default: 1080, min: 1, max: 8192 },
    { key: 'fit', label: 'node.resize.fit', type: 'select', default: 'stretch', options: [
      { label: 'node.resize.stretch', value: 'stretch' },
      { label: 'node.resize.fit', value: 'fit' },
      { label: 'node.resize.fill', value: 'fill' },
      { label: 'node.resize.crop', value: 'crop' },
    ]},
  ],

  getOutputSize: (_, params) => {
    return {
      width: params?.width || 1920,
      height: params?.height || 1080,
    };
  },

  execute: ({ inputs, outputSize }) => {
    const imageInput = inputs.image;

    return {
      image: {
        type: 'image' as const,
        texture: imageInput?.texture || null,
        dataUrl: imageInput?.dataUrl || null,
        width: outputSize.width,
        height: outputSize.height,
      },
    };
  },
};

// Crop Node - 裁剪
export const CropNode: NodeTypeDefinition = {
  type: 'crop',
  label: 'node.transform.crop',
  category: 'transform',
  description: 'node.transform.crop_description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'x', label: 'node.crop.x', type: 'number', default: 0, min: 0 },
    { key: 'y', label: 'node.crop.y', type: 'number', default: 0, min: 0 },
    { key: 'width', label: 'node.crop.width', type: 'number', default: 1920, min: 1 },
    { key: 'height', label: 'node.crop.height', type: 'number', default: 1080, min: 1 },
  ],

  getOutputSize: (_, params) => {
    return {
      width: params?.width || 1920,
      height: params?.height || 1080,
    };
  },

  execute: ({ inputs, params, outputSize }) => {
    const imageInput = inputs.image;

    return {
      image: {
        type: 'image' as const,
        texture: imageInput?.texture || null,
        dataUrl: imageInput?.dataUrl || null,
        width: outputSize.width,
        height: outputSize.height,
        crop: {
          x: params?.x || 0,
          y: params?.y || 0,
          width: params?.width || 1920,
          height: params?.height || 1080,
        },
      },
    };
  },
};

// Rotate Node - 旋转
export const RotateNode: NodeTypeDefinition = {
  type: 'rotate',
  label: 'node.transform.rotate',
  category: 'transform',
  description: 'node.transform.rotate_description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'angle', label: 'node.rotate.angle', type: 'number', default: 0, min: -360, max: 360 },
    { key: 'expand', label: 'node.rotate.expand', type: 'checkbox', default: false },
  ],

  getOutputSize: (inputs) => {
    const imageInput = inputs.image;
    if (imageInput && imageInput.width && imageInput.height) {
      return { width: imageInput.width, height: imageInput.height };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ inputs, outputSize }) => {
    const imageInput = inputs.image;

    return {
      image: {
        type: 'image' as const,
        texture: imageInput?.texture || null,
        dataUrl: imageInput?.dataUrl || null,
        width: outputSize.width,
        height: outputSize.height,
      },
    };
  },
};

// Flip Node - 翻转
export const FlipNode: NodeTypeDefinition = {
  type: 'flip',
  label: 'node.transform.flip',
  category: 'transform',
  description: 'node.transform.flip_description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    { key: 'horizontal', label: 'node.flip.horizontal', type: 'checkbox', default: false },
    { key: 'vertical', label: 'node.flip.vertical', type: 'checkbox', default: false },
  ],

  getOutputSize: (inputs) => {
    const imageInput = inputs.image;
    if (imageInput && imageInput.width && imageInput.height) {
      return { width: imageInput.width, height: imageInput.height };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ inputs, outputSize }) => {
    const imageInput = inputs.image;

    return {
      image: {
        type: 'image' as const,
        texture: imageInput?.texture || null,
        dataUrl: imageInput?.dataUrl || null,
        width: outputSize.width,
        height: outputSize.height,
      },
    };
  },
};
