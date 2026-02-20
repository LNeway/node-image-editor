import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock ImageData for jsdom
if (typeof ImageData === 'undefined') {
  global.ImageData = class ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.width = width;
      this.height = height || data.length / (width * 4);
      this.data = data;
    }
  };
}

// Mock addEventListener for Image objects
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Mock WebGL2
const mockGl = {
  createShader: vi.fn(() => 'mockShader'),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  getShaderInfoLog: vi.fn(() => null),
  deleteShader: vi.fn(),
  createProgram: vi.fn(() => 'mockProgram'),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getProgramInfoLog: vi.fn(() => null),
  deleteProgram: vi.fn(),
  getUniformLocation: vi.fn(() => 'mockLocation'),
  getAttribLocation: vi.fn(() => 0),
  uniform1i: vi.fn(),
  uniform1f: vi.fn(),
  uniform2fv: vi.fn(),
  uniform3fv: vi.fn(),
  uniform4fv: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  activeTexture: vi.fn(),
  bindTexture: vi.fn(),
  texImage2D: vi.fn(),
  texParameteri: vi.fn(),
  createTexture: vi.fn(() => 'mockTexture'),
  deleteTexture: vi.fn(),
  createFramebuffer: vi.fn(() => 'mockFramebuffer'),
  bindFramebuffer: vi.fn(),
  framebufferTexture2D: vi.fn(),
  checkFramebufferStatus: vi.fn(() => 36053),
  deleteFramebuffer: vi.fn(),
  createVertexArray: vi.fn(() => 'mockVao'),
  bindVertexArray: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  createBuffer: vi.fn(() => 'mockBuffer'),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  bufferSubData: vi.fn(),
  ELEMENT_ARRAY_BUFFER: 34963,
  ARRAY_BUFFER: 34962,
  TEXTURE_2D: 3553,
  TEXTURE0: 33984,
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,
  FRAMEBUFFER: 36160,
  COLOR_ATTACHMENT0: 36064,
  FRAMEBUFFER_COMPLETE: 36053,
  UNSIGNED_SHORT: 5123,
  UNSIGNED_BYTE: 5121,
  TRIANGLES: 4,
  FLOAT: 5126,
  RGBA: 6408,
  RGBA8: 32856,
  RED: 6403,
  R8: 33321,
  RG: 33319,
  LINEAR: 9729,
  CLAMP_TO_EDGE: 33071,
  DRAWING_BUFFER_WIDTH: 1920,
  DRAWING_BUFFER_HEIGHT: 1080,
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  useProgram: vi.fn(),
  drawElements: vi.fn(),
  readPixels: vi.fn(),
  pixelStorei: vi.fn(),
  0: 0,
};

global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

document.createElement = vi.fn((tag) => {
  if (tag === 'canvas') {
    return {
      getContext: vi.fn(() => mockGl),
      width: 800,
      height: 600,
    };
  }
  return {};
});

describe('GPU Pipeline', () => {
  describe('ShaderManager', () => {
    it('should create shader programs', async () => {
      const { ShaderManager } = await import('../../src/core/gpu/ShaderManager');

      const manager = new ShaderManager(mockGl as any);

      const vertexSource = `#version 300 es
precision highp float;
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

      const fragmentSource = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() {
  fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

      const program = manager.createProgram('test', vertexSource, fragmentSource);

      expect(program).toBe('mockProgram');
    });
  });

  describe('TextureManager', () => {
    it('should create textures', async () => {
      const { TextureManager } = await import('../../src/core/gpu/TextureManager');

      const manager = new TextureManager(mockGl as any);

      const mockImageData = {
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(100 * 100 * 4),
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      };

      const texture = manager.uploadTexture(mockImageData as any);

      expect(texture).toBe('mockTexture');
    });
  });

  describe('FramebufferManager', () => {
    it('should create framebuffers', async () => {
      const { FramebufferManager } = await import('../../src/core/gpu/FramebufferManager');

      const manager = new FramebufferManager(mockGl as any);

      const fb = manager.createFramebuffer(800, 600);

      expect(fb).toBe('mockFramebuffer');
    });
  });
});
