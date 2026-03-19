package com.nfaralli.particleflow;

import android.graphics.Color;
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
 * Colors: slow/fast particle colors are specified as RGB 0-255 and converted to
 * HSV internally. The shader interpolates hue between the two, with direction
 * (clockwise/counterclockwise around the color wheel) controlled by a flag.
 */
public class ParticlesRendererGL implements GLSurfaceView.Renderer {

    // Hard limits
    public  static final int MAX_TOUCHES      = 10; // absolute touch-slot limit
    private static final int FLOATS_PER_VERTEX = 4;
    private static final int BYTES_PER_VERTEX  = FLOATS_PER_VERTEX * 4; // 16

    // Configurable particle count
    private int mNumParticles = 50000;

    // Configurable max number of attraction points (exposed in settings)
    private int mMaxAttractionPoints = 5;

    private int mProgram;
    private final int[] mVbo = new int[2]; // ping-pong VBOs
    private int mCurrentRead = 0;

    private float mWidth  = 1080f;
    private float mHeight = 1920f;

    // Touch state: x,y pairs; x < 0 means inactive
    private final float[] mTouches = new float[MAX_TOUCHES * 2];

    // Cached uniform locations
    private int mUTouch, mUNumTouches, mUSize, mUAttraction, mUDrag, mUMaxSpeed;
    private int mUSlowHue, mUFastHue, mUSlowSat, mUFastSat, mUSlowVal, mUFastVal;

    // Physics parameters
    private float mF01Attraction = 5000f;
    private float mF01Drag       = 0.96f;
    private float mMaxSpeed      = 30f;   // pixels/frame cap — prevents "running too fast"

    // Background color (RGB 0-255)
    private int mBgR = 5, mBgG = 5, mBgB = 12;

    // Slow particle color (RGB 0-255)  — default: warm orange
    private int mSlowR = 233, mSlowG = 166, mSlowB = 99;

    // Fast particle color (RGB 0-255) — default: deep red-orange
    private int mFastR = 199, mFastG = 66,  mFastB = 33;

    // Hue interpolation direction: false = clockwise, true = counterclockwise
    private boolean mHueCCW = false;

    // Derived HSV values (recomputed from RGB whenever colors change)
    private float mSlowHue, mSlowSat, mSlowVal;
    private float mFastHue, mFastSat, mFastVal;
    // fastHue is adjusted by direction so the shader can use a plain mix()
    private float mFastHueAdjusted;

    // ── Vertex shader ────────────────────────────────────────────────────────
    // Physics computed here; v_NewPos / v_NewDelta captured by Transform Feedback.
    // u_NumTouches controls how many touch slots are actually evaluated.
    // u_MaxSpeed clamps velocity each frame so particles can't fly off infinitely.
    private static final String VERTEX_SHADER =
        "#version 300 es\n"                                                         +
        "precision highp float;\n"                                                  +
        "layout(location=0) in vec2 a_Position;\n"                                 +
        "layout(location=1) in vec2 a_Delta;\n"                                    +
        "uniform vec2  u_Touch[10];\n"                                             +
        "uniform int   u_NumTouches;\n"                                            +
        "uniform vec2  u_Size;\n"                                                   +
        "uniform float u_Attraction;\n"                                             +
        "uniform float u_Drag;\n"                                                   +
        "uniform float u_MaxSpeed;\n"                                               +
        "out vec2 v_NewPos;\n"                                                      +
        "out vec2 v_NewDelta;\n"                                                    +
        "void main() {\n"                                                           +
        "    vec2 pos   = a_Position;\n"                                            +
        "    vec2 delta = a_Delta;\n"                                               +
        "    for (int i = 0; i < u_NumTouches; i++) {\n"                           +
        "        if (u_Touch[i].x >= 0.0) {\n"                                     +
        "            vec2  diff   = u_Touch[i] - pos;\n"                           +
        "            float distSq = dot(diff, diff);\n"                            +
        "            if (distSq > 0.1) {\n"                                        +
        "                delta += (u_Attraction / distSq) * diff;\n"               +
        "            }\n"                                                            +
        "        }\n"                                                               +
        "    }\n"                                                                    +
        // Clamp to max speed — keeps particles from going insane at high frame rates
        "    float spd = length(delta);\n"                                          +
        "    if (spd > u_MaxSpeed) delta = (delta / spd) * u_MaxSpeed;\n"          +
        "    pos   += delta;\n"                                                     +
        "    delta *= u_Drag;\n"                                                    +
        "    if (pos.x <  0.0)          pos.x += u_Size.x;\n"                     +
        "    else if (pos.x >= u_Size.x) pos.x -= u_Size.x;\n"                    +
        "    if (pos.y <  0.0)          pos.y += u_Size.y;\n"                     +
        "    else if (pos.y >= u_Size.y) pos.y -= u_Size.y;\n"                    +
        "    v_NewPos   = pos;\n"                                                   +
        "    v_NewDelta = delta;\n"                                                 +
        "    gl_Position  = vec4((pos / u_Size) * 2.0 - 1.0, 0.0, 1.0);\n"       +
        "    gl_PointSize = 3.0;\n"                                                 +
        "}\n";

    // ── Fragment shader ───────────────────────────────────────────────────────
    // Interpolates HSV from slow→fast based on particle speed.
    // mFastHueAdjusted is pre-adjusted in Java for CW/CCW direction so the
    // shader can use a plain mix() — fract() in hsv2rgba handles wraparound.
    private static final String FRAGMENT_SHADER =
        "#version 300 es\n"                                                              +
        "precision highp float;\n"                                                       +
        "in vec2 v_NewDelta;\n"                                                         +
        "uniform float u_slowHue, u_fastHue;\n"                                         +
        "uniform float u_slowSat, u_fastSat;\n"                                         +
        "uniform float u_slowVal, u_fastVal;\n"                                         +
        "out vec4 fragColor;\n"                                                          +
        "float speedCoef(vec2 v) {\n"                                                   +
        "    return clamp(log(dot(v, v) + 1.0) / 4.5, 0.0, 1.0);\n"                   +
        "}\n"                                                                             +
        // Canonical HSV→RGBA; fract() handles hue values outside [0,1]
        "vec4 hsv2rgba(float h, float s, float v) {\n"                                  +
        "    vec4  K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);\n"                           +
        "    vec3  p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);\n"                  +
        "    return vec4(v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s), 1.0);\n"      +
        "}\n"                                                                             +
        "void main() {\n"                                                                +
        "    float c = speedCoef(v_NewDelta);\n"                                        +
        "    fragColor = hsv2rgba(\n"                                                    +
        "        mix(u_slowHue, u_fastHue, c),\n"                                       +
        "        mix(u_slowSat, u_fastSat, c),\n"                                       +
        "        mix(u_slowVal, u_fastVal, c));\n"                                      +
        "}\n";

    public ParticlesRendererGL() {
        for (int i = 0; i < mTouches.length; i++) mTouches[i] = -1f;
        updateHSV();
    }

    // ── GLSurfaceView.Renderer ────────────────────────────────────────────────

    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        applyBackgroundColor();
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

        // Upload uniforms
        GLES30.glUniform2fv(mUTouch,      MAX_TOUCHES, mTouches, 0);
        GLES30.glUniform1i(mUNumTouches,  mMaxAttractionPoints);
        GLES30.glUniform2f(mUSize,        mWidth, mHeight);
        GLES30.glUniform1f(mUAttraction,  mF01Attraction);
        GLES30.glUniform1f(mUDrag,        mF01Drag);
        GLES30.glUniform1f(mUMaxSpeed,    mMaxSpeed);
        GLES30.glUniform1f(mUSlowHue,     mSlowHue);
        GLES30.glUniform1f(mUFastHue,     mFastHueAdjusted);
        GLES30.glUniform1f(mUSlowSat,     mSlowSat);
        GLES30.glUniform1f(mUFastSat,     mFastSat);
        GLES30.glUniform1f(mUSlowVal,     mSlowVal);
        GLES30.glUniform1f(mUFastVal,     mFastVal);

        // Bind read VBO as vertex input
        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, mVbo[mCurrentRead]);
        GLES30.glEnableVertexAttribArray(0);
        GLES30.glVertexAttribPointer(0, 2, GLES30.GL_FLOAT, false, BYTES_PER_VERTEX, 0);
        GLES30.glEnableVertexAttribArray(1);
        GLES30.glVertexAttribPointer(1, 2, GLES30.GL_FLOAT, false, BYTES_PER_VERTEX, 8);

        // Bind write VBO as transform feedback output
        GLES30.glBindBufferBase(GLES30.GL_TRANSFORM_FEEDBACK_BUFFER, 0, mVbo[writeIndex]);

        // Draw + capture new state via transform feedback
        GLES30.glBeginTransformFeedback(GLES30.GL_POINTS);
        GLES30.glDrawArrays(GLES30.GL_POINTS, 0, mNumParticles);
        GLES30.glEndTransformFeedback();

        mCurrentRead = writeIndex;
    }

    // ── Touch interface ───────────────────────────────────────────────────────

    public void setTouch(int index, float x, float y) {
        if (index < 0 || index >= MAX_TOUCHES) return;
        mTouches[index * 2]     = x;
        mTouches[index * 2 + 1] = mHeight - y;
    }

    public void clearTouch(int index) {
        if (index < 0 || index >= MAX_TOUCHES) return;
        mTouches[index * 2]     = -1f;
        mTouches[index * 2 + 1] = -1f;
    }

    // ── Settings setters ──────────────────────────────────────────────────────

    /** Number of particles. Must be called on the GL thread (via queueEvent). */
    public void setNumParticles(int count) {
        mNumParticles = Math.max(1000, Math.min(count, 200000));
        initParticles();
    }

    public void setMaxAttractionPoints(int max) {
        mMaxAttractionPoints = Math.max(1, Math.min(max, MAX_TOUCHES));
    }

    public void setBackgroundColor(int r, int g, int b) {
        mBgR = clamp255(r);
        mBgG = clamp255(g);
        mBgB = clamp255(b);
        applyBackgroundColor();
    }

    /** Set slow-particle color in RGB 0-255 and recompute HSV. */
    public void setSlowColor(int r, int g, int b) {
        mSlowR = clamp255(r);
        mSlowG = clamp255(g);
        mSlowB = clamp255(b);
        updateHSV();
    }

    /** Set fast-particle color in RGB 0-255 and recompute HSV. */
    public void setFastColor(int r, int g, int b) {
        mFastR = clamp255(r);
        mFastG = clamp255(g);
        mFastB = clamp255(b);
        updateHSV();
    }

    /** true = counterclockwise hue sweep, false = clockwise. */
    public void setHueCCW(boolean ccw) {
        mHueCCW = ccw;
        updateHSV();
    }

    public void setAttraction(float attraction) { mF01Attraction = attraction; }
    public void setDrag(float drag)              { mF01Drag = Math.max(0f, Math.min(drag, 0.9999f)); }
    public void setMaxSpeed(float maxSpeed)      { mMaxSpeed = Math.max(1f, maxSpeed); }

    // ── Settings getters ──────────────────────────────────────────────────────

    public int     getNumParticles()         { return mNumParticles; }
    public int     getMaxAttractionPoints()  { return mMaxAttractionPoints; }
    public int     getBgR()                  { return mBgR; }
    public int     getBgG()                  { return mBgG; }
    public int     getBgB()                  { return mBgB; }
    public int     getSlowR()               { return mSlowR; }
    public int     getSlowG()               { return mSlowG; }
    public int     getSlowB()               { return mSlowB; }
    public int     getFastR()               { return mFastR; }
    public int     getFastG()               { return mFastG; }
    public int     getFastB()               { return mFastB; }
    public boolean getHueCCW()              { return mHueCCW; }
    public float   getAttraction()          { return mF01Attraction; }
    public float   getDrag()                { return mF01Drag; }
    public float   getMaxSpeed()            { return mMaxSpeed; }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Convert slow/fast RGB to HSV and adjust fastHue for CW/CCW direction.
     * The shader uses mix(slowHue, fastHueAdjusted, speedCoef) — fract() inside
     * hsv2rgba handles any hue values outside [0,1].
     */
    private void updateHSV() {
        float[] hsv = new float[3];

        Color.RGBToHSV(mSlowR, mSlowG, mSlowB, hsv);
        mSlowHue = hsv[0] / 360f;
        mSlowSat = hsv[1];
        mSlowVal = hsv[2];

        Color.RGBToHSV(mFastR, mFastG, mFastB, hsv);
        mFastHue = hsv[0] / 360f;
        mFastSat = hsv[1];
        mFastVal = hsv[2];

        // Adjust fastHue so the interpolation goes in the requested direction.
        // Clockwise   = increasing hue on the wheel.
        // Counterclockwise = decreasing hue.
        float delta = mFastHue - mSlowHue;
        if (!mHueCCW) {
            // Clockwise: we want delta >= 0
            if (delta < 0f) mFastHue += 1f;
        } else {
            // Counterclockwise: we want delta <= 0
            if (delta > 0f) mFastHue -= 1f;
        }
        mFastHueAdjusted = mFastHue;
    }

    private void applyBackgroundColor() {
        GLES30.glClearColor(mBgR / 255f, mBgG / 255f, mBgB / 255f, 1f);
    }

    /**
     * Upload initial particle data to both ping-pong VBOs.
     * Particles are placed uniformly over a disk covering the screen, with a
     * small random initial velocity so the simulation is alive on first open.
     */
    private void initParticles() {
        Random rand  = new Random();
        float[] data = new float[mNumParticles * FLOATS_PER_VERTEX];
        float radius = (float) Math.sqrt(mWidth * mWidth + mHeight * mHeight) / 2f;
        float cx     = mWidth  / 2f;
        float cy     = mHeight / 2f;

        for (int i = 0; i < mNumParticles; i++) {
            float r     = radius * (float) Math.sqrt(rand.nextFloat());
            float theta = rand.nextFloat() * 6.28318530718f;
            data[i * 4]     = cx + r * (float) Math.cos(theta);
            data[i * 4 + 1] = cy + r * (float) Math.sin(theta);
            // Small initial velocity so particles drift on first open
            float speed = rand.nextFloat() * 1.5f;
            float dir   = rand.nextFloat() * 6.28318530718f;
            data[i * 4 + 2] = speed * (float) Math.cos(dir);
            data[i * 4 + 3] = speed * (float) Math.sin(dir);
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

    private int buildProgram(String vertSrc, String fragSrc) {
        int vs   = compileShader(GLES30.GL_VERTEX_SHADER,   vertSrc);
        int fs   = compileShader(GLES30.GL_FRAGMENT_SHADER, fragSrc);
        int prog = GLES30.glCreateProgram();
        GLES30.glAttachShader(prog, vs);
        GLES30.glAttachShader(prog, fs);
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
        mUNumTouches = GLES30.glGetUniformLocation(mProgram, "u_NumTouches");
        mUSize       = GLES30.glGetUniformLocation(mProgram, "u_Size");
        mUAttraction = GLES30.glGetUniformLocation(mProgram, "u_Attraction");
        mUDrag       = GLES30.glGetUniformLocation(mProgram, "u_Drag");
        mUMaxSpeed   = GLES30.glGetUniformLocation(mProgram, "u_MaxSpeed");
        mUSlowHue    = GLES30.glGetUniformLocation(mProgram, "u_slowHue");
        mUFastHue    = GLES30.glGetUniformLocation(mProgram, "u_fastHue");
        mUSlowSat    = GLES30.glGetUniformLocation(mProgram, "u_slowSat");
        mUFastSat    = GLES30.glGetUniformLocation(mProgram, "u_fastSat");
        mUSlowVal    = GLES30.glGetUniformLocation(mProgram, "u_slowVal");
        mUFastVal    = GLES30.glGetUniformLocation(mProgram, "u_fastVal");
    }

    private static int clamp255(int v) { return Math.max(0, Math.min(v, 255)); }
}
