package com.nfaralli.particleflow;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Shader;
import android.opengl.GLSurfaceView;
import android.os.Bundle;
import android.text.InputType;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;

public class MainActivity extends Activity {

    private GLSurfaceView          mGLView;
    private ParticlesRendererGL    mRenderer;
    private GestureDetector        mGestureDetector;
    private boolean                mSettingsOpen = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mGLView = new GLSurfaceView(this);
        mGLView.setEGLContextClientVersion(3);

        mRenderer = new ParticlesRendererGL();
        mGLView.setRenderer(mRenderer);
        mGLView.setRenderMode(GLSurfaceView.RENDERMODE_CONTINUOUSLY);
        setContentView(mGLView);

        // Long-press anywhere on the GL surface opens settings
        mGestureDetector = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() {
            @Override
            public void onLongPress(MotionEvent e) {
                if (!mSettingsOpen) showSettingsDialog();
            }
        });

        mGLView.setOnTouchListener((v, event) -> {
            mGestureDetector.onTouchEvent(event);

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

        Context ctx = this;
        int dp8  = dp(8);
        int dp16 = dp(16);

        LinearLayout root = new LinearLayout(ctx);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp16, dp16, dp16, dp16);
        root.setBackgroundColor(0xFF1A1A2E);

        // ── Gear icon + title ─────────────────────────────────────────────────
        LinearLayout titleRow = new LinearLayout(ctx);
        titleRow.setOrientation(LinearLayout.HORIZONTAL);
        titleRow.setPadding(0, 0, 0, dp16);

        TextView titleView = new TextView(ctx);
        titleView.setText("⚙  Settings");
        titleView.setTextSize(22f);
        titleView.setTextColor(Color.WHITE);
        titleView.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        titleRow.addView(titleView);
        root.addView(titleRow);

        // ── Cyan divider ──────────────────────────────────────────────────────
        root.addView(divider(ctx));

        // ── Max Attraction Points ─────────────────────────────────────────────
        root.addView(sectionLabel(ctx, "Max Number of Attraction Points:"));
        EditText etAttrPts = numberField(ctx, String.valueOf(mRenderer.getMaxAttractionPoints()));
        root.addView(etAttrPts);
        root.addView(divider(ctx));

        // ── Background Color ──────────────────────────────────────────────────
        root.addView(sectionLabel(ctx, "Background Color:"));
        EditText[] bgRGB = rgbRow(ctx, root,
                mRenderer.getBgR(), mRenderer.getBgG(), mRenderer.getBgB());
        root.addView(divider(ctx));

        // ── Particle Color rainbow bar ────────────────────────────────────────
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

        root.addView(subLabel(ctx, "Attraction:"));
        EditText etAttraction = decimalField(ctx,
                String.valueOf((int) mRenderer.getAttraction()));
        root.addView(etAttraction);

        root.addView(subLabel(ctx, "Drag (0 – 0.9999):"));
        EditText etDrag = decimalField(ctx,
                String.format("%.4f", mRenderer.getDrag()));
        root.addView(etDrag);

        root.addView(subLabel(ctx, "Max Speed (pixels/frame):"));
        EditText etMaxSpeed = decimalField(ctx,
                String.format("%.1f", mRenderer.getMaxSpeed()));
        root.addView(etMaxSpeed);

        root.addView(subLabel(ctx, "Particle Count:"));
        EditText etParticles = numberField(ctx,
                String.valueOf(mRenderer.getNumParticles()));
        root.addView(etParticles);

        // Wrap in scroll view
        ScrollView scroll = new ScrollView(ctx);
        scroll.addView(root);

        // ── Dialog ────────────────────────────────────────────────────────────
        new AlertDialog.Builder(this)
            .setView(scroll)
            .setPositiveButton("OK", (dialog, which) -> {
                applySettings(etAttrPts, bgRGB, slowRGB, fastRGB, hueSpinner,
                        etAttraction, etDrag, etMaxSpeed, etParticles);
                resumeGL();
            })
            .setNegativeButton("Cancel", (dialog, which) -> resumeGL())
            .setOnCancelListener(dialog -> resumeGL())
            .show();
    }

    private void applySettings(EditText etAttrPts, EditText[] bgRGB,
                                EditText[] slowRGB, EditText[] fastRGB,
                                Spinner hueSpinner,
                                EditText etAttraction, EditText etDrag,
                                EditText etMaxSpeed, EditText etParticles) {

        int attrPts    = parseIntSafe(etAttrPts, mRenderer.getMaxAttractionPoints());
        int bgR        = parseIntSafe(bgRGB[0],  mRenderer.getBgR());
        int bgG        = parseIntSafe(bgRGB[1],  mRenderer.getBgG());
        int bgB        = parseIntSafe(bgRGB[2],  mRenderer.getBgB());
        int slowR      = parseIntSafe(slowRGB[0], mRenderer.getSlowR());
        int slowG      = parseIntSafe(slowRGB[1], mRenderer.getSlowG());
        int slowB      = parseIntSafe(slowRGB[2], mRenderer.getSlowB());
        int fastR      = parseIntSafe(fastRGB[0], mRenderer.getFastR());
        int fastG      = parseIntSafe(fastRGB[1], mRenderer.getFastG());
        int fastB      = parseIntSafe(fastRGB[2], mRenderer.getFastB());
        boolean ccw    = hueSpinner.getSelectedItemPosition() == 1;
        float attract  = parseFloatSafe(etAttraction, mRenderer.getAttraction());
        float drag     = parseFloatSafe(etDrag, mRenderer.getDrag());
        float maxSpeed = parseFloatSafe(etMaxSpeed, mRenderer.getMaxSpeed());
        int particles  = parseIntSafe(etParticles, mRenderer.getNumParticles());

        // Non-GL-thread-sensitive settings apply immediately
        mRenderer.setMaxAttractionPoints(attrPts);
        mRenderer.setBackgroundColor(bgR, bgG, bgB);
        mRenderer.setSlowColor(slowR, slowG, slowB);
        mRenderer.setFastColor(fastR, fastG, fastB);
        mRenderer.setHueCCW(ccw);
        mRenderer.setAttraction(attract);
        mRenderer.setDrag(drag);
        mRenderer.setMaxSpeed(maxSpeed);

        // Particle count change reinitialises the VBOs — must run on GL thread
        if (particles != mRenderer.getNumParticles()) {
            mGLView.queueEvent(() -> mRenderer.setNumParticles(particles));
        }
    }

    private void resumeGL() {
        mGLView.onResume();
        mSettingsOpen = false;
    }

    // ── UI helpers ────────────────────────────────────────────────────────────

    /** Three RGB EditTexts in a horizontal row, added to parent. Returns the three fields. */
    private EditText[] rgbRow(Context ctx, LinearLayout parent, int r, int g, int b) {
        LinearLayout row = new LinearLayout(ctx);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, dp(4), 0, dp(4));

        EditText etR = rgbField(ctx, "R", r);
        EditText etG = rgbField(ctx, "G", g);
        EditText etB = rgbField(ctx, "B", b);

        row.addView(etR.getParent() != null ? (View) etR : labeledField(ctx, "R:", etR));
        row.addView(labeledField(ctx, "G:", etG));
        row.addView(labeledField(ctx, "B:", etB));
        parent.addView(row);
        return new EditText[]{etR, etG, etB};
    }

    private EditText rgbField(Context ctx, String label, int value) {
        EditText et = new EditText(ctx);
        et.setText(String.valueOf(value));
        et.setInputType(InputType.TYPE_CLASS_NUMBER);
        et.setTextColor(Color.WHITE);
        et.setHint("0-255");
        et.setHintTextColor(0xFF888888);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        lp.setMarginEnd(dp(8));
        et.setLayoutParams(lp);
        return et;
    }

    /** Wrap an EditText with a short label into a horizontal LinearLayout. */
    private LinearLayout labeledField(Context ctx, String labelText, EditText et) {
        LinearLayout ll = new LinearLayout(ctx);
        ll.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        ll.setLayoutParams(lp);

        TextView label = new TextView(ctx);
        label.setText(labelText);
        label.setTextColor(Color.WHITE);
        label.setTextSize(14f);
        label.setPadding(0, 0, dp(4), 0);
        label.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        ll.addView(label);

        et.setLayoutParams(new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        ll.addView(et);
        return ll;
    }

    private EditText numberField(Context ctx, String value) {
        EditText et = new EditText(ctx);
        et.setText(value);
        et.setInputType(InputType.TYPE_CLASS_NUMBER);
        et.setTextColor(Color.WHITE);
        et.setTextSize(18f);
        styleEditText(et);
        return et;
    }

    private EditText decimalField(Context ctx, String value) {
        EditText et = new EditText(ctx);
        et.setText(value);
        et.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        et.setTextColor(Color.WHITE);
        et.setTextSize(18f);
        styleEditText(et);
        return et;
    }

    private void styleEditText(EditText et) {
        et.setBackgroundColor(0xFF0D0D1A);
        et.setPadding(dp(8), dp(8), dp(8), dp(8));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, dp(4), 0, dp(8));
        et.setLayoutParams(lp);
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

    private View divider(Context ctx) {
        View v = new View(ctx);
        v.setBackgroundColor(0xFF00BFFF); // cyan — matches the original
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(1));
        lp.setMargins(0, dp(8), 0, dp(4));
        v.setLayoutParams(lp);
        return v;
    }

    /** Full-width horizontal rainbow gradient bar — shows the hue sweep. */
    private View rainbowBar(Context ctx) {
        View bar = new View(ctx) {
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

    // ── Parsing helpers ───────────────────────────────────────────────────────

    private static int parseIntSafe(EditText et, int fallback) {
        try { return Integer.parseInt(et.getText().toString().trim()); }
        catch (NumberFormatException e) { return fallback; }
    }

    private static float parseFloatSafe(EditText et, float fallback) {
        try { return Float.parseFloat(et.getText().toString().trim()); }
        catch (NumberFormatException e) { return fallback; }
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
