/**
 * GPU 相关类型定义
 */

export type TextureFormat = 'r' | 'rg' | 'rgba';

export interface TextureInfo {
  name: string;
  width: number;
  height: number;
  format: TextureFormat;
  createdAt: number;
}

export interface FramebufferInfo {
  name: string;
  width: number;
  height: number;
  format: string;
  texture: WebGLTexture;
  createdAt: number;
}

export interface ShaderSource {
  vertex: string;
  fragment: string;
}

export interface RenderOptions {
  width: number;
  height: number;
  uniforms?: Record<string, any>;
  inputTextures?: Record<string, WebGLTexture>;
  outputFramebuffer?: WebGLFramebuffer;
}

export interface GPUResources {
  vertexBuffer: WebGLBuffer;
  vao: WebGLVertexArrayObject;
}
