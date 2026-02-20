#version 300 es
precision highp float;

uniform sampler2D u_input;
uniform float u_brightness;
uniform float u_contrast;
uniform sampler2D u_mask;

in vec2 vUv;
out vec4 fragColor;

vec3 adjustBrightnessContrast(vec3 color, float brightness, float contrast) {
  color += brightness;
  color = (color - 0.5) * contrast + 0.5;
  return clamp(color, 0.0, 1.0);
}

void main() {
  vec4 color = texture(u_input, vUv);
  
  vec3 result = adjustBrightnessContrast(color.rgb, u_brightness, u_contrast);
  
  // Apply mask if provided
  if (u_mask) {
    float maskValue = texture(u_mask, vUv).r;
    result = mix(color.rgb, result, maskValue);
  }
  
  fragColor = vec4(result, color.a);
}
