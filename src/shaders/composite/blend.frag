#version 300 es
precision highp float;

uniform sampler2D u_base;
uniform sampler2D u_blend;
uniform int u_mode;  // 0: normal, 1: multiply, 2: screen, 3: overlay, etc.
uniform float u_opacity;
uniform sampler2D u_mask;

in vec2 vUv;
out vec4 fragColor;

vec3 blendMultiply(vec3 base, vec3 blend) {
    return base * blend;
}

vec3 blendScreen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    vec3 result;
    for (int i = 0; i < 3; i++) {
        if (base[i] < 0.5) {
            result[i] = 2.0 * base[i] * blend[i];
        } else {
            result[i] = 1.0 - 2.0 * (1.0 - base[i]) * (1.0 - blend[i]);
        }
    }
    return result;
}

vec3 blendDarken(vec3 base, vec3 blend) {
    return min(base, blend);
}

vec3 blendLighten(vec3 base, vec3 blend) {
    return max(base, blend);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
    return base / max(1.0 - blend, 0.001);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) / max(blend, 0.001);
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
    vec3 result;
    for (int i = 0; i < 3; i++) {
        if (blend[i] < 0.5) {
            result[i] = base[i] - (1.0 - 2.0 * blend[i]) * base[i] * (1.0 - base[i]);
        } else {
            if (base[i] < 0.25) {
                result[i] = ((16.0 * base[i] - 12.0) * base[i] + 4.0) * base[i];
            } else {
                result[i] = sqrt(base[i]);
            }
            result[i] = base[i] + (2.0 * blend[i] - 1.0) * (result[i] - base[i]);
        }
    }
    return result;
}

vec3 blendHardLight(vec3 base, vec3 blend) {
    vec3 result;
    for (int i = 0; i < 3; i++) {
        if (blend[i] < 0.5) {
            result[i] = 2.0 * base[i] * blend[i];
        } else {
            result[i] = 1.0 - 2.0 * (1.0 - base[i]) * (1.0 - blend[i]);
        }
    }
    return result;
}

vec3 blendDifference(vec3 base, vec3 blend) {
    return abs(base - blend);
}

vec3 blendExclusion(vec3 base, vec3 blend) {
    return base + blend - 2.0 * base * blend;
}

vec3 applyBlendMode(vec3 base, vec3 blend, int mode) {
    // Mode mapping:
    // 0: normal, 1: multiply, 2: screen, 3: overlay
    // 4: darken, 5: lighten, 6: color_dodge, 7: color_burn
    // 8: soft_light, 9: hard_light, 10: difference, 11: exclusion
    
    if (mode == 0) return blend;
    if (mode == 1) return blendMultiply(base, blend);
    if (mode == 2) return blendScreen(base, blend);
    if (mode == 3) return blendOverlay(base, blend);
    if (mode == 4) return blendDarken(base, blend);
    if (mode == 5) return blendLighten(base, blend);
    if (mode == 6) return blendColorDodge(base, blend);
    if (mode == 7) return blendColorBurn(base, blend);
    if (mode == 8) return blendSoftLight(base, blend);
    if (mode == 9) return blendHardLight(base, blend);
    if (mode == 10) return blendDifference(base, blend);
    if (mode == 11) return blendExclusion(base, blend);
    
    return blend;
}

// Convert blend mode string to integer
int getModeInt(string modeStr) {
    if (modeStr == "normal") return 0;
    if (modeStr == "multiply") return 1;
    if (modeStr == "screen") return 2;
    if (modeStr == "overlay") return 3;
    if (modeStr == "darken") return 4;
    if (modeStr == "lighten") return 5;
    if (modeStr == "color_dodge") return 6;
    if (modeStr == "color_burn") return 7;
    if (modeStr == "soft_light") return 8;
    if (modeStr == "hard_light") return 9;
    if (modeStr == "difference") return 10;
    if (modeStr == "exclusion") return 11;
    return 0;
}

void main() {
    vec4 baseColor = texture(u_base, vUv);
    vec4 blendColor = texture(u_blend, vUv);
    
    // Get blend mode from uniform (passed as int)
    vec3 blended = applyBlendMode(baseColor.rgb, blendColor.rgb, u_mode);
    
    // Apply opacity
    blended = mix(baseColor.rgb, blended, u_opacity);
    
    // Apply mask if provided
    if (u_mask) {
        float maskValue = texture(u_mask, vUv).r;
        blended = mix(baseColor.rgb, blended, maskValue);
    }
    
    fragColor = vec4(blended, baseColor.a);
}
