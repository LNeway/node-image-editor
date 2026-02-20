import { NodeTypeDefinition } from '../types';

export const BlendNode: NodeTypeDefinition = {
  type: 'blend',
  label: 'node.composite.blend',
  category: 'composite',
  description: 'node.composite.blend.description',

  inputs: [
    { key: 'base', label: 'node.blend.base', dataType: 'image' },
    { key: 'blend', label: 'node.blend.blend', dataType: 'image' },
    { key: 'mask', label: 'node.common.mask', dataType: 'mask', required: false },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    {
      key: 'mode',
      label: 'node.blend.mode',
      type: 'select',
      default: 'normal',
      options: [
        { label: 'node.blend.modes.normal', value: 'normal' },
        { label: 'node.blend.modes.multiply', value: 'multiply' },
        { label: 'node.blend.modes.screen', value: 'screen' },
        { label: 'node.blend.modes.overlay', value: 'overlay' },
        { label: 'node.blend.modes.darken', value: 'darken' },
        { label: 'node.blend.modes.lighten', value: 'lighten' },
        { label: 'node.blend.modes.color_dodge', value: 'color_dodge' },
        { label: 'node.blend.modes.color_burn', value: 'color_burn' },
        { label: 'node.blend.modes.soft_light', value: 'soft_light' },
        { label: 'node.blend.modes.hard_light', value: 'hard_light' },
        { label: 'node.blend.modes.difference', value: 'difference' },
        { label: 'node.blend.modes.exclusion', value: 'exclusion' },
      ],
    },
    {
      key: 'opacity',
      label: 'node.blend.opacity',
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 1,
    },
  ],

  getOutputSize: (inputs) => {
    const baseInput = inputs.base;
    if (baseInput && baseInput.width && baseInput.height) {
      return { width: baseInput.width, height: baseInput.height };
    }
    const blendInput = inputs.blend;
    if (blendInput && blendInput.width && blendInput.height) {
      return { width: blendInput.width, height: blendInput.height };
    }
    return { width: 1920, height: 1080 };
  },

  execute: ({ inputs, params, gpu, outputSize }) => {
    const baseInput = inputs.base;
    const blendInput = inputs.blend;

    if (!baseInput || !baseInput.texture) {
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
      u_base: baseInput.texture,
      u_blend: blendInput?.texture ?? baseInput.texture,
      u_mode: params.mode ?? 'normal',
      u_opacity: params.opacity ?? 1,
    };

    if (inputs.mask?.texture) {
      uniforms.u_mask = inputs.mask.texture;
    }

    const outputTexture = gpu.renderShader('blend', uniforms, outputSize);

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
