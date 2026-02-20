/**
 * ShaderLoader - 加载并注册所有 GLSL Shader
 * 在 GPUContext 初始化前调用
 */
import fullscreenVert from '../shaders/common/fullscreen.vert';
import brightnessContrastFrag from '../shaders/adjust/brightness_contrast.frag';
import gaussianBlurFrag from '../shaders/filter/gaussian_blur.frag';
import blendFrag from '../shaders/composite/blend.frag';
import copyTextureFrag from '../shaders/common/copy_texture.frag';

export interface ShaderSources {
  vertex: string;
  fragment: string;
}

const shaderSources: Record<string, ShaderSources> = {
  // Common
  fullscreen: {
    vertex: fullscreenVert,
    fragment: '',
  },
  copy_texture: {
    vertex: fullscreenVert,
    fragment: copyTextureFrag,
  },

  // Adjust
  brightness_contrast: {
    vertex: fullscreenVert,
    fragment: brightnessContrastFrag,
  },

  // Filter
  gaussian_blur: {
    vertex: fullscreenVert,
    fragment: gaussianBlurFrag,
  },

  // Composite
  blend: {
    vertex: fullscreenVert,
    fragment: blendFrag,
  },
};

/**
 * 加载所有 Shader 到 GPUContext
 */
export function loadAllShaders(gpuContext: {
  createProgram: (name: string, vertex: string, fragment: string) => WebGLProgram;
}): void {
  Object.entries(shaderSources).forEach(([name, sources]) => {
    try {
      gpuContext.createProgram(name, sources.vertex, sources.fragment);
      console.log(`[ShaderLoader] Loaded shader: ${name}`);
    } catch (error) {
      console.error(`[ShaderLoader] Failed to load shader ${name}:`, error);
    }
  });
}

export { shaderSources };
