#version 450
// ParticleFlow — Fragment Shader (v3)
// Solid opaque — exact original behavior.
// Glow = particle density, not blend math.
// NEXUS Engineering — Canyon (Kaneon)
layout(location = 0) in  vec4 fragColor;
layout(location = 0) out vec4 outColor;
void main() {
    outColor = fragColor;
}
