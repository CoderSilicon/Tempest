<p align="center">
  <img src="public/logo.png" alt="Tempest Logo" width="300"/>
</p>

# Tempest: Don't read, but See.

**Tempest** isn't a utility; it's an **immersion**. While standard apps give you numbers, Tempest gives you the world. I've stripped away the flat, sterile "modern" design of the 2020s and replaced it with high-fidelity **skeuomorphic physics**. It is built for those who don't just want to know the temperature—they want to feel the pressure drop.

---

## ⚡ The Blitz-Speed Core

In the weather world, latency is a lie. Tempest operates on a **"Zero-Latency"** architecture. Built with a fine-grained reactive engine and custom GLSL shaders, the app renders complex environmental shifts at a native **120 FPS**.

* **Sub-Second Sync:** Weather data is cached locally and refreshed in the background, so the sky is already painted before the network answers.
* **Granular Reactivity:** Every millibar of pressure and percentage of humidity drives shader uniforms directly — no re-render, no rebuild.
* **Graceful Degradation:** A frame-time guard steps cloud detail and render resolution down before the fans ever spin up.
* **Tactile Physics:** Panels behave like physical cockpit instruments, and the whole interface honours `prefers-reduced-motion`.

---

## 🎭 The Atmospheric Layering System

What makes Tempest unique is how it treats your screen. It's not a background; it's a **simulation**. The entire backdrop is one WebGL sky sphere running a single fragment shader, so the whole atmosphere costs exactly one draw call.

### 🎨 A Real Cloud Deck

Clouds are not a texture, and they are not a video loop. The deck is built the way the sky actually works:

* **Layered sheets.** Three cumulus layers at different altitudes, composited back to front. A single flat sheet is hopeless — every ground-level view of a deck is a near-horizontal slice of it — so the parallax between the layers is what the eye actually reads as volume.
* **Eroded silhouettes.** A Perlin base broken up by inverted Worley cells, then eroded by ridged noise. That erosion is the single biggest difference between "weather" and "airbrushed blob".
* **Sun transmittance.** Each layer marches its own density toward the sun, so cloud cores fall into shadow while the sunward edges stay bright.
* **Ice crystals.** Below freezing, plate and column crystals scatter forward far harder than water droplets. Cold skies glare around the sun and wear 22° and 46° halos; warm ones stay soft.
* **Perspective convergence.** A flat sheet at altitude *h* projects to `dir.xz · h / dir.y`, so the deck converges at the skyline for free, and dissolves into the horizon rather than ending in a hard line.

### 📊 Every Reading Changes the Sky

Nothing in the readout is decorative. Each measurement drives the environment:

| Reading | What it does |
| --- | --- |
| **Cloud cover** | Coverage threshold and cloud *size* — scattered cumulus are many small hard-edged cells, overcast is a few large soft ones |
| **Humidity** | Scattering, condensation bias, and a grey veil that kills saturation |
| **Visibility** | Aerial perspective: distance dissolves into the horizon sky |
| **Pressure** | Cloud base altitude, optical thickness, and how far the mood drops |
| **Wind** | Deck drift, downwind shear, and internal churn |
| **Temperature** | The ice-crystal regime below freezing |

Humidity and visibility alone move measured image saturation from **0.34** in dry desert air to **0.13** in a muggy afternoon, and pressure is what separates a bright overcast from a bruised one.

### 👁️ Eye Adaptation

Daylight and night differ by roughly three orders of magnitude in scene luminance, so no fixed exposure can serve both. Rather than guess, Tempest renders the scene into a tiny half-float target, reads back the average luminance, and damps the correction — it settles in about half a second and reads as an eye adapting rather than a slideshow. Heavy cloud keys the target down as well, so a thunderstorm at noon never renders as bright as a clear day.

---

## 🌩️ Dynamic Luma-Flashes

When the "Blitz" detects a thunderstorm, Tempest doesn't just show a "Rain" icon. The sky triggers **Luma-Flashes** — a fast rise, a double-tap, then a long decay, shaped like a real strike rather than a strobe. The envelope stays above ~3 Hz so photosensitivity is not a concern, and it is skipped entirely if you have asked for reduced motion.

---

## 🌦️ "Don't just check the weather. Step into it."

Tempest is a love letter to the power of the elements. By merging the tactile beauty of skeuomorphism with blazingly fast modern performance, we haven't just built an app—we've built a window.
