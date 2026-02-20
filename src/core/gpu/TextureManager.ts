import { TextureInfo, TextureFormat } from './types';

/**
 * TextureManager - 纹理资源池管理
 * 支持纹理复用、上限控制、自动释放
 */
export class TextureManager {
  private gl: WebGL2RenderingContext;
  private texturePool: Map<string, WebGLTexture> = new Map();
  private textureInfo: Map<WebGLTexture, TextureInfo> = new Map();
  private usedTextures: Set<WebGLTexture> = new Set();
  private poolLimit: number;

  constructor(gl: WebGL2RenderingContext, poolLimit: number = 30) {
    this.gl = gl;
    this.poolLimit = poolLimit;
  }

  /**
   * 从纹理池获取或创建纹理
   */
  private getFromPool(key: string): WebGLTexture | null {
    if (this.texturePool.has(key)) {
      const texture = this.texturePool.get(key)!;
      this.usedTextures.add(texture);
      return texture;
    }
    return null;
  }

  /**
   * 纹理上传到 GPU
   */
  uploadTexture(
    source: ImageData | HTMLImageElement | HTMLCanvasElement,
    options: {
      name?: string;
      format?: TextureFormat;
      flipY?: boolean;
    } = {}
  ): WebGLTexture {
    const {
      name = `texture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      format = 'rgba',
      flipY = true,
    } = options;

    // 尝试从池中获取
    let texture = this.getFromPool(name);

    if (!texture) {
      // 池未命中，需要创建新纹理
      texture = this.createTexture(source, format, flipY);

      // 检查是否达到上限，释放最旧的未使用纹理
      if (this.texturePool.size >= this.poolLimit) {
        this.evictOldestTexture();
      }

      this.texturePool.set(name, texture);
    } else {
      // 池命中，更新纹理数据
      this.updateTexture(texture, source, format, flipY);
    }

    this.usedTextures.add(texture);

    // 记录纹理信息
    const width = 'width' in source ? source.width : (source as HTMLCanvasElement).width;
    const height = 'height' in source ? source.height : (source as HTMLCanvasElement).height;

    this.textureInfo.set(texture, {
      name,
      width,
      height,
      format,
      createdAt: Date.now(),
    });

    return texture;
  }

  /**
   * 创建新纹理
   */
  private createTexture(
    source: ImageData | HTMLImageElement | HTMLCanvasElement,
    format: TextureFormat,
    flipY: boolean
  ): WebGLTexture {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // 设置翻转
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flipY);

    // 设置纹理参数
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    // 上传数据
    this.uploadTextureData(texture, source, format);

    return texture;
  }

  /**
   * 上传纹理数据
   */
  private uploadTextureData(
    texture: WebGLTexture,
    source: ImageData | HTMLImageElement | HTMLCanvasElement,
    format: TextureFormat
  ): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    const internalFormat = this.getInternalFormat(format);
    const dataFormat = this.getDataFormat(format);
    const dataType = this.gl.UNSIGNED_BYTE;

    if (source instanceof ImageData) {
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        internalFormat,
        source.width,
        source.height,
        0,
        dataFormat,
        dataType,
        source.data
      );
    } else if (source instanceof HTMLCanvasElement) {
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        internalFormat,
        dataFormat,
        dataType,
        source
      );
    } else {
      // HTMLImageElement
      if (source.complete) {
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          internalFormat,
          dataFormat,
          dataType,
          source
        );
      } else {
        // 图片未加载完成，等待加载
        source.addEventListener('load', () => {
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
          this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            internalFormat,
            dataFormat,
            dataType,
            source
          );
        });
      }
    }
  }

  /**
   * 更新已有纹理
   */
  private updateTexture(
    texture: WebGLTexture,
    source: ImageData | HTMLImageElement | HTMLCanvasElement,
    format: TextureFormat,
    flipY: boolean
  ): void {
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flipY);
    this.uploadTextureData(texture, source, format);
  }

  /**
   * 从纹理读取像素数据
   */
  readPixels(texture: WebGLTexture, width: number, height: number): Uint8Array {
    // 创建 Framebuffer
    const framebuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texture,
      0
    );

    // 读取像素
    const pixels = new Uint8Array(width * height * 4);
    this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

    // 清理
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.deleteFramebuffer(framebuffer);

    return pixels;
  }

  /**
   * 创建空纹理（用于输出）
   */
  createEmptyTexture(width: number, height: number, format: TextureFormat = 'rgba'): WebGLTexture {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }

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

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    const name = `empty_${width}x${height}_${Date.now()}`;
    this.textureInfo.set(texture, {
      name,
      width,
      height,
      format,
      createdAt: Date.now(),
    });

    return texture;
  }

  /**
   * 释放指定纹理
   */
  releaseTexture(texture: WebGLTexture): void {
    const info = this.textureInfo.get(texture);
    if (info) {
      this.texturePool.delete(info.name);
      this.textureInfo.delete(texture);
    }
    this.usedTextures.delete(texture);
    this.gl.deleteTexture(texture);
  }

  /**
   * 标记纹理为未使用（用于帧结束时释放）
   */
  markUnused(texture: WebGLTexture): void {
    this.usedTextures.delete(texture);
  }

  /**
   * 释放所有未使用的纹理
   */
  collectGarbage(): void {
    const toRelease: WebGLTexture[] = [];

    this.texturePool.forEach((texture) => {
      if (!this.usedTextures.has(texture)) {
        toRelease.push(texture);
      }
    });

    toRelease.forEach((texture) => this.releaseTexture(texture));
  }

  /**
   * 获取纹理信息
   */
  getTextureInfo(texture: WebGLTexture): TextureInfo | undefined {
    return this.textureInfo.get(texture);
  }

  /**
   * 获取内部格式
   */
  private getInternalFormat(format: TextureFormat): number {
    switch (format) {
      case 'r':
        return this.gl.R8;
      case 'rg':
        return this.gl.RG8;
      case 'rgba':
      default:
        return this.gl.RGBA8;
    }
  }

  /**
   * 获取数据格式
   */
  private getDataFormat(format: TextureFormat): number {
    switch (format) {
      case 'r':
        return this.gl.RED;
      case 'rg':
        return this.gl.RG;
      case 'rgba':
      default:
        return this.gl.RGBA;
    }
  }

  /**
   * 淘汰最旧的未使用纹理
   */
  private evictOldestTexture(): void {
    let oldest: WebGLTexture | null = null;
    let oldestTime = Infinity;

    this.texturePool.forEach((texture) => {
      if (!this.usedTextures.has(texture)) {
        const info = this.textureInfo.get(texture);
        if (info && info.createdAt < oldestTime) {
          oldestTime = info.createdAt;
          oldest = texture;
        }
      }
    });

    if (oldest) {
      this.releaseTexture(oldest);
    }
  }

  /**
   * 获取当前池中纹理数量
   */
  getPoolSize(): number {
    return this.texturePool.size;
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    this.texturePool.forEach((texture) => {
      this.gl.deleteTexture(texture);
    });
    this.texturePool.clear();
    this.textureInfo.clear();
    this.usedTextures.clear();
  }
}
