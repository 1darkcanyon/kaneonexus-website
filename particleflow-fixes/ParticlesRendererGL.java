package com.nfaralli.particleflow;

import android.opengl.GLES30;
import android.opengl.GLSurfaceView;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Random;

/**
 * Particle renderer using OpenGL ES 3.0 Transform Feedback for GPU-side physics.
 *
 * Each frame, particle positions and velocities are updated entirely on the GPU
 * via the vertex shader. Transform Feedback captures the results back into a
 * ping-pong VBO so the next frame reads the updated state. No CPU readback needed.
 *
 * VBO layout (interleaved, 16 bytes per particle):
 *   [ pos.x (4) | pos.y (4) | delta.x (4) | delta.y (4) ]
 *
 * The transform feedback varyings "v_NewPos" and "v_NewDelta" are interleaved
 * into the write VBO in the same layout, so the buffers are directly swappable.
 */
public class ParticlesRendererGL implements GLSurfaceView.Renderer {

    private static final int NUM_PARTICLES = 50000;
    public  static final int MAX_TOUCHES   = 5;
    // Interleaved: pos.x, pos.y, delta.x, delta.y
    private static final int FLOATS_PER_VERTEX = 4;
    private static final int BYTES_PER_VERTEX  = FLOATS_PER_VERTEX * 4; // 16

    private int mProgram;
    private final int[] mVbo = new int[2]; // ping-pong VBOs
    private int mCurrentRead = 0;

    private float mWidth  = 1080f;
    private float mHeight = 1920f;

    // Touch state: x,y pairs; x < 0 means inactive.
    private final float[] mTouches = new float[MAX_TOUCHES * 2];

    // Cached uniform locations
    private int mUTouch, mUSize, mUAttraction, mUDrag;
    private int mUSlowHue, mUFastHue, mUSlowSat, mUFastSat, mUSlowVal, mUFastVal;

    // Physics / color parameters (can be exposed via settings later)
    private float mF01Attraction = 5000f;
    private float mF01Drag       = 0.96f;
    private float mSlowHue = 0.67f, mFastHue = 0.0f; // blue → red
    private float mSlowSat = 1f,   mFastSat = 1f;
    private float mSlowVal = 1f,   mFastVal = 1f;

    // ── Vertex shader ────────────────────────────────────────────────────────
    // Physics computed here; v_NewPos / v_NewDelta captured by Transform Feedback
    // and also interpolated for the fragment shader.
    private static final String VERTEX_SHADER =
        "#version 300 es\n"                                                    +
        "precision highp float;\n"                                             +
        "layout(location=0) in vec2 a_Position;\n"                            +
        "layout(location=1) in vec2 a_Delta;\n"                               +
        "uniform vec2  u_Touch[5];\n"                                          +
        "uniform vec2  u_Size;\n"                                              +
        "uniform float u_Attraction;\n"                                        +
        "uniform float u_Drag;\n"                                              +
        "out vec2 v_NewPos;\n"   // captured by TF + passed to frag shader
        "out vec2 v_NewDelta;\n" // captured by TF + passed to frag shader
        "void main() {\n"                                                      +
        "    vec2 pos   = a_Position;\n"                                       +
        "    vec2 delta = a_Delta;\n"                                          +
        "    for (int i = 0; i < 5; i++) {\n"                                 +
        "        if (u_Touch[i].x >= 0.0) {\n"                               +
        "            vec2  diff    = u_Touch[i] - pos;\n"                     +
        "            float distSq  = dot(diff, diff);\n"                      +
        "            if (distSq > 0.1) {\n"                                   +
        "                delta += (u_Attraction / distSq) * diff;\n"          +
        "            }\n"                                                       +
        "        }\n"                                                          +
        "    }\n"                                                               +
        "    pos   += delta;\n"                                                +
        "    delta *= u_Drag;\n"                                               +
        // Wrap particles at screen edges
        "    if (pos.x < 0.0)        pos.x += u_Size.x;\n"                   +
        "    else if (pos.x >= u_Size.x) pos.x -= u_Size.x;\n"               +
        "    if (pos.y < 0.0)        pos.y += u_Size.y;\n"                   +
        "    else if (pos.y >= u_Size.y) pos.y -= u_Size.y;\n"               +
        "    v_NewPos   = pos;\n"                                              +
        "    v_NewDelta = delta;\n"                                            +
        // Map screen coords [0..width, 0..height] → NDC [-1..1, -1..1]
        "    gl_Position = vec4((pos / u_Size) * 2.0 - 1.0, 0.0, 1.0);\n"   +
        "    gl_PointSize = 3.0;\n"                                            +
        "}\n";

    // ── Fragment shader ───────────────────────────────────────────────────────
    // Uses v_NewDelta (speed) to interpolate between slow/fast colors in HSV.
    // hsv2rgba uses the canonical compact GLSL formula (correct and handles
    // hue wraparound via fract).
    private static final String FRAGMENT_SHADER =
        "#version 300 es\n"                                                         +
        "precision highp float;\n"                                                  +
        "in vec2 v_NewDelta;\n"                                                     +
        "uniform float u_slowHue, u_fastHue;\n"                                    +
        "uniform float u_slowSat, u_fastSat;\n"                                    +
        "uniform float u_slowVal, u_fastVal;\n"                                    +
        "out vec4 fragColor;\n"                                                     +
        // Maps speed magnitude to [0,1]: 0=slow, 1=fast
        "float speedCoef(vec2 v) {\n"                                               +
        "    return clamp(log(dot(v, v) + 1.0) / 4.5, 0.0, 1.0);\n"              +
        "}\n"                                                                        +
        // Canonical HSV→RGB (handles full hue range with wraparound via fract)
        "vec4 hsv2rgba(float h, float s, float v) {\n"                             +
        "    vec4  K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);\n"                      +
        "    vec3  p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);\n"             +
        "    return vec4(v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s), 1.0);\n" +
        "}\n"                                                                        +
        "void main() {\n"                                                            +
        "    float c = speedCoef(v_NewDelta);\n"                                    +
        "    fragColor = hsv2rgba(\n"                                                +
        "        mix(u_slowHue, u_fastHue, c),\n"                                  +
        "        mix(u_slowSat, u_fastSat, c),\n"                                  +
        "        mix(u_slowVal, u_fastVal, c));\n"                                 +
        "}\n";

    public ParticlesRendererGL() {
        // Mark all touch points as inactive
        for (int i = 0; i < mTouches.length; i++) {
            mTouches[i] = -1f;
        }
    }

    // ── GLSurfaceView.Renderer ────────────────────────────────────────────────

    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        GLES30.glClearColor(0.02f, 0.02f, 0.05f, 1.0f);

        mProgram = buildProgram(VERTEX_SHADER, FRAGMENT_SHADER);
        cacheUniforms();

        GLES30.glGenBuffers(2, mVbo, 0);
    }

    @Override
    public void onSurfaceChanged(GL10 gl, int w, int h) {
        GLES30.glViewport(0, 0, w, h);
        mWidth  = w;
        mHeight = h;
        initParticles();
    }

    @Override
    public void onDrawFrame(GL10 gl) {
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT);
        GLES30.glUseProgram(mProgram);

        int writeIndex = 1 - mCurrentRead;

        // ── Upload uniforms ──────────────────────────────────────────────────
        GLES30.glUniform2fv(mUTouch, MAX_TOUCHES, mTouches, 0);
        GLES30.glUniform2f(mUSize,       mWidth, mHeight);
        GLES30.glUniform1f(mUAttraction, mF01Attraction);
        GLES30.glUniform1f(mUDrag,       mF01Drag);
        GLES30.glUniform1f(mUSlowHue,    mSlowHue);
        GLES30.glUniform1f(mUFastHue,    mFastHue);
        GLES30.glUniform1f(mUSlowSat,    mSlowSat);
        GLES30.glUniform1f(mUFastSat,    mFastSat);
        GLES30.glUniform1f(mUSlowVal,    mSlowVal);
        GLES30.glUniform1f(mUFastVal,    mFastVal);

        // ── Bind read VBO as vertex attributes ───────────────────────────────
        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, mVbo[mCurrentRead]);
        GLES30.glEnableVertexAttribArray(0);
        // a_Position: 2 floats at byte offset 0, stride 16
        GLES30.glVertexAttribPointer(0, 2, GLES30.GL_FLOAT, false, BYTES_PER_VERTEX, 0);
        GLES30.glEnableVertexAttribArray(1);
        // a_Delta: 2 floats at byte offset 8, stride 16
        GLES30.glVertexAttribPointer(1, 2, GLES30.GL_FLOAT, false, BYTES_PER_VERTEX, 8);

        // ── Bind write VBO as transform feedback output ──────────────────────
        // Index 0 corresponds to the first (and only) buffer in GL_INTERLEAVED_ATTRIBS mode.
        GLES30.glBindBufferBase(GLES30.GL_TRANSFORM_FEEDBACK_BUFFER, 0, mVbo[writeIndex]);

        // ── Draw with transform feedback active ──────────────────────────────
        // Particles are rendered to screen AND new pos/delta captured into writeVBO.
        GLES30.glBeginTransformFeedback(GLES30.GL_POINTS);
        GLES30.glDrawArrays(GLES30.GL_POINTS, 0, NUM_PARTICLES);
        GLES30.glEndTransformFeedback();

        // ── Swap ping-pong ───────────────────────────────────────────────────
        mCurrentRead = writeIndex;
    }

    // ── Touch interface ───────────────────────────────────────────────────────

    /** Activate touch point {@code index} at screen coordinates (x, y). */
    public void setTouch(int index, float x, float y) {
        if (index < 0 || index >= MAX_TOUCHES) return;
        mTouches[index * 2]     = x;
        mTouches[index * 2 + 1] = mHeight - y; // flip: GL y=0 is bottom, Android y=0 is top
    }

    /** Deactivate touch point {@code index}. */
    public void clearTouch(int index) {
        if (index < 0 || index >= MAX_TOUCHES) return;
        mTouches[index * 2]     = -1f;
        mTouches[index * 2 + 1] = -1f;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Upload initial particle data to both ping-pong VBOs.
     * Particles start uniformly distributed over a disk covering the screen.
     */
    private void initParticles() {
        Random rand   = new Random();
        float[] data  = new float[NUM_PARTICLES * FLOATS_PER_VERTEX];
        float radius  = (float) Math.sqrt(mWidth * mWidth + mHeight * mHeight) / 2f;

        for (int i = 0; i < NUM_PARTICLES; i++) {
            float r     = radius * (float) Math.sqrt(rand.nextFloat());
            float theta = rand.nextFloat() * 6.28318530718f;
            data[i * 4]     = mWidth  / 2f + r * (float) Math.cos(theta); // pos.x
            data[i * 4 + 1] = mHeight / 2f + r * (float) Math.sin(theta); // pos.y
            data[i * 4 + 2] = 0f; // delta.x
            data[i * 4 + 3] = 0f; // delta.y
        }

        ByteBuffer buf = ByteBuffer.allocateDirect(data.length * 4)
                .order(ByteOrder.nativeOrder());
        buf.asFloatBuffer().put(data);
        buf.position(0);

        for (int i = 0; i < 2; i++) {
            GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, mVbo[i]);
            GLES30.glBufferData(GLES30.GL_ARRAY_BUFFER, data.length * 4,
                    buf, GLES30.GL_DYNAMIC_COPY);
        }
        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, 0);

        mCurrentRead = 0;
    }

    /**
     * Compile and link vertex + fragment shaders.
     * Transform feedback varyings MUST be specified before glLinkProgram.
     */
    private int buildProgram(String vertSrc, String fragSrc) {
        int vs   = compileShader(GLES30.GL_VERTEX_SHADER,   vertSrc);
        int fs   = compileShader(GLES30.GL_FRAGMENT_SHADER, fragSrc);
        int prog = GLES30.glCreateProgram();
        GLES30.glAttachShader(prog, vs);
        GLES30.glAttachShader(prog, fs);
        // Specify TF varyings BEFORE linking — interleaved into a single buffer
        GLES30.glTransformFeedbackVaryings(prog,
                new String[]{"v_NewPos", "v_NewDelta"},
                GLES30.GL_INTERLEAVED_ATTRIBS);
        GLES30.glLinkProgram(prog);
        GLES30.glDeleteShader(vs);
        GLES30.glDeleteShader(fs);
        return prog;
    }

    private int compileShader(int type, String source) {
        int shader = GLES30.glCreateShader(type);
        GLES30.glShaderSource(shader, source);
        GLES30.glCompileShader(shader);
        return shader;
    }

    private void cacheUniforms() {
        mUTouch      = GLES30.glGetUniformLocation(mProgram, "u_Touch");
        mUSize       = GLES30.glGetUniformLocation(mProgram, "u_Size");
        mUAttraction = GLES30.glGetUniformLocation(mProgram, "u_Attraction");
        mUDrag       = GLES30.glGetUniformLocation(mProgram, "u_Drag");
        mUSlowHue    = GLES30.glGetUniformLocation(mProgram, "u_slowHue");
        mUFastHue    = GLES30.glGetUniformLocation(mProgram, "u_fastHue");
        mUSlowSat    = GLES30.glGetUniformLocation(mProgram, "u_slowSat");
        mUFastSat    = GLES30.glGetUniformLocation(mProgram, "u_fastSat");
        mUSlowVal    = GLES30.glGetUniformLocation(mProgram, "u_slowVal");
        mUFastVal    = GLES30.glGetUniformLocation(mProgram, "u_fastVal");
    }
}
