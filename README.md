# 🎉 falling-animation

A lightweight, customizable falling objects animation library for the web. Create beautiful falling effects like snow, leaves, confetti, and realistic fireworks — with **zero dependencies** and a Canvas-based renderer that doesn't touch your DOM.

[![npm version](https://img.shields.io/npm/v/falling-animation.svg)](https://www.npmjs.com/package/falling-animation)
[![bundle size](https://img.shields.io/bundlephobia/minzip/falling-animation)](https://bundlephobia.com/package/falling-animation)
[![license](https://img.shields.io/npm/l/falling-animation.svg)](https://github.com/phong-baruby/falling-package/blob/main/LICENSE)

## ✨ Features

- 🪶 **Lightweight** — Zero dependencies, ~21KB minified UMD
- 🎨 **Customizable** — Full control over speed, size, animation, wind, and more
- 🎭 **8 Animation Types** — fall, swing, rotate, flutter, spiral, tumble, zigzag, float
- 🎆 **Fireworks** — Rockets + 10 explosion patterns (heart, star, willow, waterfall…)
- 📱 **Responsive** — Automatically adapts to container size changes
- 🖼️ **Multiple Object Types** — Emojis and images
- ⚡ **Performant** — Canvas-based rendering with `requestAnimationFrame`; auto-pauses when tab is hidden
- 📦 **TypeScript** — Full type definitions included
- 🌐 **Universal** — Works with ESM, CJS, and UMD (Vanilla / React / Next.js / Vue / Nuxt)

---

## 📦 Installation

```bash
npm install falling-animation
# or
yarn add falling-animation
# or
pnpm add falling-animation
```

### CDN (no build step)

```html
<script src="https://unpkg.com/falling-animation/dist/falling-animation.umd.min.js"></script>
```

---

## ⚠️ SSR Notice

This library **requires a browser environment** (it uses `window`, `document`, and `<canvas>`). It will throw if instantiated during server-side rendering.

- **Next.js / Nuxt** — always initialize inside `useEffect` / `onMounted`, or use dynamic import with `ssr: false`
- **Vite SSR / Astro / Remix** — guard with `typeof window !== 'undefined'`

See [Framework Examples](#-framework-examples) below for copy-paste patterns.

---

## 🚀 Quick Start

### Vanilla JS / ES Modules

```javascript
import { FallingAnimation } from 'falling-animation';

const falling = new FallingAnimation({
  objects: [
    { type: 'emoji', content: '❄️' },
    { type: 'emoji', content: '🌸' }
  ]
});

// Clean up when done
// falling.destroy();
```

### CDN / UMD

```html
<script src="https://unpkg.com/falling-animation/dist/falling-animation.umd.min.js"></script>
<script>
  const { FallingAnimation, Fireworks } = FallingAnimationLib;

  new FallingAnimation({
    objects: [{ type: 'emoji', content: '🍁' }]
  });
</script>
```

---

## 🎨 Framework Examples

### React

```tsx
import { useEffect, useRef } from 'react';
import { FallingAnimation } from 'falling-animation';

export default function FallingEffect() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const falling = new FallingAnimation({
      container: ref.current,
      objects: [{ type: 'emoji', content: '🌟' }],
      animation: 'float',
      maxParticles: 30,
    });

    return () => falling.destroy();
  }, []);

  return <div ref={ref} style={{ position: 'relative', height: 300 }} />;
}
```

### React — full-page overlay (fixed position)

```tsx
import { useEffect } from 'react';
import { FallingAnimation } from 'falling-animation';

export default function PageSnow() {
  useEffect(() => {
    const falling = new FallingAnimation({
      // omit container → defaults to document.body, canvas is fixed-position
      objects: [{ type: 'emoji', content: '❄️' }],
      animation: 'float',
      zIndex: 9999,
    });
    return () => falling.destroy();
  }, []);

  return null; // renders nothing itself
}
```

### Next.js App Router (`'use client'`)

```tsx
'use client';

import { useEffect, useRef } from 'react';

export default function FallingEffect() {
  const instanceRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    // Dynamic import keeps the library out of the server bundle
    import('falling-animation').then(({ FallingAnimation }) => {
      instanceRef.current = new FallingAnimation({
        objects: [
          { type: 'emoji', content: '✨', weight: 3 },
          { type: 'emoji', content: '⭐', weight: 1 },
        ],
        animation: ['float', 'swing'],
        speed: { min: 0.5, max: 1.5 },
        maxParticles: 25,
        opacity: { min: 0.3, max: 0.7 },
        zIndex: 5,
      });
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  return null;
}
```

> **Tip:** Add `transpilePackages: ['falling-animation']` to `next.config.ts` if you get a
> `"Can't resolve 'falling-animation'"` error with Turbopack.
>
> ```ts
> // next.config.ts
> const nextConfig: NextConfig = {
>   transpilePackages: ['falling-animation'],
> };
> ```

### Next.js Pages Router

```tsx
import dynamic from 'next/dynamic';

// Import as client-only — never runs on the server
const FallingEffect = dynamic(() => import('@/components/FallingEffect'), { ssr: false });

export default function HomePage() {
  return (
    <>
      <FallingEffect />
      {/* rest of page */}
    </>
  );
}
```

### Vue 3

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import type { FallingAnimation as FallingAnimationType } from 'falling-animation';

const containerRef = ref<HTMLDivElement | null>(null);
let instance: FallingAnimationType | null = null;

onMounted(async () => {
  const { FallingAnimation } = await import('falling-animation');
  if (!containerRef.value) return;

  instance = new FallingAnimation({
    container: containerRef.value,
    objects: [{ type: 'emoji', content: '🍁' }],
    animation: 'swing',
    wind: 0.2,
  });
});

onUnmounted(() => {
  instance?.destroy();
  instance = null;
});
</script>

<template>
  <div ref="containerRef" style="position: relative; height: 300px" />
</template>
```

### Nuxt 3

```vue
<script setup lang="ts">
// plugins/falling-animation.client.ts — suffix .client ensures server-skip
import { FallingAnimation } from 'falling-animation';

const el = ref<HTMLDivElement | null>(null);
let instance: FallingAnimation | null = null;

onMounted(() => {
  if (!el.value) return;
  instance = new FallingAnimation({
    container: el.value,
    objects: [{ type: 'emoji', content: '🎉' }],
  });
});

onUnmounted(() => instance?.destroy());
</script>

<template>
  <div ref="el" style="position: relative; min-height: 200px" />
</template>
```

### Vanilla HTML

```html
<!DOCTYPE html>
<html>
<body>
  <script type="module">
    import { FallingAnimation, Fireworks } from 'https://unpkg.com/falling-animation/dist/falling-animation.esm.js';

    new FallingAnimation({
      objects: [{ type: 'emoji', content: '❄️' }],
      animation: 'float'
    });
  </script>
</body>
</html>
```

---

## 📖 API Reference

### `FallingAnimation` Options

```typescript
interface FallingAnimationOptions {
  /** Required: objects to fall */
  objects: FallingObject[];

  /** Container element or CSS selector (default: document.body → fixed canvas) */
  container?: HTMLElement | string;

  /** Falling speed — intuitive units, not px/frame (default: { min: 2, max: 5 }) */
  speed?: { min: number; max: number };

  /** Objects spawned per second (default: 3) */
  spawnRate?: number;

  /** Max concurrent particles (default: 50) */
  maxParticles?: number;

  /** Animation type(s) (default: 'fall') */
  animation?: AnimationType | AnimationType[];

  /** Object size in px (default: { min: 20, max: 40 }) */
  size?: { min: number; max: number };

  /** Opacity range 0–1 (default: { min: 0.6, max: 1 }) */
  opacity?: { min: number; max: number };

  /** Wind drift -1 to 1 (default: 0) */
  wind?: number;

  /** Auto-start on construction (default: true) */
  autoStart?: boolean;

  /** Canvas z-index (default: 9999) */
  zIndex?: number;

  /** Auto-resize canvas on window resize (default: true) */
  responsive?: boolean;
}
```

### Object Types

```typescript
// Emoji
{ type: 'emoji', content: '🍁' }

// Remote or local image
{ type: 'image', src: '/images/snowflake.png' }

// Weighted random selection (higher = more frequent)
{ type: 'emoji', content: '❄️', weight: 3 }
{ type: 'emoji', content: '🌸', weight: 1 }
```

### Animation Types

| Type | Description |
|------|-------------|
| `fall` | Simple vertical fall |
| `swing` | Pendulum-like swinging |
| `rotate` | Continuous 360° rotation |
| `flutter` | Butterfly-like fluttering |
| `spiral` | Spiraling down pattern |
| `tumble` | Chaotic tumbling motion |
| `zigzag` | Zigzag falling pattern |
| `float` | Slow, gentle floating descent |

Pass a single string or an array — each particle picks randomly from the array:

```javascript
animation: ['swing', 'flutter', 'float']
```

### `FallingAnimation` Methods

```javascript
falling.start();          // Start animation
falling.stop();           // Stop and clear all particles
falling.pause();          // Pause (particles stay in place)
falling.resume();         // Resume from pause
falling.destroy();        // Remove canvas, clean up all listeners

falling.setOptions({ speed: { min: 5, max: 10 }, wind: 0.5 });

falling.getParticleCount(); // → number
falling.getIsRunning();     // → boolean
falling.getIsPaused();      // → boolean
```

---

### `Fireworks` Options

```typescript
interface FireworksOptions {
  /** Container element or CSS selector (default: document.body) */
  container?: HTMLElement | string;

  /** Particle colors (default: 10 festive colors) */
  colors?: string[];

  /** Rockets launched per second (default: 0.5) */
  launchRate?: number;

  /** Particles per explosion (default: 50) */
  particlesPerExplosion?: number;

  /** Max concurrent particles — prevents frame drops (default: 500) */
  maxParticles?: number;

  /** Rocket speed (default: { min: 7, max: 12 }) */
  rocketSpeed?: { min: number; max: number };

  /** Explosion spread speed (default: { min: 1, max: 6 }) */
  explosionSpeed?: { min: number; max: number };

  /** Particle size in px (default: { min: 2, max: 6 }) */
  particleSize?: { min: number; max: number };

  /** Particle lifetime in ms (default: { min: 1000, max: 2000 }) */
  particleLifetime?: { min: number; max: number };

  /** Gravity pull (default: 0.1) */
  gravity?: number;

  /** Trail/fade effect between frames (default: true) */
  trail?: boolean;

  /** Explosion pattern — single or array for random mix (default: 'circular') */
  explosionPattern?: ExplosionPattern | ExplosionPattern[];

  /** Auto-start on construction (default: true) */
  autoStart?: boolean;

  /** Canvas z-index (default: 9999) */
  zIndex?: number;
}
```

### Explosion Patterns

| Pattern | Description |
|---------|-------------|
| `circular` | Standard even circular burst |
| `ring` | Thin ring / donut shape |
| `heart` | ❤️ Heart shape |
| `star` | ⭐ 5-point star beams |
| `willow` | 🌳 Heavy-gravity trailing willow |
| `palm` | 🌴 Upward-biased palm tree |
| `chrysanthemum` | 🌼 Dense multi-layer spherical burst |
| `embers` | 🔥 Tiny slow-drifting micro-particles |
| `double` | 💥 2-stage explosion (particles explode again!) |
| `waterfall` | 💧 Gentle rise then heavy rain fall |
| `random` | Picks a random pattern for each explosion |

Pass an array to mix patterns:

```javascript
explosionPattern: ['double', 'heart', 'star']
```

### `Fireworks` Methods

```javascript
fw.start();       // Start continuous launch loop
fw.stop();        // Stop launching (clears pending bursts)
fw.clear();       // Remove all active particles
fw.destroy();     // Full cleanup, removes canvas

fw.launch();      // Launch one rocket manually
fw.burst(5);      // Launch 5 rockets staggered ~100ms apart

fw.setOptions({ launchRate: 2, explosionPattern: 'heart' });

fw.getParticleCount(); // → number
fw.getIsRunning();     // → boolean
```

---

## 🎨 Presets

### Snow

```javascript
new FallingAnimation({
  objects: [
    { type: 'emoji', content: '❄️', weight: 3 },
    { type: 'emoji', content: '❅',  weight: 2 },
    { type: 'emoji', content: '❆',  weight: 1 },
  ],
  animation: 'float',
  speed: { min: 0.5, max: 2 },
  size: { min: 15, max: 35 },
  wind: 0.05,
});
```

### Autumn Leaves

```javascript
new FallingAnimation({
  objects: [
    { type: 'emoji', content: '🍁', weight: 3 },
    { type: 'emoji', content: '🍂', weight: 2 },
    { type: 'emoji', content: '🍃', weight: 1 },
  ],
  animation: 'swing',
  speed: { min: 2, max: 4 },
  wind: 0.3,
});
```

### Confetti Party

```javascript
new FallingAnimation({
  objects: [
    { type: 'emoji', content: '🎊' },
    { type: 'emoji', content: '🎉' },
    { type: 'emoji', content: '✨' },
  ],
  animation: ['tumble', 'rotate', 'zigzag'],
  speed: { min: 3, max: 6 },
  spawnRate: 10,
  maxParticles: 100,
});
```

### Using Images

```javascript
new FallingAnimation({
  objects: [
    { type: 'image', src: '/images/snowflake.png' },
    { type: 'image', src: '/images/star.png' },
  ],
  size: { min: 30, max: 50 },
});
```

### Bounded Container

```javascript
new FallingAnimation({
  container: '#hero-section', // or document.getElementById('hero')
  objects: [{ type: 'emoji', content: '⭐' }],
  animation: 'spiral',
  zIndex: 100,
});
```

### Grand Finale Fireworks

```javascript
new Fireworks({
  launchRate: 2,
  particlesPerExplosion: 60,
  explosionPattern: ['double', 'random'],
  rocketSpeed: { min: 12, max: 18 },
  explosionSpeed: { min: 3, max: 9 },
});
```

### Romantic Hearts

```javascript
new Fireworks({
  launchRate: 1,
  particlesPerExplosion: 40,
  explosionPattern: 'heart',
  colors: ['#ff0000', '#ff69b4', '#ffffff'],
  gravity: 0.05,
});
```

### Manual Trigger (button click)

```javascript
const fw = new Fireworks({ autoStart: false });

document.querySelector('#celebrate').addEventListener('click', () => {
  fw.burst(5);
});
```

---

## 📄 License

MIT © [phongdh](https://github.com/phong-baruby/falling-package)

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
