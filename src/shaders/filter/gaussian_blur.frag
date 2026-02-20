#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_radius;
uniform sampler2D u_mask;

in vec2 vUv;
out vec4 fragColor;

// Gaussian weights for 9x9 kernel
float gaussianWeight(float x, float sigma) {
    return exp(-(x * x) / (2.0 * sigma * sigma));
}

void main() {
    vec2 texelSize = 1.0 / vec2(textureSize(u_texture, 0));
    float radius = u_radius;
    float sigma = radius / 3.0;
    
    // For very small radius, just do a simple blur
    if (radius < 0.5) {
        fragColor = texture(u_texture, vUv);
        return;
    }
    
    vec4 color = vec4(0.0);
    float totalWeight = 0.0;
    
    // 9x9 Gaussian kernel
    int kernelSize = 9;
    float offset = floor(radius) - 4.0;
    
    for (int y = -4; y <= 4; y++) {
        for (int x = -4; x <= 4; x++) {
            vec2 coord = vec2(float(x), float(y)) * (radius / 4.0) * texelSize;
            float weight = gaussianWeight(length(vec2(float(x), float(y))), sigma);
            color += texture(u_texture, vUv + coord) * weight;
            totalWeight += weight;
        }
    }
    
    color /= totalWeight;
    
    // Apply mask if provided
    if (u_mask) {
        float maskValue = texture(u_mask, vUv).r;
        vec4 originalColor = texture(u_texture, vUv);
        color = mix(originalColor, color, maskValue);
    }
    
    fragColor = color;
}
