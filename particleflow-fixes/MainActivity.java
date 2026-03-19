package com.nfaralli.particleflow;

import android.app.Activity;
import android.opengl.GLSurfaceView;
import android.os.Bundle;
import android.view.MotionEvent;

public class MainActivity extends Activity {

    private GLSurfaceView mGLView;
    private ParticlesRendererGL mRenderer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mGLView = new GLSurfaceView(this);
        // Request OpenGL ES 3.0 context (required for Transform Feedback)
        mGLView.setEGLContextClientVersion(3);

        mRenderer = new ParticlesRendererGL();
        mGLView.setRenderer(mRenderer);
        mGLView.setRenderMode(GLSurfaceView.RENDERMODE_CONTINUOUSLY);
        setContentView(mGLView);

        mGLView.setOnTouchListener((v, event) -> {
            int action = event.getActionMasked();
            int idx    = event.getActionIndex();
            int id     = event.getPointerId(idx);

            switch (action) {
                case MotionEvent.ACTION_DOWN:
                case MotionEvent.ACTION_POINTER_DOWN:
                    if (id < ParticlesRendererGL.MAX_TOUCHES) {
                        mRenderer.setTouch(id, event.getX(idx), event.getY(idx));
                    }
                    break;

                case MotionEvent.ACTION_MOVE:
                    // Update all currently active pointers
                    for (int i = 0; i < event.getPointerCount(); i++) {
                        int pid = event.getPointerId(i);
                        if (pid < ParticlesRendererGL.MAX_TOUCHES) {
                            mRenderer.setTouch(pid, event.getX(i), event.getY(i));
                        }
                    }
                    break;

                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_POINTER_UP:
                    if (id < ParticlesRendererGL.MAX_TOUCHES) {
                        mRenderer.clearTouch(id);
                    }
                    break;

                case MotionEvent.ACTION_CANCEL:
                    for (int i = 0; i < ParticlesRendererGL.MAX_TOUCHES; i++) {
                        mRenderer.clearTouch(i);
                    }
                    break;
            }
            return true;
        });
    }

    @Override protected void onPause()  { super.onPause();  mGLView.onPause();  }
    @Override protected void onResume() { super.onResume(); mGLView.onResume(); }
}
