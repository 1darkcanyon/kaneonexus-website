# NEXUS Earth — MeteoEarth Replacement

A from-scratch replacement for the MeteoEarth 3D globe app. WebGL globe (Three.js)
rendered inside an Android WebView — no native OpenGL/Vulkan toolchain required,
so it builds cleanly via GitHub Actions from Termux.

## What's here
- `app/src/main/assets/index.html` — the whole globe app: rotating textured Earth,
  starfield, clouds, atmosphere glow, touch drag-to-rotate + pinch-to-zoom, and
  three live weather overlay layers (temperature, precipitation, cloud cover)
  pulled from Open-Meteo (no API key needed).
- `app/src/main/java/.../MainActivity.kt` — thin WebView wrapper, fullscreen immersive.
- `.github/workflows/build.yml` — CI build producing a debug APK artifact on every push.

## Try it in a browser first (fastest feedback loop)
Before touching Android at all, open `app/src/main/assets/index.html` directly in
Chrome on your phone (or push it somewhere static and load the URL) to confirm the
globe renders and layers work. This is the fastest way to iterate on the visuals.

## Building the APK
1. Push this repo to GitHub (e.g. `1darkcanyon/nexus-earth`).
2. GitHub Actions will build automatically on push to `main`, or trigger manually
   via the "Run workflow" button (workflow_dispatch is enabled).
3. Download the `nexus-earth-debug` artifact — that's your installable APK.
4. This repo has no `gradlew` wrapper committed (avoids needing to download the
   wrapper jar without network access) — CI uses `gradle/actions/setup-gradle`
   instead. If you want a local Termux build too, run `gradle wrapper` once you
   have Gradle installed locally, then commit the generated `gradlew` + wrapper jar.

## Known gaps / next steps
- **Elevation/terrain**: original MeteoEarth had SRTM-based bump mapping; this
  uses a stock topology bump map. Fine for now — real elevation data is a
  phase-2 upgrade if you want it.
- **Offline/bundled Three.js**: currently loads Three.js and Earth textures from
  CDNs at runtime (needs internet on first load; browser caches after that).
  If you want a fully offline-capable app, we should bundle the library and
  textures into `assets/` instead — let me know and I'll set that up.
- **Weather overlay resolution**: currently samples a coarse 12° lat/lon grid
  (~450 points) per layer to keep the Open-Meteo request small and fast. Can be
  tuned finer once you see how it performs on-device.
- **App icon**: placeholder icon generated — swap `ic_launcher.png` in each
  `mipmap-*` folder for real artwork whenever you're ready.
- **Ads/billing**: original had AdColony/Tapjoy/Play Billing. None of that is
  wired up here — add only if/when you want monetization.
