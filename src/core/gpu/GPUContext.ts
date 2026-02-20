import { ShaderManager } from './ShaderManager';
import { TextureManager } from './TextureManager';
import { FramebufferManager } from './FramebufferManager';

// 全屏四边形顶点数据
const FULLSCREEN_QUAD_VERTICES = new Float32Array([
  -1, -1, 0, 0,
  1, -1, 1, 0,
  -1, 1, 0, 1,
  1, 1, 1, 1,
]);

const FULLSCREEN_QUAD_INDICES = new Uint16Array([0, 1, 2, 1, 3, 2]);

export interface GPUContextOptions {
  texturePoolLimit?: number;
}

/**
 * GPUContext - GPU 渲染管线封装
 * 整合 Shader、Texture、Framebuffer 管理
 */
export class GPUContext {
  public gl: WebGL2RenderingContext;
  public shaderManager: ShaderManager;
  public textureManager: TextureManager;
  public framebufferManager: FramebufferManager;

  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private isDisposed: boolean = false;

  constructor(canvas: HTMLCanvasElement, options: GPUContextOptions = {}) {
    const gl = canvas.getContext('webgl2', {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });

    if (!gl) {
      throw new Error('WebGL2 is not supported');
    }

    this.gl = gl;
    this.shaderManager = new ShaderManager(gl);
    this.textureManager = new TextureManager(gl, options.texturePoolLimit ?? 30);
    this.framebufferManager = new FramebufferManager(gl);

    this.initBuffers();
  }

  /**
   * 初始化顶点缓冲区
   */
  private initBuffers(): void {
    const gl = this.gl;

    // 创建 VAO
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // 创建顶点缓冲区
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_QUAD_VERTICES, gl.STATIC_DRAW);

    // 设置顶点属性 (position + texcoord)
    gl.enableVertexAttribArray(0); // position
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(1); // texcoord
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    // 创建索引缓冲区
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, FULLSCREEN_QUAD_INDICES, gl.STATIC_DRAW);

    // 清理绑定
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  /**
   * 创建 Shader Program
   */
  createProgram(name: string, vertexSource: string, fragmentSource: string): WebGLProgram {
    return this.shaderManager.createProgram(name, vertexSource, fragmentSource);
  }

  /**
   * 渲染 Shader
   * @param programName Program 名称
   * @param uniforms Uniform 变量
   * @param outputSize 输出尺寸
   * @returns 输出纹理
   */
  renderShader(
    programName: string,
    uniforms: Record<string, any>,
    outputSize: { width: number; height: number }
  ): WebGLTexture {
    const program = this.shaderManager.getProgram(programName);
    if (!program) {
      throw new Error(`Shader program "${programName}" not found`);
    }

    // 创建输出 Framebuffer
    const framebuffer = this.framebufferManager.createFramebuffer(
      outputSize.width,
      outputSize.height,
      { name: `output_${programName}` }
    );

    const outputTexture = this.framebufferManager.getFramebufferTexture(framebuffer);
    if (!outputTexture) {
      throw new Error('Failed to get output texture');
    }

    // 绑定 Framebuffer
    this.framebufferManager.bindFramebuffer(framebuffer);

    // 使用 Shader Program
    this.gl.useProgram(program);

    // 绑定 VAO
    this.gl.bindVertexArray(this.vao);

    // 设置 Uniforms
    let textureUnit = 0;
    Object.entries(uniforms).forEach(([name, value]) => {
      const location = this.gl.getUniformLocation(program, name);
      if (!location) return;

      if (value instanceof WebGLTexture) {
        // 绑定纹理到纹理单元
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, value);
        this.gl.uniform1i(location, textureUnit);
        textureUnit++;
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          this.gl.uniform1i(location, value);
        } else {
          this.gl.uniform1f(location, value);
        }
      } else if (Array.isArray(value)) {
        switch (value.length) {
          case 2:
            this.gl.uniform2fv(location, value);
            break;
          case 3:
            this.gl.uniform3fv(location, value);
            break;
          case 4:
            this.gl.uniform4fv(location, value);
            break;
          case 16:
            this.gl.uniformMatrix4fv(location, false, value);
            break;
        }
      }
    });

    // 绘制
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);

    // 清理
    this.gl.bindVertexArray(null);
    this.gl.useProgram(null);
    this.framebufferManager.bindFramebuffer(null);

    return outputTexture;
  }

  /**
   * 从纹理读取像素
   */
  readPixels(texture: WebGLTexture, width: number, height: number): Uint8Array {
    return this.textureManager.readPixels(texture, width, height);
  }

  /**
   * 上传图像为纹理
   */
  uploadTexture(
    source: ImageData | HTMLImageElement | HTMLCanvasElement,
    options: { name?: string; format?: 'r' | 'rg' | 'rgba' } = {}
  ): WebGLTexture {
    return this.textureManager.uploadTexture(source, options);
  }

  /**
   * 创建空纹理
   */
  createTexture(width: number, height: number, format: 'r' | 'rg' | 'rgba' = 'rgba'): WebGLTexture {
    return this.textureManager.createEmptyTexture(width, height, format);
  }

  /**
   * 将纹理渲染到 Canvas（用于预览/导出）
   */
  copyToCanvas(
    texture: WebGLTexture,
    canvas: HTMLCanvasElement,
    options: {
      width?: number;
      height?: number;
      flipY?: boolean;
    } = {}
  ): void {
    const { width, height, flipY = false } = options;

    const info = this.textureManager.getTextureInfo(texture);
    const w = width ?? info?.width ?? canvas.width;
    const h = height ?? info?.height ?? canvas.height;

    canvas.width = w;
    canvas.height = h;

    // 创建临时 Framebuffer
    const framebuffer = this.framebufferManager.createFramebuffer(w, h, {
      name: 'temp_copy',
    });
    const fbTexture = this.framebufferManager.getFramebufferTexture(framebuffer);

    if (fbTexture) {
      // 渲染纹理到 Framebuffer
      const program = this.shaderManager.getProgram('copy_texture');
      if (!program) {
        // 如果没有 copy shader，直接用 readPixels
        const pixels = this.textureManager.readPixels(texture, w, h);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = new ImageData(new Uint8ClampedArray(pixels), w, h);
          if (flipY) {
            ctx.scale(1, -1);
            ctx.drawImage(
              this.imageDataToCanvas(imageData, w, h),
              0,
              -h
            );
          } else {
            ctx.putImageData(imageData, 0, 0);
          }
        }
      } else {
        this.framebufferManager.bindFramebuffer(framebuffer);
        this.gl.useProgram(program);
        this.gl.bindVertexArray(this.vao);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        const location = this.gl.getUniformLocation(program, 'u_texture');
        this.gl.uniform1i(location, 0);

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);

        // 读取到 Canvas
        const pixels = this.framebufferManager.readPixels(framebuffer);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = new ImageData(new Uint8ClampedArray(pixels), w, h);
          ctx.putImageData(imageData, 0, 0);
        }

        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
        this.framebufferManager.bindFramebuffer(null);
      }
    }

    this.framebufferManager.deleteFramebuffer('temp_copy');
  }

  /**
   * 将 ImageData 转换为 Canvas
   */
  private imageDataToCanvas(imageData: ImageData, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
  }

  /**
   * 导出纹理为 Blob
   */
  async exportToBlob(
    texture: WebGLTexture,
    format: 'png' | 'jpeg' | 'webp' = 'png',
    quality: number = 0.92
  ): Promise<Blob> {
    const info = this.textureManager.getTextureInfo(texture);
    if (!info) {
      throw new Error('Texture info not found');
    }

    // 创建输出 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = info.width;
    canvas.height = info.height;

    // 复制纹理到 Canvas
    this.copyToCanvas(texture, canvas);

    // 导出为 Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * 垃圾回收
   */
  collectGarbage(): void {
    this.textureManager.collectGarbage();
  }

  /**
   * 获取 Canvas 尺寸
   */
  getSize(): { width: number; height: number } {
    return {
      width: this.gl.drawingBufferWidth,
      height: this.gl.drawingBufferHeight,
    };
  }

  /**
   * 调整 Canvas 大小
   */
  resize(width: number, height: number): void {
    const canvas = this.gl.canvas as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  /**
   * 检查是否已释放
   */
  isValid(): boolean {
    return !this.isDisposed;
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    if (this.isDisposed) return;

    this.shaderManager.dispose();
    this.textureManager.dispose();
    this.framebufferManager.dispose();

    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer);
    }
    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
    }
    if (this.vao) {
      this.gl.deleteVertexArray(this.vao);
    }

    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.vao = null;
    this.isDisposed = true;
  }
}

/**
 * 创建 GPUContext 工厂函数
 */
export function createGPUContext(
  canvas: HTMLCanvasElement,
  options?: GPUContextOptions
): GPUContext {
  return new GPUContext(canvas, options);
}
