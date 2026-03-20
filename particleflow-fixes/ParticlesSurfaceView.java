package com.nfaralli.particleflow;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.opengl.GLSurfaceView;
import android.os.Build;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

/**
 * View container used to draw OpenGL points (particles).
 * Uses ParticlesRendererGL (OpenGL ES 3.0 + Transform Feedback).
 */
public class ParticlesSurfaceView extends GLSurfaceView
        implements SharedPreferences.OnSharedPreferenceChangeListener {

    public static final String SHARED_PREFS_NAME = "particleFlowPrefs";
    public static final int DEFAULT_NUM_PARTICLES        = 50000;
    public static final int MAX_NUM_PARTICLES            = 1000000;
    public static final int DEFAULT_PARTICLE_SIZE        = 1;
    public static final int DEFAULT_MAX_NUM_ATT_POINTS   = 5;
    public static final int MAX_MAX_NUM_ATT_POINTS       = 16;
    public static final int DEFAULT_BG_COLOR             = 0xFF000000;
    public static final int DEFAULT_SLOW_COLOR           = 0xFF4C4CFF;
    public static final int DEFAULT_FAST_COLOR           = 0xFFFF4C4C;
    public static final int DEFAULT_HUE_DIRECTION        = 0;
    public static final int DEFAULT_F01_ATTRACTION_COEF  = 10;
    public static final int DEFAULT_F01_DRAG_COEF        = 40;

    private final ParticlesRendererGL mRenderer;
    // Counter array to debounce lift-all-fingers gesture (see onTouchEvent).
    private int[] mCount;
    private final SharedPreferences mPrefs;

    public ParticlesSurfaceView(Context context, AttributeSet attrs) {
        super(context, attrs);

        // OpenGL ES 3.0 required for Transform Feedback.
        setEGLContextClientVersion(3);

        mRenderer = new ParticlesRendererGL();
        setRenderer(mRenderer);

        mPrefs = context.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE);
        mPrefs.registerOnSharedPreferenceChangeListener(this);
        mCount = new int[mPrefs.getInt("NumAttPoints", DEFAULT_MAX_NUM_ATT_POINTS)];

        applyPrefsToRenderer();
    }

    /** Push all SharedPreferences values into the renderer. */
    private void applyPrefsToRenderer() {
        int numTouch = mPrefs.getInt("NumAttPoints", DEFAULT_MAX_NUM_ATT_POINTS);
        mRenderer.setNumParticles(mPrefs.getInt("NumParticles", DEFAULT_NUM_PARTICLES));
        mRenderer.setMaxAttractionPoints(numTouch);

        // ParticleSize pref (1-50) → gl_PointSize (2-8)
        int prefSize = mPrefs.getInt("ParticleSize", DEFAULT_PARTICLE_SIZE);
        mRenderer.setParticleSize(2f + prefSize * 6f / 50f);

        int bgColor = mPrefs.getInt("BGColor", DEFAULT_BG_COLOR);
        mRenderer.setBackgroundColor(Color.red(bgColor), Color.green(bgColor), Color.blue(bgColor));

        int slowColor = mPrefs.getInt("SlowColor", DEFAULT_SLOW_COLOR);
        mRenderer.setSlowColor(Color.red(slowColor), Color.green(slowColor), Color.blue(slowColor));

        int fastColor = mPrefs.getInt("FastColor", DEFAULT_FAST_COLOR);
        mRenderer.setFastColor(Color.red(fastColor), Color.green(fastColor), Color.blue(fastColor));

        mRenderer.setHueCCW(mPrefs.getInt("HueDirection", DEFAULT_HUE_DIRECTION) == 0);

        // Attraction: UI 0-100 → internal 0-10000
        mRenderer.setAttraction(mPrefs.getInt("F01Attraction", DEFAULT_F01_ATTRACTION_COEF) * 100f);
        // Drag: UI 0-1000 → multiplier 0.0-1.0
        mRenderer.setDrag(1f - mPrefs.getInt("F01Drag", DEFAULT_F01_DRAG_COEF) / 1000f);
    }

    @Override
    public void onResume() {
        super.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            this.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }

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
                        mRenderer.setTouch(id, e.getX(index), e.getY(index));
                    }
                }
                for (id = 0; id < mCount.length; id++, ids >>= 1) {
                    if ((ids & 1) == 0) {
                        if (mCount[id]++ >= 3) {
                            mRenderer.clearTouch(id);
                        }
                    }
                }
                requestRender();
                break;
        }
        return true;
    }

    @Override
    public void onSharedPreferenceChanged(SharedPreferences prefs, String key) {
        if ("ShowSettingsHint".equals(key)) {
            return;
        }
        mCount = new int[mPrefs.getInt("NumAttPoints", DEFAULT_MAX_NUM_ATT_POINTS)];
        applyPrefsToRenderer();
    }

    public void resetAttractionPoints() {
        mRenderer.resetAttractionPoints();
    }
}
