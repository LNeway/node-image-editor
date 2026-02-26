# GPU Pipeline

Detailed guide to the WebGL 2.0 rendering pipeline and shader system.

## Overview

The project uses a **custom WebGL 2.0 pipeline** (no Three.js or Babylon.js). All image processing happens on the GPU through GLSL shaders for maximum performance.

## GPU Context Architecture

```
GPUContext (src/core/gpu/GPUContext.ts)
    ├── ShaderManager      - Compile, link, manage programs
    ├── TextureManager     - Create, upload, pool, download textures
    └── FramebufferManager - Offscreen render targets
```

## GPUContext API

**Location**: `src/core/gpu/GPUContext.ts` (400 lines)

### Initialization

```typescript
const canvas = document.createElement('canvas');
const gpuContext = new GPUContext(canvas);

// Automatically:
// 1. Creates WebGL2 context
// 2. Initializes managers (shader, texture, framebuffer)
// 3. Sets up default state
```

### Core Methods

**Shader rendering**:
```typescript
const output = gpuContext.renderShader({
  vertexShader: fullscreenVertShader,
  fragmentShader: brightnessFragShader,
  uniforms: {
    u_image: inputTexture,
    u_brightness: 0.5,
    u_contrast: 1.2,
  },
  outputSize: { width: 512, height: 512 },
});
// Returns: { texture: WebGLTexture }
```

**Texture operations**:
```typescript
// Upload image data to GPU
const texture = gpuContext.uploadTexture(imageData);

// Download texture from GPU to CPU
const imageData = gpuContext.downloadTexture(texture);

// Create empty texture
const emptyTexture = gpuContext.createTexture(512, 512);
```

**Cleanup**:
```typescript
gpuContext.dispose();  // Frees all GPU resources
```

## ShaderManager

**Location**: `src/core/gpu/ShaderManager.ts`

### Responsibilities

1. **Compile shaders** - Vertex and fragment shaders
2. **Link programs** - Combine shaders into WebGL program
3. **Cache programs** - Avoid recompilation
4. **Manage uniforms** - Get uniform locations

### Shader Compilation Flow

```
GLSL Source Code
    ↓
Compile Vertex Shader (gl.compileShader)
    ↓
Compile Fragment Shader (gl.compileShader)
    ↓
Link Program (gl.linkProgram)
    ↓
Cache Program (key = shader hash)
    ↓
Return Program + Uniform Locations
```

### Usage Example

```typescript
const program = shaderManager.getProgram(vertexShader, fragmentShader);

// Set uniforms
gl.useProgram(program);
const loc = gl.getUniformLocation(program, 'u_brightness');
gl.uniform1f(loc, 0.5);
```

### Error Handling

Shader compilation errors are logged with:
- Shader source code
- Line numbers
- Error messages

```typescript
// Example error output:
// Shader compilation error:
// ERROR: 0:12: 'invalid_function' : no matching overloaded function found
```

## TextureManager

**Location**: `src/core/gpu/TextureManager.ts`

### Texture Pooling

**Why**: Creating/deleting textures is expensive. Reuse instead.

**Pool configuration**:
- Default limit: 30 textures
- LRU eviction policy
- Automatic garbage collection

### Texture Operations

**Create texture**:
```typescript
const texture = textureManager.createTexture(width, height, {
  format: gl.RGBA,
  type: gl.UNSIGNED_BYTE,
  filter: gl.LINEAR,
  wrap: gl.CLAMP_TO_EDGE,
});
```

**Upload data**:
```typescript
// From ImageData
textureManager.uploadImageData(texture, imageData);

// From HTMLImageElement
textureManager.uploadImage(texture, image);

// From raw data
textureManager.uploadData(texture, data, width, height);
```

**Download data**:
```typescript
const imageData = textureManager.downloadTexture(texture, width, height);
// Returns: ImageData (can be drawn to canvas or saved)
```

**Texture recycling**:
```typescript
textureManager.releaseTexture(texture);  // Returns to pool
textureManager.collectGarbage();         // Frees old textures
```

### Texture Parameters

**Filtering**:
- `gl.NEAREST` - Sharp, pixelated (good for pixel art)
- `gl.LINEAR` - Smooth, blurred (good for photos)

**Wrapping**:
- `gl.CLAMP_TO_EDGE` - Clamp to edge pixels (default)
- `gl.REPEAT` - Tile texture
- `gl.MIRRORED_REPEAT` - Mirror and tile

**Format**:
- `gl.RGBA` - 4 channels (red, green, blue, alpha)
- `gl.RGB` - 3 channels (no alpha)
- `gl.LUMINANCE` - 1 channel (grayscale)

## FramebufferManager

**Location**: `src/core/gpu/FramebufferManager.ts`

### Purpose

Render to texture (offscreen rendering) instead of screen.

### Framebuffer Operations

**Create framebuffer**:
```typescript
const fbo = framebufferManager.createFramebuffer();
```

**Attach texture**:
```typescript
framebufferManager.attachTexture(fbo, texture);
```

**Bind for rendering**:
```typescript
framebufferManager.bindFramebuffer(fbo);
gl.drawArrays(gl.TRIANGLES, 0, 6);  // Render to texture
framebufferManager.unbindFramebuffer();  // Back to screen
```

**Cleanup**:
```typescript
framebufferManager.deleteFramebuffer(fbo);
```

### Render-to-Texture Pattern

```typescript
// 1. Create output texture
const outputTexture = textureManager.createTexture(512, 512);

// 2. Create framebuffer and attach texture
const fbo = framebufferManager.createFramebuffer();
framebufferManager.attachTexture(fbo, outputTexture);

// 3. Render to framebuffer
framebufferManager.bindFramebuffer(fbo);
gl.useProgram(shaderProgram);
// ... set uniforms, draw ...
gl.drawArrays(gl.TRIANGLES, 0, 6);
framebufferManager.unbindFramebuffer();

// 4. outputTexture now contains rendered result
```

## Shader System

### Shader File Organization

```
src/shaders/
├── glsl.d.ts                  # TypeScript declarations
├── common/
│   ├── fullscreen.vert        # Full-screen quad vertex shader
│   └── copy_texture.frag      # Simple texture copy
├── adjust/
│   ├── brightness_contrast.frag
│   ├── hue_saturation.frag
│   └── levels.frag
├── filter/
│   ├── gaussian_blur.frag
│   ├── sharpen.frag
│   └── noise.frag
├── composite/
│   └── blend.frag             # 10+ blend modes
├── transform/
│   ├── scale.frag
│   └── rotate.frag
└── [other categories]/
```

### Shader Import System

**Vite plugin**: `vite-plugin-glsl`

**Import shaders as modules**:
```typescript
import fragmentShader from '@/shaders/adjust/brightness_contrast.frag';
import vertexShader from '@/shaders/common/fullscreen.vert';

// fragmentShader is a string containing GLSL source
```

**Type declarations** (`src/shaders/glsl.d.ts`):
```typescript
declare module '*.frag' {
  const shader: string;
  export default shader;
}

declare module '*.vert' {
  const shader: string;
  export default shader;
}

declare module '*.glsl' {
  const shader: string;
  export default shader;
}
```

### Standard Vertex Shader

**Location**: `src/shaders/common/fullscreen.vert`

**Purpose**: Render full-screen quad (2 triangles covering entire viewport)

```glsl
#version 300 es

in vec2 a_position;   // Vertex position (-1 to 1)
out vec2 v_texCoord;  // Texture coordinate (0 to 1)

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_position * 0.5 + 0.5;  // Convert to 0-1 range
}
```

Used by all fragment shaders that process images.

### Fragment Shader Structure

**Example**: Brightness/Contrast shader

```glsl
#version 300 es
precision highp float;

uniform sampler2D u_image;     // Input image texture
uniform float u_brightness;    // Brightness adjustment (-1 to 1)
uniform float u_contrast;      // Contrast adjustment (0 to 2)

in vec2 v_texCoord;            // Texture coordinate from vertex shader
out vec4 fragColor;            // Output color

void main() {
  // Sample input texture
  vec4 color = texture(u_image, v_texCoord);
  
  // Apply brightness
  color.rgb += u_brightness;
  
  // Apply contrast
  color.rgb = (color.rgb - 0.5) * u_contrast + 0.5;
  
  // Output result
  fragColor = color;
}
```

**Uniform naming convention**:
- `u_image`, `u_image2` - Input textures
- `u_brightness`, `u_contrast` - Numeric parameters
- `u_color` - Color parameters
- `u_resolution` - Output size

### Blend Modes Shader

**Location**: `src/shaders/composite/blend.frag`

**Supported blend modes** (10+):
- Normal
- Multiply
- Screen
- Overlay
- Soft Light
- Hard Light
- Color Dodge
- Color Burn
- Darken
- Lighten
- Difference
- Exclusion

**Usage**:
```glsl
uniform sampler2D u_base;      // Base layer
uniform sampler2D u_blend;     // Blend layer
uniform int u_blendMode;       // Blend mode (0-11)
uniform float u_opacity;       // Opacity (0-1)

// ... blend mode implementations ...
```

## Node Execution with GPU

### Execution Context

```typescript
interface ExecutionContext {
  nodeId: string;
  inputs: Record<string, NodeOutput>;
  params: Record<string, any>;
  gpu: GPUContext;  // GPU context injection
}
```

### Node Execute Method

```typescript
// Example: BrightnessContrastNode.execute()
execute(context: ExecutionContext): Record<string, NodeOutput> {
  const { inputs, params, gpu } = context;
  
  // 1. Get input texture
  const inputTexture = inputs.image?.texture;
  if (!inputTexture) {
    throw new Error('No input image');
  }
  
  // 2. Get parameters
  const brightness = params.brightness ?? 0;
  const contrast = params.contrast ?? 1;
  
  // 3. Calculate output size
  const { width, height } = inputs.image.size;
  
  // 4. Render shader
  const output = gpu.renderShader({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_image: inputTexture,
      u_brightness: brightness,
      u_contrast: contrast,
    },
    outputSize: { width, height },
  });
  
  // 5. Return output
  return {
    image: {
      type: 'image',
      texture: output.texture,
      size: { width, height },
    },
  };
}
```

### Multi-pass Rendering

Some effects require multiple render passes:

**Example**: Gaussian Blur (two-pass separable blur)

```typescript
// Pass 1: Horizontal blur
const horizontalBlur = gpu.renderShader({
  vertexShader,
  fragmentShader: blurFragShader,
  uniforms: {
    u_image: inputTexture,
    u_direction: [1, 0],  // Horizontal
    u_radius: radius,
  },
  outputSize: { width, height },
});

// Pass 2: Vertical blur
const verticalBlur = gpu.renderShader({
  vertexShader,
  fragmentShader: blurFragShader,
  uniforms: {
    u_image: horizontalBlur.texture,
    u_direction: [0, 1],  // Vertical
    u_radius: radius,
  },
  outputSize: { width, height },
});

return {
  image: {
    type: 'image',
    texture: verticalBlur.texture,
    size: { width, height },
  },
};
```

## Performance Considerations

### Texture Memory Management

**Problem**: WebGL textures consume GPU memory (512×512 RGBA = 1MB)

**Solution**: Texture pooling
- Reuse textures instead of creating new ones
- Limit pool size to prevent memory exhaustion
- Garbage collect unused textures

### Shader Compilation Caching

**Problem**: Compiling shaders is slow (10-100ms)

**Solution**: Program caching
- Hash shader source code
- Cache compiled programs
- Reuse programs for same shaders

### Minimize GPU-CPU Transfers

**Problem**: Downloading textures from GPU is slow

**Solution**: Keep data on GPU
- Only download for final export
- Don't download for intermediate nodes
- Use GPU-to-GPU operations (render-to-texture)

### Batch Rendering

**Problem**: Many small draw calls are inefficient

**Solution**: Not applicable (one shader per node)
- Each node is a separate operation
- Execution engine already batches via dirty tracking

## Debugging GPU Issues

### WebGL Error Checking

```typescript
function checkGLError(gl: WebGL2RenderingContext, operation: string) {
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.error(`WebGL error after ${operation}: ${error}`);
  }
}
```

### Shader Compilation Errors

**Check compile status**:
```typescript
if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  const log = gl.getShaderInfoLog(shader);
  console.error('Shader compilation error:', log);
}
```

**Check link status**:
```typescript
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const log = gl.getProgramInfoLog(program);
  console.error('Program link error:', log);
}
```

### Texture Debugging

**Visualize texture**:
```typescript
// Download texture and draw to canvas
const imageData = gpu.downloadTexture(texture);
const canvas = document.createElement('canvas');
canvas.width = imageData.width;
canvas.height = imageData.height;
const ctx = canvas.getContext('2d');
ctx.putImageData(imageData, 0, 0);
document.body.appendChild(canvas);  // View in browser
```

**Check texture completeness**:
```typescript
gl.bindTexture(gl.TEXTURE_2D, texture);
const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
if (complete !== gl.FRAMEBUFFER_COMPLETE) {
  console.error('Framebuffer not complete:', complete);
}
```

### Chrome DevTools GPU Profiling

1. Open Chrome DevTools
2. Go to "Performance" tab
3. Enable "GPU" track
4. Record profile
5. Analyze GPU activity

Look for:
- Long shader compilation times
- Excessive texture uploads
- GPU stalls

## WebGL 2.0 Features Used

**vs WebGL 1.0**:
- GLSL 300 es (vs 100 es)
- 3D textures
- Multiple render targets (MRT)
- Transform feedback
- Uniform buffer objects
- Integer textures

**Currently used**:
- ✅ GLSL 300 es
- ✅ `sampler2D` (texture sampling)
- ✅ `out` variables (fragment output)
- ✅ Framebuffer objects (render-to-texture)

**Not yet used** (potential future features):
- ❌ 3D textures (for volume rendering)
- ❌ MRT (for deferred rendering)
- ❌ Transform feedback (for GPU particles)

## Common Pitfalls

### 1. Not Disposing Resources

**Problem**: GPU memory leak

**Solution**: Always call `dispose()`
```typescript
const gpu = new GPUContext(canvas);
// ... use GPU ...
gpu.dispose();  // Critical!
```

### 2. Texture Size Limits

**Problem**: Texture exceeds max size (varies by GPU)

**Solution**: Check `gl.MAX_TEXTURE_SIZE`
```typescript
const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
console.log('Max texture size:', maxSize);  // Usually 4096 or 8192
```

### 3. Lost Context

**Problem**: WebGL context lost (GPU reset, driver crash)

**Solution**: Handle `webglcontextlost` event
```typescript
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  console.error('WebGL context lost');
  // Attempt recovery
});
```

### 4. Premultiplied Alpha

**Problem**: Incorrect alpha blending

**Solution**: Disable premultiplied alpha
```typescript
gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
```

### 5. CORS Issues with Images

**Problem**: Can't upload cross-origin images to texture

**Solution**: Use `crossOrigin` attribute
```typescript
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = imageUrl;
```

## Testing GPU Code

### Mocking WebGL

**In unit tests** (`src/test/setup.ts`):
```typescript
HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
  if (type === 'webgl2') {
    return {
      // Mock WebGL2 methods
      createShader: vi.fn(),
      compileShader: vi.fn(),
      linkProgram: vi.fn(),
      // ... etc
    };
  }
});
```

### Visual Regression Testing

**In E2E tests** (Playwright):
```typescript
test('shader output matches expected', async ({ page }) => {
  await setupShaderTest(page);
  await expect(page.locator('[data-testid="preview"]')).toHaveScreenshot();
});
```

## Further Reading

- [WebGL2 Fundamentals](https://webgl2fundamentals.org/)
- [WebGL2 Specification](https://www.khronos.org/registry/webgl/specs/latest/2.0/)
- [GLSL ES 3.0 Specification](https://www.khronos.org/registry/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf)
- [GPU Gems](https://developer.nvidia.com/gpugems/gpugems/contributors) (general GPU techniques)
