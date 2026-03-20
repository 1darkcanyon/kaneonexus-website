package com.nfaralli.particleflow;

import android.graphics.Color;
import android.view.Surface;

/**
 * Java wrapper around the Vulkan NDK renderer (libparticleflow.so).
 *
 * Drop-in replacement for ParticlesRendererGL: exposes the same setter names so
 * ParticlesSurfaceView needs no logic changes when selecting the renderer.
 *
 * Attraction pref → internal: pref * 10f   (matches original RenderScript scale)
 *                              NOT pref * 100f  (which was the GL over-scale bug)
 *
 * Touch Y-flip is done by the caller (ParticlesSurfaceView):
 *   mRenderer.setTouch(id, x, height - screenY)
 */
public class ParticlesRendererVK {

    static { System.loadLibrary("particleflow"); }

    public static final int MAX_TOUCHES = 16;

    // ── Cached state for pushParams() ────────────────────────────────────────
    private int   numParticles = 50000;
    private int   numTouch     = 5;
    private int   hueDir       = 0;       // 0 = CW (blue→red), 1 = CCW
    private float attract      = 100f;    // internal units (pref × 10)
    private float drag         = 0.96f;
    private float pointSize    = 4f;
    private float bgR = 0, bgG = 0, bgB = 0;
    private float slowH, slowS = 1f, slowV = 1f;
    private float fastH, fastS = 1f, fastV = 1f;

    // ── Native methods ────────────────────────────────────────────────────────
    public native void nativeInit(Surface surface, int width, int height);
    public native void nativeDestroy();
    public native void nativeDrawFrame();
    public native void nativeResize(int width, int height);
    public native void nativeSetTouch(int idx, float x, float y);
    public native void nativeClearTouch(int idx);
    public native void nativeSetParams(
            int numParticles, int numTouch,
            float attract,    float drag,
            float bgR,        float bgG,  float bgB,
            float slowH,      float slowS, float slowV,
            float fastH,      float fastS, float fastV,
            int hueDir,       float pointSize);
    public native void nativeResetParticles();

    // ── Setters (mirror ParticlesRendererGL API) ──────────────────────────────

    public void setNumParticles(int n) {
        numParticles = Math.max(1000, Math.min(n, 1_000_000));
        pushParams();
    }

    public void setMaxAttractionPoints(int n) {
        numTouch = Math.max(0, Math.min(n, MAX_TOUCHES));
        pushParams();
    }

    /** RGB 0-255 */
    public void setBackgroundColor(int r, int g, int b) {
        bgR = r / 255f; bgG = g / 255f; bgB = b / 255f;
        pushParams();
    }

    /** RGB 0-255 — converted to HSV internally */
    public void setSlowColor(int r, int g, int b) {
        float[] h = toHSV(r, g, b); slowH = h[0]; slowS = h[1]; slowV = h[2];
        pushParams();
    }

    /** RGB 0-255 — converted to HSV internally */
    public void setFastColor(int r, int g, int b) {
        float[] h = toHSV(r, g, b); fastH = h[0]; fastS = h[1]; fastV = h[2];
        pushParams();
    }

    /** true = CCW hue rotation, false = CW */
    public void setHueCCW(boolean ccw) { hueDir = ccw ? 1 : 0; pushParams(); }

    /**
     * Set attraction strength.
     * Caller should pass the raw pref value (0-100); this class stores it
     * already multiplied by 10 to match RenderScript's internal scale.
     * ParticlesSurfaceView should call: setAttraction(prefValue * 10f)
     */
    public void setAttraction(float a)  { attract   = Math.max(0f, a);                           pushParams(); }
    public void setDrag(float d)        { drag      = Math.max(0f, Math.min(d, 0.9999f));        pushParams(); }
    public void setParticleSize(float s){ pointSize  = Math.max(1f, Math.min(s, 32f));            pushParams(); }

    // ── Touch passthrough ─────────────────────────────────────────────────────

    /** idx = pointer ID; y should already be flipped (height - screenY). */
    public void setTouch(int idx, float x, float y) { nativeSetTouch(idx, x, y); }
    public void clearTouch(int idx)                  { nativeClearTouch(idx); }

    /** Re-place particles and set default attraction-point circle. */
    public void resetAttractionPoints() { nativeResetParticles(); }

    // ── Internal ──────────────────────────────────────────────────────────────

    private void pushParams() {
        nativeSetParams(numParticles, numTouch,
                        attract, drag,
                        bgR, bgG, bgB,
                        slowH, slowS, slowV,
                        fastH, fastS, fastV,
                        hueDir, pointSize);
    }

    /** Returns [hue 0-1, sat 0-1, val 0-1] from RGB 0-255. */
    private static float[] toHSV(int r, int g, int b) {
        float[] hsv = new float[3];
        Color.RGBToHSV(r, g, b, hsv);
        hsv[0] /= 360f;   // normalize hue to [0, 1] for GLSL
        return hsv;
    }
}
