#version 450
// ParticleFlow — Vertex Shader (v3)
// Converts pixel-space positions to NDC.
// Y is NOT flipped here — origin is bottom-left matching original OpenGL.
// Touch Y flip is handled in C++: touchY = height - screenY  (setTouch fix)
// NEXUS Engineering — Canyon (Kaneon)
layout(location = 0) in vec2 inPosition;
layout(location = 1) in vec4 inColor;
layout(push_constant) uniform PushConstants {
    float width;
    float height;
    float pointSize;
};
layout(location = 0) out vec4 fragColor;
void main() {
    vec2 ndc = vec2(
         (inPosition.x / width)  * 2.0 - 1.0,
         (inPosition.y / height) * 2.0 - 1.0
    );
    gl_Position  = vec4(ndc, 0.0, 1.0);
    gl_PointSize = max(pointSize, 1.0);
    fragColor    = inColor;
}
