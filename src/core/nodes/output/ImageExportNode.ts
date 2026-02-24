import { NodeTypeDefinition } from '../types';

/**
 * Image Export Node - 导出图片到文件
 * 此节点不进行图像处理，仅作为输出标记
 * 实际导出操作通过 GPUContext.exportToBlob 实现
 */
export const ImageExportNode: NodeTypeDefinition = {
  type: 'image_export',
  label: 'node.output.image_export',
  category: 'output',
  description: 'node.output.image_export_description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    {
      key: 'format',
      label: 'node.image_export.format',
      type: 'select',
      default: 'png',
      options: [
        { label: 'PNG', value: 'png' },
        { label: 'JPEG', value: 'jpeg' },
        { label: 'WebP', value: 'webp' },
      ],
    },
    {
      key: 'quality',
      label: 'node.image_export.quality',
      type: 'slider',
      min: 0.1,
      max: 1,
      step: 0.05,
      default: 0.92,
    },
    {
      key: 'fileName',
      label: 'node.image_export.file_name',
      type: 'text',
      default: 'output',
    },
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

    // 直接透传输入，不做任何处理
    return {
      image: {
        type: 'image' as const,
        texture: imageInput?.texture ?? null,
        width: imageInput?.width ?? outputSize.width,
        height: imageInput?.height ?? outputSize.height,
      },
    };
  },
};
