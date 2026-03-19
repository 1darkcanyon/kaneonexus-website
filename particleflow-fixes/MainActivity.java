package com.nfaralli.particleflow;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Shader;
import android.opengl.GLSurfaceView;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.MotionEvent;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;

/**
 * Host activity for ParticleFlowGL.
 *
 * - GLSurfaceView fills the screen; a gear button floats in the top-right corner.
 * - Tapping the gear opens the settings dialog (matches original UI).
 * - All settings are persisted in SharedPreferences and restored on next launch.
 *
 * UI scales:
 *   Attraction   0-100  (internal × 100  = force coefficient 0-10000)
 *   Drag         0-1000 (internal / 1000 = per-frame velocity multiplier 0.0-1.0)
 */
public class MainActivity extends Activity {

    private static final String PREFS = "pf_settings";

    private GLSurfaceView       mGLView;
    private ParticlesRendererGL mRenderer;
    private boolean             mSettingsOpen = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mGLView = new GLSurfaceView(this);
        mGLView.setEGLContextClientVersion(3);

        mRenderer = new ParticlesRendererGL();
        loadSettings(); // restore before GL surface is created

        mGLView.setRenderer(mRenderer);
        mGLView.setRenderMode(GLSurfaceView.RENDERMODE_CONTINUOUSLY);

        // ── Overlay: GLSurfaceView + floating settings button ─────────────────
        FrameLayout frame = new FrameLayout(this);
        frame.addView(mGLView);

        TextView gearBtn = new TextView(this);
        gearBtn.setText("⚙");
        gearBtn.setTextSize(28f);
        gearBtn.setTextColor(0xCCFFFFFF);
        gearBtn.setPadding(dp(12), dp(8), dp(12), dp(8));
        gearBtn.setBackgroundColor(0x55000000);
        FrameLayout.LayoutParams gearLp = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.TOP | Gravity.END);
        gearLp.setMargins(0, dp(24), dp(8), 0);
        gearBtn.setLayoutParams(gearLp);
        gearBtn.setOnClickListener(v -> { if (!mSettingsOpen) showSettingsDialog(); });
        frame.addView(gearBtn);

        setContentView(frame);

        // ── Touch → attraction points ─────────────────────────────────────────
        mGLView.setOnTouchListener((v, event) -> {
            int action = event.getActionMasked();
            int idx    = event.getActionIndex();
            int id     = event.getPointerId(idx);

            switch (action) {
                case MotionEvent.ACTION_DOWN:
                case MotionEvent.ACTION_POINTER_DOWN:
                    if (id < ParticlesRendererGL.MAX_TOUCHES)
                        mRenderer.setTouch(id, event.getX(idx), event.getY(idx));
                    break;

                case MotionEvent.ACTION_MOVE:
                    for (int i = 0; i < event.getPointerCount(); i++) {
                        int pid = event.getPointerId(i);
                        if (pid < ParticlesRendererGL.MAX_TOUCHES)
                            mRenderer.setTouch(pid, event.getX(i), event.getY(i));
                    }
                    break;

                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_POINTER_UP:
                    if (id < ParticlesRendererGL.MAX_TOUCHES)
                        mRenderer.clearTouch(id);
                    break;

                case MotionEvent.ACTION_CANCEL:
                    for (int i = 0; i < ParticlesRendererGL.MAX_TOUCHES; i++)
                        mRenderer.clearTouch(i);
                    break;
            }
            return true;
        });
    }

    // ── Settings dialog ───────────────────────────────────────────────────────

    private void showSettingsDialog() {
        mSettingsOpen = true;
        mGLView.onPause();

        Context ctx   = this;
        int     dp16  = dp(16);

        LinearLayout root = new LinearLayout(ctx);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp16, dp16, dp16, dp16);
        root.setBackgroundColor(0xFF1A1A2E);

        // Title
        TextView title = new TextView(ctx);
        title.setText("⚙  Settings");
        title.setTextSize(22f);
        title.setTextColor(Color.WHITE);
        title.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        title.setPadding(0, 0, 0, dp(12));
        root.addView(title);
        root.addView(divider(ctx));

        // ── Max Attraction Points (0-100) ─────────────────────────────────────
        root.addView(sectionLabel(ctx, "Max Number of Attraction Points:"));
        EditText etAttrPts = numField(ctx, String.valueOf(mRenderer.getMaxAttractionPoints()));
        root.addView(etAttrPts);
        root.addView(divider(ctx));

        // ── Background Color ──────────────────────────────────────────────────
        root.addView(sectionLabel(ctx, "Background Color:"));
        EditText[] bgRGB = rgbRow(ctx, root,
                mRenderer.getBgR(), mRenderer.getBgG(), mRenderer.getBgB());
        root.addView(divider(ctx));

        // ── Particle Colors ───────────────────────────────────────────────────
        root.addView(sectionLabel(ctx, "Particles Color:"));
        root.addView(rainbowBar(ctx));

        root.addView(subLabel(ctx, "Slow Particles:"));
        EditText[] slowRGB = rgbRow(ctx, root,
                mRenderer.getSlowR(), mRenderer.getSlowG(), mRenderer.getSlowB());

        root.addView(subLabel(ctx, "Fast Particles:"));
        EditText[] fastRGB = rgbRow(ctx, root,
                mRenderer.getFastR(), mRenderer.getFastG(), mRenderer.getFastB());

        root.addView(subLabel(ctx, "Hue Direction:"));
        Spinner hueSpinner = new Spinner(ctx);
        ArrayAdapter<String> hueAdapter = new ArrayAdapter<>(ctx,
                android.R.layout.simple_spinner_item,
                new String[]{"Clockwise", "Counterclockwise"});
        hueAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        hueSpinner.setAdapter(hueAdapter);
        hueSpinner.setSelection(mRenderer.getHueCCW() ? 1 : 0);
        root.addView(hueSpinner);
        root.addView(divider(ctx));

        // ── Force Coefficients ────────────────────────────────────────────────
        root.addView(sectionLabel(ctx, "Force Coefficients:"));

        root.addView(subLabel(ctx, "Attraction (0 – 100):"));
        // Convert internal → UI: internal / 100
        EditText etAttraction = numField(ctx,
                String.valueOf(Math.round(mRenderer.getAttraction() / 100f)));
        root.addView(etAttraction);

        root.addView(subLabel(ctx, "Drag (0 – 1000):"));
        // Convert internal → UI: internal * 1000
        EditText etDrag = numField(ctx,
                String.valueOf(Math.round(mRenderer.getDrag() * 1000f)));
        root.addView(etDrag);
        root.addView(divider(ctx));

        // ── Particle Count ────────────────────────────────────────────────────
        root.addView(sectionLabel(ctx, "Particle Count:"));
        EditText etParticles = numField(ctx,
                String.valueOf(mRenderer.getNumParticles()));
        root.addView(etParticles);

        ScrollView scroll = new ScrollView(ctx);
        scroll.addView(root);

        new AlertDialog.Builder(this)
            .setView(scroll)
            .setPositiveButton("OK", (dialog, which) -> {
                applyAndSave(etAttrPts, bgRGB, slowRGB, fastRGB, hueSpinner,
                             etAttraction, etDrag, etParticles);
                resumeGL();
            })
            .setNegativeButton("Cancel", (dialog, which) -> resumeGL())
            .setOnCancelListener(dialog -> resumeGL())
            .show();
    }

    private void applyAndSave(EditText etAttrPts, EditText[] bgRGB,
                               EditText[] slowRGB, EditText[] fastRGB,
                               Spinner hueSpinner,
                               EditText etAttraction, EditText etDrag,
                               EditText etParticles) {

        int     attrPts   = parseInt(etAttrPts,   mRenderer.getMaxAttractionPoints());
        int     bgR       = parseInt(bgRGB[0],     mRenderer.getBgR());
        int     bgG       = parseInt(bgRGB[1],     mRenderer.getBgG());
        int     bgB       = parseInt(bgRGB[2],     mRenderer.getBgB());
        int     slowR     = parseInt(slowRGB[0],   mRenderer.getSlowR());
        int     slowG     = parseInt(slowRGB[1],   mRenderer.getSlowG());
        int     slowB     = parseInt(slowRGB[2],   mRenderer.getSlowB());
        int     fastR     = parseInt(fastRGB[0],   mRenderer.getFastR());
        int     fastG     = parseInt(fastRGB[1],   mRenderer.getFastG());
        int     fastB     = parseInt(fastRGB[2],   mRenderer.getFastB());
        boolean ccw       = hueSpinner.getSelectedItemPosition() == 1;
        // UI 0-100 → internal × 100
        int     attrUI    = parseInt(etAttraction, Math.round(mRenderer.getAttraction() / 100f));
        float   attraction = attrUI * 100f;
        // UI 0-1000 → internal / 1000
        int     dragUI    = parseInt(etDrag, Math.round(mRenderer.getDrag() * 1000f));
        float   drag      = dragUI / 1000f;
        int     particles = parseInt(etParticles,  mRenderer.getNumParticles());

        // Apply all non-GL settings immediately
        mRenderer.setMaxAttractionPoints(attrPts);
        mRenderer.setBackgroundColor(bgR, bgG, bgB);
        mRenderer.setSlowColor(slowR, slowG, slowB);
        mRenderer.setFastColor(fastR, fastG, fastB);
        mRenderer.setHueCCW(ccw);
        mRenderer.setAttraction(attraction);
        mRenderer.setDrag(drag);

        // Particle count reinitialises VBOs — must run on GL thread
        if (particles != mRenderer.getNumParticles())
            mGLView.queueEvent(() -> mRenderer.setNumParticles(particles));

        // Persist everything
        SharedPreferences.Editor e = getSharedPreferences(PREFS, MODE_PRIVATE).edit();
        e.putInt("attrPts",   attrPts);
        e.putInt("bgR",       bgR);        e.putInt("bgG",  bgG);  e.putInt("bgB",  bgB);
        e.putInt("slowR",     slowR);      e.putInt("slowG",slowG); e.putInt("slowB",slowB);
        e.putInt("fastR",     fastR);      e.putInt("fastG",fastG); e.putInt("fastB",fastB);
        e.putBoolean("ccw",   ccw);
        e.putInt("attrUI",    attrUI);
        e.putInt("dragUI",    dragUI);
        e.putInt("particles", particles);
        e.apply();
    }

    private void loadSettings() {
        SharedPreferences p = getSharedPreferences(PREFS, MODE_PRIVATE);
        mRenderer.setMaxAttractionPoints(p.getInt("attrPts",   5));
        mRenderer.setBackgroundColor(
                p.getInt("bgR", 0), p.getInt("bgG", 0), p.getInt("bgB", 0));
        mRenderer.setSlowColor(
                p.getInt("slowR", 0), p.getInt("slowG", 0), p.getInt("slowB", 255));
        mRenderer.setFastColor(
                p.getInt("fastR", 255), p.getInt("fastG", 0), p.getInt("fastB", 0));
        mRenderer.setHueCCW(p.getBoolean("ccw", true));
        mRenderer.setAttraction(p.getInt("attrUI", 50) * 100f);
        mRenderer.setDrag(p.getInt("dragUI", 960) / 1000f);
        // numParticles set directly (before GL init)
        int np = p.getInt("particles", 50000);
        // bypass VBO check — surface not created yet
        try {
            java.lang.reflect.Field f = ParticlesRendererGL.class.getDeclaredField("mNumParticles");
            f.setAccessible(true);
            f.set(mRenderer, Math.max(1000, Math.min(np, 500000)));
        } catch (Exception ignored) {
            // field access fallback: will use default 50000
        }
    }

    private void resumeGL() { mGLView.onResume(); mSettingsOpen = false; }

    // ── UI helpers ────────────────────────────────────────────────────────────

    /** Three R/G/B EditText fields in one row, added to parent. Returns [r,g,b]. */
    private EditText[] rgbRow(Context ctx, LinearLayout parent, int r, int g, int b) {
        LinearLayout row = new LinearLayout(ctx);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, dp(4), 0, dp(4));

        EditText etR = inlineNumField(ctx); etR.setText(String.valueOf(r));
        EditText etG = inlineNumField(ctx); etG.setText(String.valueOf(g));
        EditText etB = inlineNumField(ctx); etB.setText(String.valueOf(b));

        row.addView(labeled(ctx, "R:", etR));
        row.addView(labeled(ctx, "G:", etG));
        row.addView(labeled(ctx, "B:", etB));
        parent.addView(row);
        return new EditText[]{etR, etG, etB};
    }

    private EditText inlineNumField(Context ctx) {
        EditText et = new EditText(ctx);
        et.setInputType(InputType.TYPE_CLASS_NUMBER);
        et.setTextColor(Color.WHITE);
        et.setTextSize(16f);
        et.setBackgroundColor(0xFF0D0D1A);
        et.setPadding(dp(6), dp(6), dp(6), dp(6));
        return et;
    }

    private LinearLayout labeled(Context ctx, String lbl, EditText et) {
        LinearLayout ll = new LinearLayout(ctx);
        ll.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams lp =
                new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        ll.setLayoutParams(lp);

        TextView tv = new TextView(ctx);
        tv.setText(lbl);
        tv.setTextColor(Color.WHITE);
        tv.setTextSize(14f);
        tv.setPadding(dp(4), dp(6), dp(4), 0);
        ll.addView(tv);

        et.setLayoutParams(new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        ll.addView(et);
        return ll;
    }

    private EditText numField(Context ctx, String value) {
        EditText et = new EditText(ctx);
        et.setText(value);
        et.setInputType(InputType.TYPE_CLASS_NUMBER);
        et.setTextColor(Color.WHITE);
        et.setTextSize(18f);
        et.setBackgroundColor(0xFF0D0D1A);
        et.setPadding(dp(8), dp(8), dp(8), dp(8));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, dp(4), 0, dp(8));
        et.setLayoutParams(lp);
        return et;
    }

    private TextView sectionLabel(Context ctx, String text) {
        TextView tv = new TextView(ctx);
        tv.setText(text);
        tv.setTextSize(15f);
        tv.setTextColor(Color.WHITE);
        tv.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        tv.setPadding(0, dp(12), 0, dp(4));
        return tv;
    }

    private TextView subLabel(Context ctx, String text) {
        TextView tv = new TextView(ctx);
        tv.setText(text);
        tv.setTextSize(14f);
        tv.setTextColor(0xFFCCCCCC);
        tv.setPadding(dp(8), dp(8), 0, dp(2));
        return tv;
    }

    private android.view.View divider(Context ctx) {
        android.view.View v = new android.view.View(ctx);
        v.setBackgroundColor(0xFF00BFFF);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(1));
        lp.setMargins(0, dp(8), 0, dp(4));
        v.setLayoutParams(lp);
        return v;
    }

    /** Full-width rainbow gradient bar showing the hue sweep. */
    private android.view.View rainbowBar(Context ctx) {
        android.view.View bar = new android.view.View(ctx) {
            @Override
            protected void onDraw(android.graphics.Canvas canvas) {
                Paint p = new Paint();
                int[] colors = {
                    0xFFFF0000, 0xFFFFFF00, 0xFF00FF00,
                    0xFF00FFFF, 0xFF0000FF, 0xFFFF00FF, 0xFFFF0000
                };
                p.setShader(new LinearGradient(0, 0, getWidth(), 0,
                        colors, null, Shader.TileMode.CLAMP));
                canvas.drawRect(0, 0, getWidth(), getHeight(), p);
            }
        };
        bar.setWillNotDraw(false);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(20));
        lp.setMargins(0, dp(4), 0, dp(8));
        bar.setLayoutParams(lp);
        return bar;
    }

    // ── Parsing ───────────────────────────────────────────────────────────────

    private static int parseInt(EditText et, int fallback) {
        try { return Integer.parseInt(et.getText().toString().trim()); }
        catch (Exception e) { return fallback; }
    }

    private int dp(int dp) {
        return Math.round(dp * getResources().getDisplayMetrics().density);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    @Override protected void onPause()  { super.onPause();  mGLView.onPause(); }
    @Override protected void onResume() {
        super.onResume();
        if (!mSettingsOpen) mGLView.onResume();
    }
}
