package com.nfaralli.particleflow;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.AttributeSet;
import android.view.Choreographer;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;

/**
 * Vulkan-backed particle surface view.
 *
 * Replaces the GLSurfaceView used by ParticlesSurfaceView. Uses a plain
 * SurfaceView so the native Vulkan renderer manages the swapchain directly.
 *
 * Render loop is driven by Choreographer on a dedicated HandlerThread for
 * vsync-paced 60fps delivery without busy-looping.
 *
 * Drop-in for ParticlesSurfaceView: same SharedPreferences keys and constants.
 * Touch Y-flip done here: renderer receives y = height - screenY.
 *
 * Attraction pref → renderer: pref × 10f   (RS-parity scale, NOT × 100f)
 */
public class ParticlesSurfaceViewVK extends SurfaceView
        implements SurfaceHolder.Callback,
                   SharedPreferences.OnSharedPreferenceChangeListener,
                   Choreographer.FrameCallback {

    // ── Constants (must match ParticlesSurfaceView) ───────────────────────────
    public static final String SHARED_PREFS_NAME            = "particleFlowPrefs";
    public static final int    DEFAULT_NUM_PARTICLES        = 50000;
    public static final int    MAX_NUM_PARTICLES            = 1_000_000;
    public static final int    DEFAULT_PARTICLE_SIZE        = 1;
    public static final int    DEFAULT_MAX_NUM_ATT_POINTS   = 5;
    public static final int    MAX_MAX_NUM_ATT_POINTS       = 16;
    public static final int    DEFAULT_BG_COLOR             = 0xFF000000;
    public static final int    DEFAULT_SLOW_COLOR           = 0xFF4C4CFF;
    public static final int    DEFAULT_FAST_COLOR           = 0xFFFF4C4C;
    public static final int    DEFAULT_HUE_DIRECTION        = 0;
    public static final int    DEFAULT_F01_ATTRACTION_COEF  = 10;
    public static final int    DEFAULT_F01_DRAG_COEF        = 40;

    // ── State ─────────────────────────────────────────────────────────────────
    private final ParticlesRendererVK mRenderer;
    private final SharedPreferences   mPrefs;
    private int[]  mCount;

    private HandlerThread mRenderThread;
    private Handler       mRenderHandler;
    private volatile boolean mRunning = false;
    private int mSurfaceWidth, mSurfaceHeight;

    // ── Constructor ───────────────────────────────────────────────────────────

    public ParticlesSurfaceViewVK(Context context, AttributeSet attrs) {
        super(context, attrs);
        mRenderer = new ParticlesRendererVK();
        mPrefs    = context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE);
        mPrefs.registerOnSharedPreferenceChangeListener(this);
        mCount    = new int[mPrefs.getInt("NumAttPoints", DEFAULT_MAX_NUM_ATT_POINTS)];
        getHolder().addCallback(this);
    }

    // ── SurfaceHolder.Callback ────────────────────────────────────────────────

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        // Size arrives in surfaceChanged; wait for it.
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        mSurfaceWidth  = width;
        mSurfaceHeight = height;

        if (!mRunning) {
            // First call: start render thread and init Vulkan
            mRenderThread  = new HandlerThread("VKRenderThread");
            mRenderThread.start();
            mRenderHandler = new Handler(mRenderThread.getLooper());
            mRunning       = true;

            Surface surface = holder.getSurface();
            mRenderHandler.post(() -> {
                mRenderer.nativeInit(surface, width, height);
                applyPrefsToRenderer();
                // Start Choreographer vsync loop on render thread
                Choreographer.getInstance().postFrameCallback(this);
            });
        } else {
            // Subsequent calls (rotation, resize): recreate swapchain
            mRenderHandler.post(() -> mRenderer.nativeResize(width, height));
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        if (!mRunning) return;
        mRunning = false;

        // Stop the Choreographer on the render thread, then destroy
        mRenderHandler.post(() -> {
            Choreographer.getInstance().removeFrameCallback(this);
            mRenderer.nativeDestroy();
        });

        // Join render thread (wait for nativeDestroy to finish)
        mRenderThread.quitSafely();
        try { mRenderThread.join(2000); } catch (InterruptedException ignored) {}
        mRenderThread  = null;
        mRenderHandler = null;
    }

    // ── Choreographer.FrameCallback ───────────────────────────────────────────

    @Override
    public void doFrame(long frameTimeNanos) {
        if (!mRunning) return;
        mRenderer.nativeDrawFrame();
        Choreographer.getInstance().postFrameCallback(this);
    }

    // ── Touch handling ────────────────────────────────────────────────────────

    @Override
    public boolean onTouchEvent(MotionEvent e) {
        int numPointers;
        int index, id, ids;

        switch (e.getAction()) {
            case MotionEvent.ACTION_MOVE:
            case MotionEvent.ACTION_DOWN:
                ids = 0;
                numPointers = e.getPointerCount();
                for (index = 0; index < numPointers; index++) {
                    id = e.getPointerId(index);
                    ids |= 1 << id;
                    if (id < mCount.length) {
                        mCount[id] = 0;
                        // Y-flip: Vulkan origin is bottom-left for our NDC transform
                        mRenderer.setTouch(id, e.getX(index),
                                mSurfaceHeight - e.getY(index));
                    }
                }
                // Debounce: clear pointers that are no longer down
                for (id = 0; id < mCount.length; id++, ids >>= 1) {
                    if ((ids & 1) == 0) {
                        if (mCount[id]++ >= 3) {
                            mRenderer.clearTouch(id);
                        }
                    }
                }
                break;
        }
        return true;
    }

    // ── SharedPreferences ─────────────────────────────────────────────────────

    @Override
    public void onSharedPreferenceChanged(SharedPreferences prefs, String key) {
        if ("ShowSettingsHint".equals(key)) return;
        mCount = new int[mPrefs.getInt("NumAttPoints", DEFAULT_MAX_NUM_ATT_POINTS)];
        applyPrefsToRenderer();
    }

    private void applyPrefsToRenderer() {
        int numTouch = mPrefs.getInt("NumAttPoints", DEFAULT_MAX_NUM_ATT_POINTS);
        mRenderer.setNumParticles(mPrefs.getInt("NumParticles", DEFAULT_NUM_PARTICLES));
        mRenderer.setMaxAttractionPoints(numTouch);

        int prefSize = mPrefs.getInt("ParticleSize", DEFAULT_PARTICLE_SIZE);
        mRenderer.setParticleSize(2f + prefSize * 6f / 50f);

        int bgColor = mPrefs.getInt("BGColor", DEFAULT_BG_COLOR);
        mRenderer.setBackgroundColor(Color.red(bgColor), Color.green(bgColor), Color.blue(bgColor));

        int slowColor = mPrefs.getInt("SlowColor", DEFAULT_SLOW_COLOR);
        mRenderer.setSlowColor(Color.red(slowColor), Color.green(slowColor), Color.blue(slowColor));

        int fastColor = mPrefs.getInt("FastColor", DEFAULT_FAST_COLOR);
        mRenderer.setFastColor(Color.red(fastColor), Color.green(fastColor), Color.blue(fastColor));

        mRenderer.setHueCCW(mPrefs.getInt("HueDirection", DEFAULT_HUE_DIRECTION) == 0);

        // RS-parity: pref × 10f (not × 100f which was the GL over-scale)
        mRenderer.setAttraction(mPrefs.getInt("F01Attraction", DEFAULT_F01_ATTRACTION_COEF) * 10f);
        mRenderer.setDrag(1f - mPrefs.getInt("F01Drag", DEFAULT_F01_DRAG_COEF) / 1000f);
    }

    // ── Lifecycle passthrough (called by Activity) ────────────────────────────

    public void onResume() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }

    public void resetAttractionPoints() {
        mRenderer.resetAttractionPoints();
    }
}
