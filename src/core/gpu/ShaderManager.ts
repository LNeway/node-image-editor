/**
 * ShaderManager - 负责加载、编译、管理 GLSL Shader 程序
 */
export class ShaderManager {
  private gl: WebGL2RenderingContext;
  private programs: Map<string, WebGLProgram> = new Map();
  private shaderCache: Map<string, WebGLShader> = new Map();

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * 加载并编译 Vertex Shader
   */
  compileVertexShader(source: string): WebGLShader {
    return this.compileShader(source, this.gl.VERTEX_SHADER);
  }

  /**
   * 加载并编译 Fragment Shader
   */
  compileFragmentShader(source: string): WebGLShader {
    return this.compileShader(source, this.gl.FRAGMENT_SHADER);
  }

  /**
   * 通用编译方法
   */
  private compileShader(source: string, type: number): WebGLShader {
    const key = `${type}-${source}`;

    // 检查缓存
    if (this.shaderCache.has(key)) {
      return this.shaderCache.get(key)!;
    }

    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${info}`);
    }

    // 缓存 shader 对象
    this.shaderCache.set(key, shader);
    return shader;
  }

  /**
   * 创建并缓存 Shader Program
   */
  createProgram(
    name: string,
    vertexSource: string,
    fragmentSource: string
  ): WebGLProgram {
    // 检查缓存
    if (this.programs.has(name)) {
      return this.programs.get(name)!;
    }

    const vertexShader = this.compileVertexShader(vertexSource);
    const fragmentShader = this.compileFragmentShader(fragmentSource);

    const program = this.gl.createProgram();
    if (!program) {
      throw new Error('Failed to create program');
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program linking failed: ${info}`);
    }

    this.programs.set(name, program);
    return program;
  }

  /**
   * 获取已创建的 Program
   */
  getProgram(name: string): WebGLProgram | undefined {
    return this.programs.get(name);
  }

  /**
   * 获取 Program 的 Uniform 位置
   */
  getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(program, name);
  }

  /**
   * 获取 Program 的 Attribute 位置
   */
  getAttribLocation(program: WebGLProgram, name: string): number {
    return this.gl.getAttribLocation(program, name);
  }

  /**
   * 设置 Uniform 变量
   */
  setUniform(program: WebGLProgram, name: string, value: any): void {
    const location = this.gl.getUniformLocation(program, name);
    if (!location) return;

    if (typeof value === 'number') {
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
      }
    } else if (value instanceof WebGLTexture) {
      this.gl.uniform1i(location, value as any);
    }
  }

  /**
   * 设置多个 Uniforms
   */
  setUniforms(program: WebGLProgram, uniforms: Record<string, any>): void {
    Object.entries(uniforms).forEach(([name, value]) => {
      this.setUniform(program, name, value);
    });
  }

  /**
   * 删除指定 Program
   */
  deleteProgram(name: string): void {
    const program = this.programs.get(name);
    if (program) {
      this.gl.deleteProgram(program);
      this.programs.delete(name);
    }
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    this.programs.forEach((program) => {
      this.gl.deleteProgram(program);
    });
    this.programs.clear();

    this.shaderCache.forEach((shader) => {
      this.gl.deleteShader(shader);
    });
    this.shaderCache.clear();
  }
}
