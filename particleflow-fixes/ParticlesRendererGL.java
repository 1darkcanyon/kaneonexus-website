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
 * VBO layout (interleaved, 16 bytes per particle):
 *   [ pos.x (4) | pos.y (4) | delta.x (4) | delta.y (4) ]
 *
 * Rendering uses additive blending (GL_ONE, GL_ONE) so dense/fast particles
 * accumulate brightness and bloom to white at attraction centers.
 *
 * Each particle is a soft gaussian point sprite — the fragment shader fades
 * intensity from the center outward, creating the characteristic glow look.
 *
 * Default color sweep: slow = blue → cyan → green → red = fast
 * (counterclockwise around the hue wheel).
 */
public class ParticlesRendererGL implements GLSurfaceView.Renderer {

    public  static final int   MAX_TOUCHES       = 10;
    private static final float MAX_SPEED_HARD    = 200f; // internal safety cap
    private static final int   FLOATS_PER_VERTEX = 4;
    private static final int   BYTES_PER_VERTEX  = FLOATS_PER_VERTEX * 4;

    // ── Configurable parameters ───────────────────────────────────────────────

    private volatile int     mNumParticles        = 50000;
    private volatile int     mMaxAttractionPoints = 5;

    // Background RGB 0-255; default black
    private volatile int mBgR = 0, mBgG = 0, mBgB = 0;

    // Slow particle color — pure blue by default
    private volatile int mSlowR = 0,   mSlowG = 0,   mSlowB = 255;
    // Fast particle color — pure red by default
    private volatile int mFastR = 255, mFastG = 0,   mFastB = 0;

    // Counterclockwise default: blue → cyan → green → yellow → red
    private volatile boolean mHueCCW = true;

    // Internal physics (converted from UI scale by ParticlesSurfaceView)
    private volatile float mF01Attraction = 1000f; // UI 0-100  → internal * 100
    private volatile float mF01Drag       = 0.96f; // UI 0-1000 → 1 - UI/1000

    // Point sprite size in pixels (gl_PointSize); default 4
    private volatile float mParticleSize = 4f;

    // ── Derived HSV ───────────────────────────────────────────────────────────
    private float mSlowHue, mSlowSat, mSlowVal;
    private float mFastHue, mFastSat, mFastVal;
    private float mFastHueAdjusted;

    // ── GL state ──────────────────────────────────────────────────────────────
    private int       mProgram;
    private final int[] mVbo = new int[2];
    private int       mCurrentRead = 0;
    private boolean   mVbosReady  = false;

    private float mWidth  = 1080f;
    private float mHeight = 1920f;

    private final float[] mTouches = new float[MAX_TOUCHES * 2];

    private int mUTouch, mUNumTouches, mUSize, mUAttraction, mUDrag, mUMaxSpeed, mUPointSize;
    private int mUSlowHue, mUFastHue, mUSlowSat, mUFastSat, mUSlowVal, mUFastVal;

    // ── Vertex shader ─────────────────────────────────────────────────────────
    // Physics on GPU; speed emerges from attraction force and drag.
    // gl_PointSize = 8 gives the gaussian sprite enough room to bloom.
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
        "uniform float u_PointSize;\n"                                              +
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
        "    gl_PointSize = u_PointSize;\n"                                                 +
        "}\n";

    // ── Fragment shader ───────────────────────────────────────────────────────
    // Gaussian point sprite: soft circular falloff so particles glow.
    // Combined with additive blending (GL_ONE, GL_ONE), dense areas bloom
    // to white, exactly like the original app.
    private static final String FRAGMENT_SHADER =
        "#version 300 es\n"                                                              +
        "precision highp float;\n"                                                       +
        "in vec2 v_NewDelta;\n"                                                         +
        "uniform float u_slowHue, u_fastHue;\n"                                         +
        "uniform float u_slowSat, u_fastSat;\n"                                         +
        "uniform float u_slowVal, u_fastVal;\n"                                         +
        "out vec4 fragColor;\n"                                                          +
        // Map particle speed to 0-1
        "float speedCoef(vec2 v) {\n"                                                   +
        "    return clamp(log(dot(v, v) + 1.0) / 10.0, 0.0, 1.0);\n"                   +
        "}\n"                                                                             +
        // HSV → RGB; fract() handles hue values outside [0,1]
        "vec3 hsv2rgb(float h, float s, float v) {\n"                                   +
        "    vec4  K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);\n"                           +
        "    vec3  p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);\n"                  +
        "    return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);\n"                 +
        "}\n"                                                                             +
        "void main() {\n"                                                                +
        // Gaussian falloff from point center using gl_PointCoord
        "    vec2  uv    = gl_PointCoord - vec2(0.5);\n"                               +
        "    float d     = dot(uv, uv);\n"                                             +
        "    if (d > 0.25) discard;\n"                                                  +
        "    float alpha = exp(-d * 16.0);\n"                                           +
        // Color from speed
        "    float c   = speedCoef(v_NewDelta);\n"                                      +
        "    vec3  col = hsv2rgb(\n"                                                    +
        "        mix(u_slowHue, u_fastHue, c),\n"                                       +
        "        mix(u_slowSat, u_fastSat, c),\n"                                       +
        "        mix(u_slowVal, u_fastVal, c));\n"                                      +
        // Additive: output rgb * alpha; blending (GL_ONE,GL_ONE) accumulates brightness
        "    fragColor = vec4(col * alpha, alpha);\n"                                   +
        "}\n";

    public ParticlesRendererGL() {
        for (int i = 0; i < mTouches.length; i++) mTouches[i] = -1f;
        updateHSV();
    }

    // ── GLSurfaceView.Renderer ────────────────────────────────────────────────

    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        GLES30.glClearColor(0f, 0f, 0f, 1f);
        mProgram = buildProgram(VERTEX_SHADER, FRAGMENT_SHADER);
        cacheUniforms();
        GLES30.glGenBuffers(2, mVbo, 0);
        mVbosReady = true;

        // Additive blending: dense/fast particles accumulate to white (bloom effect)
        GLES30.glEnable(GLES30.GL_BLEND);
        GLES30.glBlendFunc(GLES30.GL_ONE, GLES30.GL_ONE);
    }

    @Override
    public void onSurfaceChanged(GL10 gl, int w, int h) {
        GLES30.glViewport(0, 0, w, h);
        mWidth  = w;
        mHeight = h;
        initParticles();
        resetAttractionPoints();
    }

    @Override
    public void onDrawFrame(GL10 gl) {
        GLES30.glClearColor(mBgR / 255f, mBgG / 255f, mBgB / 255f, 1f);
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT);
        GLES30.glUseProgram(mProgram);

        int writeIndex = 1 - mCurrentRead;

        GLES30.glUniform2fv(mUTouch,      MAX_TOUCHES, mTouches, 0);
        GLES30.glUniform1i(mUNumTouches,  Math.min(mMaxAttractionPoints, MAX_TOUCHES));
        GLES30.glUniform2f(mUSize,        mWidth, mHeight);
        GLES30.glUniform1f(mUAttraction,  mF01Attraction);
        GLES30.glUniform1f(mUDrag,        mF01Drag);
        GLES30.glUniform1f(mUMaxSpeed,    MAX_SPEED_HARD);
        GLES30.glUniform1f(mUPointSize,   mParticleSize);
        GLES30.glUniform1f(mUSlowHue,     mSlowHue);
        GLES30.glUniform1f(mUFastHue,     mFastHueAdjusted);
        GLES30.glUniform1f(mUSlowSat,     mSlowSat);
        GLES30.glUniform1f(mUFastSat,     mFastSat);
        GLES30.glUniform1f(mUSlowVal,     mSlowVal);
        GLES30.glUniform1f(mUFastVal,     mFastVal);

        GLES30.glBindBuffer(GLES30.GL_ARRAY_BUFFER, mVbo[mCurrentRead]);
        GLES30.glEnableVertexAttribArray(0);
        GLES30.glVertexAttribPointer(0, 2, GLES30.GL_FLOAT, false, BYTES_PER_VERTEX, 0);
        GLES30.glEnableVertexAttribArray(1);
        GLES30.glVertexAttribPointer(1, 2, GLES30.GL_FLOAT, false, BYTES_PER_VERTEX, 8);

        GLES30.glBindBufferBase(GLES30.GL_TRANSFORM_FEEDBACK_BUFFER, 0, mVbo[writeIndex]);
        GLES30.glBeginTransformFeedback(GLES30.GL_POINTS);
        GLES30.glDrawArrays(GLES30.GL_POINTS, 0, mNumParticles);
        GLES30.glEndTransformFeedback();

        mCurrentRead = writeIndex;
    }

    // ── Touch ─────────────────────────────────────────────────────────────────

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

    /** Must be called on GL thread (via queueEvent) if VBOs are already allocated. */
    public void setNumParticles(int count) {
        mNumParticles = Math.max(1000, Math.min(count, 500000));
        if (mVbosReady) initParticles();
    }

    public void setMaxAttractionPoints(int max) {
        mMaxAttractionPoints = Math.max(0, Math.min(max, 100));
    }

    public void setBackgroundColor(int r, int g, int b) {
        mBgR = clamp255(r); mBgG = clamp255(g); mBgB = clamp255(b);
    }

    public void setSlowColor(int r, int g, int b) {
        mSlowR = clamp255(r); mSlowG = clamp255(g); mSlowB = clamp255(b);
        updateHSV();
    }

    public void setFastColor(int r, int g, int b) {
        mFastR = clamp255(r); mFastG = clamp255(g); mFastB = clamp255(b);
        updateHSV();
    }

    public void setHueCCW(boolean ccw) { mHueCCW = ccw; updateHSV(); }

    /** Internal attraction force.  UI 0-100 maps to 0-10000. */
    public void setAttraction(float attraction) { mF01Attraction = Math.max(0f, attraction); }

    /** Internal drag multiplier 0.0-1.0.  UI 0-1000 maps to 0.0-1.0. */
    public void setDrag(float drag) { mF01Drag = Math.max(0f, Math.min(drag, 0.9999f)); }

    /** Point sprite size in pixels.  UI pref 1-50 maps to roughly 2-8. */
    public void setParticleSize(float size) { mParticleSize = Math.max(1f, Math.min(size, 32f)); }

    /**
     * Place mMaxAttractionPoints touch points evenly around the screen center.
     * Call this (via queueEvent) after the surface dimensions are known.
     */
    public void resetAttractionPoints() {
        if (mWidth <= 0 || mHeight <= 0) return;
        float l = Math.min(mWidth, mHeight) / 3f;
        int n = Math.min(mMaxAttractionPoints, MAX_TOUCHES);
        // Clear all existing touches first
        for (int i = 0; i < MAX_TOUCHES; i++) {
            mTouches[i * 2]     = -1f;
            mTouches[i * 2 + 1] = -1f;
        }
        // Place n touches in a circle (first one at top)
        if (n == 1) {
            mTouches[0] = mWidth  / 2f;
            mTouches[1] = mHeight / 2f;
        } else {
            for (int i = 0; i < n; i++) {
                double angle = i * 2.0 * Math.PI / n;
                mTouches[i * 2]     = mWidth  / 2f + l * (float) Math.sin(angle);
                mTouches[i * 2 + 1] = mHeight / 2f + l * (float) Math.cos(angle);
            }
        }
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public int     getNumParticles()        { return mNumParticles; }
    public int     getMaxAttractionPoints() { return mMaxAttractionPoints; }
    public int     getBgR()  { return mBgR; }
    public int     getBgG()  { return mBgG; }
    public int     getBgB()  { return mBgB; }
    public int     getSlowR() { return mSlowR; }
    public int     getSlowG() { return mSlowG; }
    public int     getSlowB() { return mSlowB; }
    public int     getFastR() { return mFastR; }
    public int     getFastG() { return mFastG; }
    public int     getFastB() { return mFastB; }
    public boolean getHueCCW()  { return mHueCCW; }
    public float   getAttraction() { return mF01Attraction; }
    public float   getDrag()       { return mF01Drag; }

    // ── Private helpers ───────────────────────────────────────────────────────

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

        // Adjust fastHue for direction so shader mix() travels the right way.
        // fract() in hsv2rgb handles values outside [0,1].
        float delta = mFastHue - mSlowHue;
        if (!mHueCCW) {
            // Clockwise = increasing hue
            if (delta < 0f) mFastHue += 1f;
        } else {
            // Counterclockwise = decreasing hue
            if (delta > 0f) mFastHue -= 1f;
        }
        mFastHueAdjusted = mFastHue;
    }

    private void initParticles() {
        Random rand  = new Random();
        float[] data = new float[mNumParticles * FLOATS_PER_VERTEX];
        float radius = (float) Math.sqrt(mWidth * mWidth + mHeight * mHeight) / 2f;

        for (int i = 0; i < mNumParticles; i++) {
            float r     = radius * (float) Math.sqrt(rand.nextFloat());
            float theta = rand.nextFloat() * 6.28318530718f;
            data[i * 4]     = mWidth  / 2f + r * (float) Math.cos(theta);
            data[i * 4 + 1] = mHeight / 2f + r * (float) Math.sin(theta);
            // Tiny initial drift so the field looks alive on first open
            float spd = rand.nextFloat() * 1.5f;
            float dir = rand.nextFloat() * 6.28318530718f;
            data[i * 4 + 2] = spd * (float) Math.cos(dir);
            data[i * 4 + 3] = spd * (float) Math.sin(dir);
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
        mUPointSize  = GLES30.glGetUniformLocation(mProgram, "u_PointSize");
        mUSlowHue    = GLES30.glGetUniformLocation(mProgram, "u_slowHue");
        mUFastHue    = GLES30.glGetUniformLocation(mProgram, "u_fastHue");
        mUSlowSat    = GLES30.glGetUniformLocation(mProgram, "u_slowSat");
        mUFastSat    = GLES30.glGetUniformLocation(mProgram, "u_fastSat");
        mUSlowVal    = GLES30.glGetUniformLocation(mProgram, "u_slowVal");
        mUFastVal    = GLES30.glGetUniformLocation(mProgram, "u_fastVal");
    }

    private static int clamp255(int v) { return Math.max(0, Math.min(v, 255)); }
}
