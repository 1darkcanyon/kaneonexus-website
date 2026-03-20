// jni_bridge.cpp — JNI glue between ParticlesRendererVK.java and ParticleFlowVK C++
// NEXUS Engineering — Canyon (Kaneon)

#include <jni.h>
#include <android/native_window_jni.h>
#include "ParticleFlowVK.h"

// Single global renderer; created/destroyed via nativeInit / nativeDestroy.
// All JNI calls happen on the render thread — no locking required.
static ParticleFlowVK* gRenderer = nullptr;

extern "C" {

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeInit(
        JNIEnv* env, jobject /*thiz*/, jobject surface, jint width, jint height) {
    if (gRenderer) { gRenderer->destroy(); delete gRenderer; }
    ANativeWindow* win = ANativeWindow_fromSurface(env, surface);
    gRenderer = new ParticleFlowVK();
    if (!gRenderer->init(win, (int)width, (int)height)) {
        delete gRenderer;
        gRenderer = nullptr;
    }
    // ANativeWindow ref kept alive by the Surface; release our extra ref
    ANativeWindow_release(win);
}

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeDestroy(
        JNIEnv* /*env*/, jobject /*thiz*/) {
    if (gRenderer) {
        gRenderer->destroy();
        delete gRenderer;
        gRenderer = nullptr;
    }
}

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeDrawFrame(
        JNIEnv* /*env*/, jobject /*thiz*/) {
    if (gRenderer) gRenderer->drawFrame();
}

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeResize(
        JNIEnv* /*env*/, jobject /*thiz*/, jint width, jint height) {
    if (gRenderer) gRenderer->resize((int)width, (int)height);
}

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeSetTouch(
        JNIEnv* /*env*/, jobject /*thiz*/, jint idx, jfloat x, jfloat y) {
    // y is already flipped by the Java caller: y = height - screenY
    if (gRenderer) gRenderer->setTouch((int)idx, (float)x, (float)y);
}

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeClearTouch(
        JNIEnv* /*env*/, jobject /*thiz*/, jint idx) {
    if (gRenderer) gRenderer->clearTouch((int)idx);
}

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeSetParams(
        JNIEnv* /*env*/, jobject /*thiz*/,
        jint numParticles, jint numTouch,
        jfloat attract,    jfloat drag,
        jfloat bgR,        jfloat bgG,  jfloat bgB,
        jfloat slowH,      jfloat slowS, jfloat slowV,
        jfloat fastH,      jfloat fastS, jfloat fastV,
        jint hueDir,       jfloat pointSize) {
    if (gRenderer)
        gRenderer->setParams((int)numParticles, (int)numTouch,
                              (float)attract,   (float)drag,
                              (float)bgR,       (float)bgG,  (float)bgB,
                              (float)slowH,     (float)slowS, (float)slowV,
                              (float)fastH,     (float)fastS, (float)fastV,
                              (int)hueDir,      (float)pointSize);
}

JNIEXPORT void JNICALL
Java_com_nfaralli_particleflow_ParticlesRendererVK_nativeResetParticles(
        JNIEnv* /*env*/, jobject /*thiz*/) {
    if (gRenderer) gRenderer->resetParticles();
}

} // extern "C"
