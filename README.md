# 🎉 Falling Animation

A lightweight, customizable falling objects animation library for the web. Create beautiful falling effects like snow, leaves, confetti, and realistic fireworks!

[![npm version](https://img.shields.io/npm/v/falling-animation.svg)](https://www.npmjs.com/package/falling-animation)
[![bundle size](https://img.shields.io/bundlephobia/minzip/falling-animation)](https://bundlephobia.com/package/falling-animation)
[![license](https://img.shields.io/npm/l/falling-animation.svg)](https://github.com/phongdh/falling-animation/blob/main/LICENSE)

## ✨ Features

- 🪶 **Lightweight** - No dependencies, < 15KB gzipped
- 🎨 **Customizable** - Full control over speed, size, animation, and more
- 🎭 **8 Animation Types** - fall, swing, rotate, flutter, spiral, tumble, zigzag, float
- 🎆 **Fireworks** - Realistic rockets shooting up and exploding into colorful particles
- 📱 **Responsive** - Automatically adapts to container size
- 🖼️ **Multiple Object Types** - Emojis, images, or custom HTML
- ⚡ **Performant** - Uses requestAnimationFrame and CSS transforms
- 📦 **TypeScript** - Full type definitions included
- 🌐 **Universal** - Works with ESM, CJS, and UMD

## 📦 Installation

```bash
npm install falling-animation
```

Or use via CDN:

```html
<script src="https://unpkg.com/falling-animation/dist/falling-animation.umd.min.js"></script>
```

## 🚀 Quick Start

### ES Modules

```javascript
import { FallingAnimation } from 'falling-animation';

const falling = new FallingAnimation({
  objects: [
    { type: 'emoji', content: '❄️' },
    { type: 'emoji', content: '🌸' }
  ]
});
```

### CDN / UMD

```html
<script src="https://unpkg.com/falling-animation/dist/falling-animation.umd.min.js"></script>
<script>
  const falling = new FallingAnimation.FallingAnimation({
    objects: [{ type: 'emoji', content: '🍁' }]
  });
</script>
```

## 📖 API Reference

### Constructor Options

```typescript
interface FallingAnimationOptions {
  // Required: Objects to fall
  objects: FallingObject[];
  
  // Container element or selector (default: document.body)
  container?: HTMLElement | string;
  
  // Falling speed in px/frame (default: { min: 2, max: 5 })
  speed?: { min: number; max: number };
  
  // Objects spawned per second (default: 3)
  spawnRate?: number;
  
  // Maximum concurrent particles (default: 50)
  maxParticles?: number;
  
  // Animation type(s) (default: 'fall')
  animation?: AnimationType | AnimationType[];
  
  // Object size in px (default: { min: 20, max: 40 })
  size?: { min: number; max: number };
  
  // Object opacity (default: { min: 0.6, max: 1 })
  opacity?: { min: number; max: number };
  
  // Wind effect from -1 to 1 (default: 0)
  wind?: number;
  
  // Auto start animation (default: true)
  autoStart?: boolean;
  
  // Z-index for container (default: 9999)
  zIndex?: number;
  
  // Enable responsive behavior (default: true)
  responsive?: boolean;
}
```

### Object Types

```typescript
// Emoji
{ type: 'emoji', content: '🍁' }

// Image
{ type: 'image', src: '/path/to/image.png' }

// Custom HTML
{ type: 'html', content: '<div class="custom">★</div>' }

// With weight for random selection
{ type: 'emoji', content: '❄️', weight: 3 }
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
| `float` | Slow floating descent |

### Methods

```javascript
// Control methods
falling.start();    // Start the animation
falling.stop();     // Stop and clear all particles
falling.pause();    // Pause animation (keeps particles)
falling.resume();   // Resume paused animation
falling.destroy();  // Clean up and remove from DOM

// Update options dynamically
falling.setOptions({
  speed: { min: 5, max: 10 },
  spawnRate: 5,
  animation: 'tumble'
});

// Get state
falling.getParticleCount();  // Current particle count
falling.getIsRunning();      // Is animation running?
falling.getIsPaused();       // Is animation paused?
```

## 🎨 Examples

### Snow Effect

```javascript
new FallingAnimation({
  objects: [
    { type: 'emoji', content: '❄️' },
    { type: 'emoji', content: '❅' },
    { type: 'emoji', content: '❆' }
  ],
  animation: 'float',
  speed: { min: 1, max: 3 },
  size: { min: 15, max: 35 }
});
```

### Autumn Leaves

```javascript
new FallingAnimation({
  objects: [
    { type: 'emoji', content: '🍁', weight: 3 },
    { type: 'emoji', content: '🍂', weight: 2 },
    { type: 'emoji', content: '🍃', weight: 1 }
  ],
  animation: 'swing',
  speed: { min: 2, max: 4 },
  wind: 0.3
});
```

### Confetti Party

```javascript
new FallingAnimation({
  objects: [
    { type: 'emoji', content: '🎊' },
    { type: 'emoji', content: '🎉' },
    { type: 'emoji', content: '✨' }
  ],
  animation: ['tumble', 'rotate', 'zigzag'],
  speed: { min: 3, max: 6 },
  spawnRate: 10,
  maxParticles: 100
});
```

### Bounded Container

```javascript
new FallingAnimation({
  container: '#my-container',  // or document.getElementById('my-container')
  objects: [{ type: 'emoji', content: '⭐' }],
  animation: 'spiral',
  zIndex: 100
});
```

### Using Images

```javascript
new FallingAnimation({
  objects: [
    { type: 'image', src: '/images/snowflake.png' },
    { type: 'image', src: '/images/star.png' }
  ],
  size: { min: 30, max: 50 }
});
```

## 🔧 TypeScript

Full TypeScript support with exported types:

```typescript
// For falling effects only
import { FallingAnimation, FallingAnimationOptions } from 'falling-animation';

const falling = new FallingAnimation({
  objects: [{ type: 'emoji', content: '🌟' }],
  animation: 'rotate'
});
```

```typescript
// For fireworks only
import { Fireworks, FireworksOptions } from 'falling-animation';

const fw = new Fireworks({
  launchRate: 2,
  particlesPerExplosion: 60
});
```

```typescript
// Both together
import { FallingAnimation, Fireworks } from 'falling-animation';
```

---

## 🎆 Fireworks

Create realistic firework effects with rockets shooting up and exploding into colorful particles!

### Quick Start

```javascript
import { Fireworks } from 'falling-animation';

const fireworks = new Fireworks();
```

### Fireworks Options

```typescript
interface FireworksOptions {
  // Container element or selector (default: document.body)
  container?: HTMLElement | string;
  
  // Colors for fireworks (default: 10 festive colors)
  colors?: string[];
  
  // Rockets per second (default: 1)
  launchRate?: number;
  
  // Particles per explosion (default: 50)
  particlesPerExplosion?: number;
  
  // Rocket speed range (default: { min: 8, max: 15 })
  rocketSpeed?: { min: number; max: number };
  
  // Explosion particle speed (default: { min: 2, max: 8 })
  explosionSpeed?: { min: number; max: number };
  
  // Particle size in px (default: { min: 2, max: 6 })
  particleSize?: { min: number; max: number };
  
  // Particle lifetime in ms (default: { min: 1000, max: 2000 })
  particleLifetime?: { min: number; max: number };
  
  // Gravity strength (default: 0.1)
  gravity?: number;
  
  // Auto start (default: true)
  autoStart?: boolean;
  
  // Z-index (default: 9999)
  zIndex?: number;
}
```

### Fireworks Methods

```javascript
const fw = new Fireworks();

// Control methods
fw.start();     // Start continuous fireworks
fw.stop();      // Stop launching new rockets
fw.clear();     // Clear all particles
fw.destroy();   // Clean up completely

// Manual launch
fw.launch();    // Launch single firework
fw.burst(5);    // Launch 5 fireworks at once

// Update options dynamically
fw.setOptions({
  launchRate: 2,
  particlesPerExplosion: 80
});

// Get state
fw.getParticleCount();
fw.getIsRunning();
```

### Fireworks Examples

#### Basic Fireworks Show

```javascript
import { Fireworks } from 'falling-animation';

new Fireworks({
  launchRate: 2,
  particlesPerExplosion: 60
});
```

#### Custom Colors

```javascript
new Fireworks({
  colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
  launchRate: 1.5
});
```

#### New Year Celebration

```javascript
const fw = new Fireworks({
  launchRate: 3,
  particlesPerExplosion: 100,
  gravity: 0.15,
  particleLifetime: { min: 1500, max: 2500 }
});

// Launch a burst at midnight!
fw.burst(10);
```

#### Bounded Container

```javascript
new Fireworks({
  container: '#celebration-box',
  launchRate: 0.5,
  particlesPerExplosion: 30,
  zIndex: 100
});
```

---

## 📄 License

MIT © [phongdh](https://github.com/phongdh)

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
