import { FramebufferInfo } from './types';

/**
 * FramebufferManager - 离屏渲染目标管理
 * 负责创建、管理、复用 Framebuffer
 */
export class FramebufferManager {
  private gl: WebGL2RenderingContext;
  private framebuffers: Map<string, WebGLFramebuffer> = new Map();
  private framebufferInfo: Map<WebGLFramebuffer, FramebufferInfo> = new Map();
  private framebufferCache: Map<string, WebGLFramebuffer> = new Map();

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * 创建 Framebuffer
   */
  createFramebuffer(
    width: number,
    height: number,
    options: {
      name?: string;
      format?: 'rgba' | 'r' | 'rg' | 'rgba16f' | 'rgba32f';
    } = {}
  ): WebGLFramebuffer {
    const {
      name = `fb_${width}x${height}_${Date.now()}`,
      format = 'rgba',
    } = options;

    // 尝试从缓存获取
    const cacheKey = `${width}x${height}_${format}`;
    if (this.framebufferCache.has(cacheKey)) {
      const fb = this.framebufferCache.get(cacheKey)!;
      this.framebuffers.set(name, fb);
      return fb;
    }

    // 创建 Framebuffer
    const framebuffer = this.gl.createFramebuffer();
    if (!framebuffer) {
      throw new Error('Failed to create framebuffer');
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);

    // 创建纹理作为颜色附件
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    const internalFormat = this.getInternalFormat(format);

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      internalFormat,
      width,
      height,
      0,
      this.getDataFormat(format),
      this.gl.UNSIGNED_BYTE,
      null
    );

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    // 附加到 Framebuffer
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texture,
      0
    );

    // 检查完整性
    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer incomplete: ${status}`);
    }

    // 清理绑定
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    // 记录信息
    this.framebuffers.set(name, framebuffer);
    this.framebufferInfo.set(framebuffer, {
      name,
      width,
      height,
      format,
      texture,
      createdAt: Date.now(),
    });

    // 添加到缓存
    this.framebufferCache.set(cacheKey, framebuffer);

    return framebuffer;
  }

  /**
   * 获取 Framebuffer 的纹理附件
   */
  getFramebufferTexture(framebuffer: WebGLFramebuffer): WebGLTexture | null {
    const info = this.framebufferInfo.get(framebuffer);
    return info?.texture ?? null;
  }

  /**
   * 获取 Framebuffer 信息
   */
  getFramebufferInfo(framebuffer: WebGLFramebuffer): FramebufferInfo | undefined {
    return this.framebufferInfo.get(framebuffer);
  }

  /**
   * 绑定 Framebuffer 进行渲染
   */
  bindFramebuffer(framebuffer: WebGLFramebuffer | null): void {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    if (framebuffer) {
      const info = this.framebufferInfo.get(framebuffer);
      if (info) {
        this.gl.viewport(0, 0, info.width, info.height);
      }
    }
  }

  /**
   * 删除指定 Framebuffer
   */
  deleteFramebuffer(name: string): void {
    const framebuffer = this.framebuffers.get(name);
    if (framebuffer) {
      const info = this.framebufferInfo.get(framebuffer);
      if (info?.texture) {
        this.gl.deleteTexture(info.texture);
      }
      this.gl.deleteFramebuffer(framebuffer);
      this.framebuffers.delete(name);
      this.framebufferInfo.delete(framebuffer);
    }
  }

  /**
   * 从 Framebuffer 读取像素
   */
  readPixels(
    framebuffer: WebGLFramebuffer,
    x: number = 0,
    y: number = 0,
    width?: number,
    height?: number
  ): Uint8Array {
    const info = this.framebufferInfo.get(framebuffer);
    if (!info) {
      throw new Error('Framebuffer not found');
    }

    const w = width ?? info.width;
    const h = height ?? info.height;

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);

    const pixels = new Uint8Array(w * h * 4);
    this.gl.readPixels(x, y, w, h, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    return pixels;
  }

  /**
   * 清空 Framebuffer
   */
  clear(framebuffer: WebGLFramebuffer, r: number = 0, g: number = 0, b: number = 0, a: number = 1): void {
    const info = this.framebufferInfo.get(framebuffer);
    if (!info) return;

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.viewport(0, 0, info.width, info.height);
    this.gl.clearColor(r, g, b, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  /**
   * 获取内部格式
   */
  private getInternalFormat(format: string): number {
    switch (format) {
      case 'r':
        return this.gl.R8;
      case 'rg':
        return this.gl.RG8;
      case 'rgba16f':
        return this.gl.RGBA16F;
      case 'rgba32f':
        return this.gl.RGBA32F;
      case 'rgba':
      default:
        return this.gl.RGBA8;
    }
  }

  /**
   * 获取数据格式
   */
  private getDataFormat(format: string): number {
    switch (format) {
      case 'r':
        return this.gl.RED;
      case 'rg':
        return this.gl.RG;
      case 'rgba16f':
      case 'rgba32f':
      case 'rgba':
      default:
        return this.gl.RGBA;
    }
  }

  /**
   * 获取当前 Framebuffer 数量
   */
  getCount(): number {
    return this.framebuffers.size;
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    this.framebuffers.forEach((fb) => {
      const info = this.framebufferInfo.get(fb);
      if (info?.texture) {
        this.gl.deleteTexture(info.texture);
      }
      this.gl.deleteFramebuffer(fb);
    });
    this.framebuffers.clear();
    this.framebufferInfo.clear();
    this.framebufferCache.clear();
  }
}
