# 🎉 Falling Animation

A lightweight, customizable falling objects animation library for the web. Create beautiful falling effects like snow, leaves, confetti, and more!

[![npm version](https://img.shields.io/npm/v/falling-animation.svg)](https://www.npmjs.com/package/falling-animation)
[![bundle size](https://img.shields.io/bundlephobia/minzip/falling-animation)](https://bundlephobia.com/package/falling-animation)
[![license](https://img.shields.io/npm/l/falling-animation.svg)](https://github.com/phongdh/falling-animation/blob/main/LICENSE)

## ✨ Features

- 🪶 **Lightweight** - No dependencies, < 10KB gzipped
- 🎨 **Customizable** - Full control over speed, size, animation, and more
- 🎭 **8 Animation Types** - fall, swing, rotate, flutter, spiral, tumble, zigzag, float
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
import { 
  FallingAnimation,
  FallingAnimationOptions,
  FallingObject,
  AnimationType 
} from 'falling-animation';

const options: FallingAnimationOptions = {
  objects: [{ type: 'emoji', content: '🌟' }],
  animation: 'rotate' as AnimationType
};

const falling = new FallingAnimation(options);
```

## 📄 License

MIT © [phongdh](https://github.com/phongdh)

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
