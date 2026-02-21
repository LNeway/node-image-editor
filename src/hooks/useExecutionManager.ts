import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreviewTexture, setPreviewSize } from '../store/uiSlice';
import { RootState } from '../store';
import { Node, Edge } from 'reactflow';

/**
 * ExecutionManager - 执行节点链并更新预览
 * 遵循数据驱动原则：从 Redux store 读取节点数据
 * 遵循项目文档：使用 WebGL 进行图片处理
 */
export function useExecutionManager() {
  const dispatch = useDispatch();
  
  const graphNodes = useSelector((state: RootState) => state.graph.nodes);
  const graphEdges = useSelector((state: RootState) => state.graph.edges);

  const prevEdgesRef = useRef<Edge[]>([]);
  const prevNodeParamsRef = useRef<Map<string, any>>(new Map());
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programCacheRef = useRef<Map<string, WebGLProgram>>(new Map());

  // 获取或创建 WebGL Context
  const getGL = (): WebGL2RenderingContext | null => {
    if (glRef.current) return glRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (gl) {
      glRef.current = gl;
    }
    return gl;
  };

  // 编译 Shader
  const compileShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  // 创建 Program
  const createProgram = (gl: WebGL2RenderingContext, vertexSrc: string, fragmentSrc: string): WebGLProgram | null => {
    const key = `${vertexSrc.slice(0, 20)}-${fragmentSrc.slice(0, 20)}`;
    
    if (programCacheRef.current.has(key)) {
      return programCacheRef.current.get(key)!;
    }
    
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    
    programCacheRef.current.set(key, program);
    return program;
  };

  // 基础顶点 Shader
  const VERTEX_SHADER = `#version 300 es
    in vec2 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // 亮度/对比度 Fragment Shader
  const BRIGHTNESS_CONTRAST_SHADER = `#version 300 es
    precision highp float;
    uniform sampler2D u_input;
    uniform float u_brightness;
    uniform float u_contrast;
    in vec2 v_texCoord;
    out vec4 fragColor;
    
    void main() {
      vec4 color = texture(u_input, v_texCoord);
      vec3 result = color.rgb + u_brightness;
      result = (result - 0.5) * u_contrast + 0.5;
      result = clamp(result, 0.0, 1.0);
      fragColor = vec4(result, color.a);
    }
  `;

  // 高斯模糊 Fragment Shader
  const GAUSSIAN_BLUR_SHADER = `#version 300 es
    precision highp float;
    uniform sampler2D u_input;
    uniform float u_radius;
    uniform vec2 u_resolution;
    in vec2 v_texCoord;
    out vec4 fragColor;
    
    void main() {
      vec2 texelSize = 1.0 / u_resolution;
      float radius = u_radius;
      
      vec4 color = vec4(0.0);
      float total = 0.0;
      
      for (float x = -4.0; x <= 4.0; x += 1.0) {
        for (float y = -4.0; y <= 4.0; y += 1.0) {
          float weight = exp(-(x*x + y*y) / (2.0 * radius * radius));
          color += texture(u_input, v_texCoord + vec2(x, y) * texelSize * radius) * weight;
          total += weight;
        }
      }
      
      fragColor = color / total;
    }
  `;

  // HSL 调整 Fragment Shader
  const HSL_SHADER = `#version 300 es
    precision highp float;
    uniform sampler2D u_input;
    uniform float u_hue;
    uniform float u_saturation;
    uniform float u_lightness;
    in vec2 v_texCoord;
    out vec4 fragColor;
    
    vec3 rgb2hsl(vec3 color) {
      float maxC = max(max(color.r, color.g), color.b);
      float minC = min(min(color.r, color.g), color.b);
      float l = (maxC + minC) / 2.0;
      float h = 0.0, s = 0.0;
      
      if (maxC != minC) {
        float d = maxC - minC;
        s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);
        if (maxC == color.r) h = (color.g - color.b) / d + (color.g < color.b ? 6.0 : 0.0);
        else if (maxC == color.g) h = (color.b - color.r) / d + 2.0;
        else h = (color.r - color.g) / d + 4.0;
        h /= 6.0;
      }
      return vec3(h, s, l);
    }
    
    float hue2rgb(float p, float q, float t) {
      if (t < 0.0) t += 1.0;
      if (t > 1.0) t -= 1.0;
      if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
      if (t < 1.0/2.0) return q;
      if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
      return p;
    }
    
    vec3 hsl2rgb(vec3 hsl) {
      float h = hsl.x, s = hsl.y, l = hsl.z;
      if (s == 0.0) return vec3(l);
      float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
      float p = 2.0 * l - q;
      return vec3(
        hue2rgb(p, q, h + 1.0/3.0),
        hue2rgb(p, q, h),
        hue2rgb(p, q, h - 1.0/3.0)
      );
    }
    
    void main() {
      vec4 color = texture(u_input, v_texCoord);
      vec3 hsl = rgb2hsl(color.rgb);
      
      hsl.x = mod(hsl.x + u_hue / 360.0, 1.0);
      hsl.y = clamp(hsl.y + u_saturation / 100.0, 0.0, 1.0);
      hsl.z = clamp(hsl.z + u_lightness / 100.0, 0.0, 1.0);
      
      vec3 rgb = hsl2rgb(hsl);
      fragColor = vec4(rgb, color.a);
    }
  `;

  // 使用 WebGL 处理图片
  const processWithWebGL = async (
    inputDataUrl: string,
    nodeType: string,
    params: any,
    width: number,
    height: number
  ): Promise<string | null> => {
    const gl = getGL();
    if (!gl) return null;

    // 加载输入图片为纹理
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = inputDataUrl;
    });

    // 设置 Canvas 尺寸
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.width = img.width || width;
    canvas.height = img.height || height;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 创建输入纹理
    const inputTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 创建输出纹理
    const outputTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, outputTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 创建 Framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);

    // 选择 Shader
    let fragmentShader = '';
    switch (nodeType) {
      case 'brightness_contrast':
        fragmentShader = BRIGHTNESS_CONTRAST_SHADER;
        break;
      case 'gaussian_blur':
        fragmentShader = GAUSSIAN_BLUR_SHADER;
        break;
      case 'hsl_adjust':
        fragmentShader = HSL_SHADER;
        break;
      default:
        return inputDataUrl;
    }

    // 创建 Program
    const program = createProgram(gl, VERTEX_SHADER, fragmentShader);
    if (!program) return inputDataUrl;

    gl.useProgram(program);

    // 设置顶点数据
    const vertices = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 16, 8);

    // 绑定输入纹理
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    const inputLoc = gl.getUniformLocation(program, 'u_input');
    gl.uniform1i(inputLoc, 0);

    // 设置 Uniforms
    switch (nodeType) {
      case 'brightness_contrast':
        gl.uniform1f(gl.getUniformLocation(program, 'u_brightness'), params.brightness || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_contrast'), params.contrast || 1);
        break;
      case 'gaussian_blur':
        gl.uniform1f(gl.getUniformLocation(program, 'u_radius'), params.radius || 5);
        gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
        break;
      case 'hsl_adjust':
        gl.uniform1f(gl.getUniformLocation(program, 'u_hue'), params.hue || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_saturation'), params.saturation || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_lightness'), params.lightness || 0);
        break;
    }

    // 渲染
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 读取结果
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // 转换为 dataUrl
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const ctx = outputCanvas.getContext('2d');
    if (ctx) {
      const imageData = new ImageData(new Uint8ClampedArray(pixels), canvas.width, canvas.height);
      // 翻转 Y 轴
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
      ctx.putImageData(imageData, 0, 0);
    }

    // 清理
    gl.deleteTexture(inputTexture);
    gl.deleteTexture(outputTexture);
    gl.deleteFramebuffer(framebuffer);
    gl.deleteBuffer(vertexBuffer);

    return outputCanvas.toDataURL('image/png');
  };

  // 执行节点链
  const executeChain = async (sourceNodeId: string): Promise<{ dataUrl: string; width: number; height: number } | null> => {
    const getExecutionOrder = (startId: string): string[] => {
      const order: string[] = [startId];
      let currentId = startId;
      
      while (true) {
        const nextEdge = graphEdges.find(e => e.source === currentId);
        if (!nextEdge) break;
        currentId = nextEdge.target;
        order.push(currentId);
      }
      return order;
    };

    const nodeIds = getExecutionOrder(sourceNodeId);
    const nodesMap = new Map(graphNodes.map(n => [n.id, n]));

    let currentDataUrl: string | null = null;
    let width = 1920;
    let height = 1080;

    for (const nodeId of nodeIds) {
      const node = nodesMap.get(nodeId);
      if (!node) continue;

      const nodeType = node.data?.nodeType;
      const params = node.data?.params || {};

      switch (nodeType) {
        case 'image_import': {
          const imageData = params.imageData;
          if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
            const img = await loadImage(imageData);
            width = img.width;
            height = img.height;
            currentDataUrl = imageData;
          }
          break;
        }

        case 'solid_color': {
          const color = params.color || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
          width = params.width || 1920;
          height = params.height || 1080;
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const r = Math.round(color.r * 255);
            const g = Math.round(color.g * 255);
            const b = Math.round(color.b * 255);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${color.a})`;
            ctx.fillRect(0, 0, width, height);
          }
          currentDataUrl = canvas.toDataURL('image/png');
          break;
        }

        case 'hsl_adjust':
        case 'brightness_contrast':
        case 'gaussian_blur': {
          if (!currentDataUrl) break;
          currentDataUrl = await processWithWebGL(currentDataUrl, nodeType, params, width, height) || currentDataUrl;
          break;
        }

        case 'preview_output':
          break;

        default:
          break;
      }
    }

    if (currentDataUrl) {
      return { dataUrl: currentDataUrl, width, height };
    }
    return null;
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const hasPreviewRelevantChange = (nodes: Node[], edges: Edge[]): boolean => {
    const prevEdges = prevEdgesRef.current;
    if (edges.length !== prevEdges.length) {
      prevEdgesRef.current = edges;
      return true;
    }
    
    const edgeChanged = edges.some((edge, i) => {
      const prev = prevEdges[i];
      return !prev || edge.source !== prev.source || edge.target !== prev.target;
    });
    if (edgeChanged) {
      prevEdgesRef.current = edges;
      return true;
    }

    const prevParams = prevNodeParamsRef.current;
    const currentParams = new Map<string, any>();
    
    for (const node of nodes) {
      const nodeType = node.data?.nodeType;
      const params = node.data?.params || {};
      const key = `${node.id}-${nodeType}`;
      currentParams.set(key, JSON.stringify(params));
      
      const prevParamStr = prevParams.get(key);
      if (!prevParamStr || prevParamStr !== JSON.stringify(params)) {
        prevNodeParamsRef.current = currentParams;
        return true;
      }
    }
    
    if (prevParams.size !== currentParams.size) {
      prevNodeParamsRef.current = currentParams;
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (!hasPreviewRelevantChange(graphNodes, graphEdges)) {
      return;
    }

    const previewInputEdges = graphEdges.filter(edge => {
      const targetNode = graphNodes.find(n => n.id === edge.target);
      return targetNode?.data?.nodeType === 'preview_output';
    });

    if (previewInputEdges.length === 0) {
      dispatch(setPreviewTexture(null));
      return;
    }

    const sourceNodeId = previewInputEdges[0].source;
    
    executeChain(sourceNodeId).then(result => {
      if (result) {
        console.log('[Execution] Executed node chain with WebGL, updating preview');
        dispatch(setPreviewTexture(result.dataUrl));
        dispatch(setPreviewSize({ width: result.width, height: result.height }));
      } else {
        dispatch(setPreviewTexture(null));
      }
    }).catch(err => {
      console.error('[Execution] Error executing chain:', err);
      dispatch(setPreviewTexture(null));
    });
  }, [graphNodes, graphEdges, dispatch]);
}
