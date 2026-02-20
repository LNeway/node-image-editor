// Mock for testing environment
// WebGL2 constants are not needed for mock
class MockWebGL2RenderingContext {
  canvas: HTMLCanvasElement = {} as HTMLCanvasElement;
  drawingBufferWidth: number = 0;
  drawingBufferHeight: number = 0;
}

// Extend window with mock
Object.defineProperty(window, 'WebGL2RenderingContext', {
  value: MockWebGL2RenderingContext,
});

// Mock ImageData for jsdom
if (typeof ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {
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
