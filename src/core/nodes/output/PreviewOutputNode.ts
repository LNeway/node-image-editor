import { NodeTypeDefinition } from '../types';

/**
 * Preview Output Node - 标记为预览窗口显示的最终输出
 * 此节点不进行图像处理，仅作为预览标记
 */
export const PreviewOutputNode: NodeTypeDefinition = {
  type: 'preview_output',
  label: 'node.output.preview',
  category: 'output',
  description: 'node.output.preview.description',

  inputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  outputs: [
    { key: 'image', label: 'node.common.image', dataType: 'image' },
  ],

  params: [
    {
      key: 'previewResolution',
      label: 'node.preview.resolution',
      type: 'select',
      default: '1080',
      options: [
        { label: '720p', value: '720' },
        { label: '1080p', value: '1080' },
        { label: '2K', value: '1440' },
        { label: 'Full', value: 'full' },
      ],
    },
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

    // 根据预览分辨率缩放
    let previewWidth = outputSize.width;
    let previewHeight = outputSize.height;

    const resolution = params.previewResolution ?? 'full';
    if (resolution !== 'full' && imageInput?.width && imageInput?.height) {
      const maxDim = parseInt(resolution, 10);
      const scale = Math.min(maxDim / imageInput.width, maxDim / imageInput.height, 1);
      previewWidth = Math.floor(imageInput.width * scale);
      previewHeight = Math.floor(imageInput.height * scale);
    }

    // 直接透传输入
    return {
      image: {
        type: 'image' as const,
        texture: imageInput?.texture ?? null,
        width: previewWidth,
        height: previewHeight,
      },
    };
  },
};
