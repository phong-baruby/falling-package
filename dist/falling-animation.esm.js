/**
 * Utility functions for falling-animation
 */
/**
 * Generate a random number between min and max
 */
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Generate a random number from a RangeValue
 */
function randomFromRange(range) {
    return randomRange(range.min, range.max);
}
/**
 * Pick a random item from an array
 */
function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
}
/**
 * Pick a random item based on weights
 */
function weightedRandomPick(items) {
    var _a;
    const totalWeight = items.reduce((sum, item) => { var _a; return sum + ((_a = item.weight) !== null && _a !== void 0 ? _a : 1); }, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
        random -= (_a = item.weight) !== null && _a !== void 0 ? _a : 1;
        if (random <= 0) {
            return item;
        }
    }
    return items[items.length - 1];
}
/**
 * Generate a unique ID
 */
let idCounter = 0;
function generateId() {
    return ++idCounter;
}
/**
 * Check if code is running in browser environment
 */
function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}
/**
 * Resolve container from element or selector
 * Throws an error if called in non-browser environment
 */
function resolveContainer(container) {
    if (!isBrowser()) {
        throw new Error('[falling-animation] This library requires a browser environment. ' +
            'If using SSR (Next.js, Nuxt, etc.), make sure to only initialize on the client side.');
    }
    if (!container) {
        return document.body;
    }
    if (typeof container === 'string') {
        const element = document.querySelector(container);
        if (!element) {
            console.warn(`[falling-animation] Container "${container}" not found, using document.body`);
            return document.body;
        }
        return element;
    }
    return container;
}
/**
 * Throttle function calls
 */
function throttle(func, limit) {
    let inThrottle = false;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Animation functions for falling particles
 * Each animation modifies particle state based on deltaTime and elapsed time
 */
/**
 * Simple vertical fall - no special effects
 */
const fall = (particle, deltaTime) => {
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    particle.y += particle.vy * deltaTime;
    particle.x += particle.vx * deltaTime;
};
/**
 * Swing - pendulum-like swinging motion while falling
 */
const swing = (particle, deltaTime, elapsed) => {
    const swingAmplitude = 30; // pixels
    const swingFrequency = 0.002; // oscillations per ms
    // Slight rotation based on swing - always animate
    particle.rotation = Math.sin((elapsed + particle.phase) * swingFrequency) * 20;
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    particle.y += particle.vy * deltaTime;
    // Calculate swing offset
    const swingOffset = Math.sin((elapsed + particle.phase) * swingFrequency) * swingAmplitude;
    particle.x += particle.vx * deltaTime + (swingOffset * 0.05);
};
/**
 * Rotate - continuous 360° rotation while falling
 */
const rotate = (particle, deltaTime) => {
    // Continuous rotation - always animate
    particle.rotation += particle.rotationSpeed * deltaTime;
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    particle.y += particle.vy * deltaTime;
    particle.x += particle.vx * deltaTime;
};
/**
 * Flutter - butterfly-like fluttering motion
 */
const flutter = (particle, deltaTime, elapsed) => {
    const flutterFrequency = 0.005;
    // Tilt based on direction - always animate
    particle.rotation = Math.sin((elapsed + particle.phase) * flutterFrequency) * 30;
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    const flutterAmplitude = 40;
    const verticalWobble = 0.3;
    // Horizontal flutter
    const flutter = Math.sin((elapsed + particle.phase) * flutterFrequency) * flutterAmplitude;
    particle.x += particle.vx * deltaTime + flutter * 0.03;
    // Vertical movement with slight wobble
    const wobble = Math.sin((elapsed + particle.phase) * flutterFrequency * 2) * verticalWobble;
    particle.y += (particle.vy + wobble) * deltaTime;
};
/**
 * Spiral - spiraling down pattern
 */
const spiral = (particle, deltaTime, elapsed) => {
    const spiralSpeed = 0.003;
    const angle = (elapsed + particle.phase) * spiralSpeed;
    // Rotate with spiral - always animate
    particle.rotation = angle * (180 / Math.PI);
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    const spiralRadius = 25;
    particle.y += particle.vy * deltaTime;
    // Spiral motion
    particle.x += particle.vx * deltaTime + Math.cos(angle) * spiralRadius * 0.02;
};
/**
 * Tumble - chaotic tumbling motion
 */
const tumble = (particle, deltaTime, elapsed) => {
    var _a, _b, _c;
    const tumbleSpeed = (_a = particle.data.tumbleSpeed) !== null && _a !== void 0 ? _a : 5;
    // Fast tumbling rotation - always animate
    particle.rotation += tumbleSpeed * deltaTime;
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    const wobbleX = (_b = particle.data.wobbleX) !== null && _b !== void 0 ? _b : 0.02;
    const wobbleY = (_c = particle.data.wobbleY) !== null && _c !== void 0 ? _c : 0.01;
    particle.y += particle.vy * deltaTime;
    // Chaotic horizontal movement
    particle.x += particle.vx * deltaTime +
        Math.sin((elapsed + particle.phase) * wobbleX) * 20 * 0.02;
    // Add some vertical variation
    particle.y += Math.sin((elapsed + particle.phase * 1.5) * wobbleY) * 0.5;
};
/**
 * Zigzag - zigzag falling pattern
 */
const zigzag = (particle, deltaTime, elapsed) => {
    const zigzagFrequency = 0.002;
    const period = 1 / zigzagFrequency;
    const t = ((elapsed + particle.phase) % period) / period;
    const triangleWave = Math.abs(t * 2 - 1) * 2 - 1;
    // Tilt in direction of movement - always animate
    particle.rotation = triangleWave * 25;
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    const zigzagWidth = 50;
    particle.y += particle.vy * deltaTime;
    // Create zigzag using triangle wave
    particle.x += particle.vx * deltaTime + triangleWave * zigzagWidth * 0.02;
};
/**
 * Float - slow floating descent with gentle movement
 */
const float = (particle, deltaTime, elapsed) => {
    const floatFrequency = 0.001;
    // Gentle rotation - always animate
    particle.rotation = Math.sin((elapsed + particle.phase) * floatFrequency) * 10;
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0)
        return;
    const floatAmplitudeX = 20;
    const floatAmplitudeY = 5;
    // Very slow descent with vertical wobble
    const yWobble = Math.sin((elapsed + particle.phase) * floatFrequency * 2) * floatAmplitudeY;
    particle.y += (particle.vy * 0.5 + yWobble * 0.01) * deltaTime;
    // Gentle horizontal drift
    const xDrift = Math.sin((elapsed + particle.phase) * floatFrequency) * floatAmplitudeX;
    particle.x += particle.vx * deltaTime + xDrift * 0.01;
};
/**
 * Animation registry - all available animations
 */
const animations = {
    fall,
    swing,
    rotate,
    flutter,
    spiral,
    tumble,
    zigzag,
    float
};
/**
 * Get animation function by name
 */
function getAnimation(name) {
    var _a;
    return (_a = animations[name]) !== null && _a !== void 0 ? _a : fall;
}

/**
 * Particle class - manages individual falling objects (Canvas-based, no DOM)
 */
/**
 * Speed multiplier to convert user-friendly speed units to px/ms
 * speed = 1 means ~40 pixels per second (~1cm/s at 96 DPI)
 * speed = 0.1 means ~4 pixels per second (~1mm/s)
 * speed = 0 means standing still
 */
const SPEED_MULTIPLIER = 0.04; // 40 px/s per unit, divided by 1000 for ms
class Particle {
    constructor(options, containerWidth, containerHeight) {
        this.id = generateId();
        this.age = 0;
        this.phase = Math.random() * Math.PI * 2;
        this.data = {};
        // Store container dimensions
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        // Pick random object
        const object = weightedRandomPick(options.objects);
        // Store content and type for rendering
        this.content = object.src || object.content || '❄️';
        this.objectType = object.type;
        // Initialize position at top with random x
        this.x = randomRange(-50, this.containerWidth + 50);
        this.y = -50;
        // Initialize velocity (apply speed multiplier for intuitive units)
        this.vy = randomFromRange(options.speed) * SPEED_MULTIPLIER;
        this.vx = options.wind * SPEED_MULTIPLIER * randomRange(0.5, 1.5);
        // Initialize size and opacity
        this.size = randomFromRange(options.size);
        this.opacity = randomFromRange(options.opacity);
        // Initialize rotation
        this.rotation = randomRange(0, 360);
        this.rotationSpeed = randomRange(-3, 3);
        // Pick animation and cache the function to avoid per-frame lookup
        this.animation = randomPick(options.animation);
        this.animationFn = getAnimation(this.animation);
        // Initialize animation-specific data
        this.initAnimationData();
    }
    /**
     * Initialize animation-specific data
     */
    initAnimationData() {
        if (this.animation === 'tumble') {
            this.data.tumbleSpeed = randomRange(3, 8);
            this.data.wobbleX = randomRange(0.01, 0.03);
            this.data.wobbleY = randomRange(0.005, 0.015);
        }
    }
    /**
     * Update particle state
     */
    update(deltaTime, elapsed) {
        this.age += deltaTime;
        this.animationFn(this, deltaTime, elapsed);
    }
    /**
     * Check if particle is out of bounds
     */
    isOutOfBounds() {
        return (this.y > this.containerHeight + 100 ||
            this.x < -100 ||
            this.x > this.containerWidth + 100);
    }
    /**
     * Update container dimensions (for resize handling)
     */
    updateContainerSize(width, height) {
        this.containerWidth = width;
        this.containerHeight = height;
    }
}

/**
 * CanvasRenderer - Handles canvas-based rendering for particle effects
 * Provides high-performance drawing of emojis and images
 */
const SPRITE_CACHE_MAX = 100;
class CanvasRenderer {
    constructor(container, zIndex = 9999) {
        this.spriteCache = new Map();
        this.imageCache = new Map();
        this.width = 0;
        this.height = 0;
        if (!isBrowser()) {
            throw new Error('[falling-animation] CanvasRenderer requires a browser environment.');
        }
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'falling-animation-canvas';
        // Get 2D context
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('[falling-animation] Could not get 2D context from canvas.');
        }
        this.ctx = ctx;
        // Set canvas styles
        const isBody = container === document.body;
        Object.assign(this.canvas.style, {
            position: isBody ? 'fixed' : 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: String(zIndex)
        });
        // Ensure container has position for absolute canvas
        if (!isBody) {
            const containerPosition = getComputedStyle(container).position;
            if (containerPosition === 'static') {
                container.style.position = 'relative';
            }
        }
        // Append to container
        container.appendChild(this.canvas);
        // Set initial size
        this.resize();
    }
    /**
     * Resize canvas to match container
     */
    resize() {
        var _a;
        const isFixed = this.canvas.style.position === 'fixed';
        const rect = isFixed
            ? { width: window.innerWidth, height: window.innerHeight }
            : (_a = this.canvas.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (rect) {
            const dpr = window.devicePixelRatio || 1;
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            // Reset transform before scaling to prevent accumulation on repeated resizes
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(dpr, dpr);
        }
    }
    /**
     * Get container dimensions
     */
    getSize() {
        return { width: this.width, height: this.height };
    }
    /**
     * Clear the entire canvas.
     * @param trail If true, fades out existing content instead of hard clear
     */
    clear(trail = false) {
        if (trail) {
            // "Trail trick": fill with semi-transparent black to create trails
            // Adjust opacity for longer/shorter trails (current: very long trails)
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        else {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
    /**
     * Pre-cache an emoji as a sprite for fast drawing (HiDPI aware)
     */
    cacheEmoji(content, size) {
        const dpr = window.devicePixelRatio || 1;
        const key = `emoji:${content}:${size}:${dpr}`;
        if (this.spriteCache.has(key)) {
            return this.spriteCache.get(key);
        }
        // Create off-screen canvas for the emoji at HiDPI resolution
        const spriteCanvas = document.createElement('canvas');
        const padding = size * 0.3; // Padding for effects and emoji overflow
        const logicalSize = size + padding * 2;
        const physicalSize = logicalSize * dpr;
        spriteCanvas.width = physicalSize;
        spriteCanvas.height = physicalSize;
        const spriteCtx = spriteCanvas.getContext('2d');
        // Scale for HiDPI
        spriteCtx.scale(dpr, dpr);
        // High quality rendering
        spriteCtx.imageSmoothingEnabled = true;
        spriteCtx.imageSmoothingQuality = 'high';
        // Draw emoji with proper font settings
        const fontSize = size * 1.0; // Emoji font size
        spriteCtx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", "EmojiOne", sans-serif`;
        spriteCtx.textAlign = 'center';
        spriteCtx.textBaseline = 'middle';
        spriteCtx.fillText(content, logicalSize / 2, logicalSize / 2);
        const sprite = {
            canvas: spriteCanvas,
            width: logicalSize,
            height: logicalSize
        };
        // Evict oldest entry if cache is full
        if (this.spriteCache.size >= SPRITE_CACHE_MAX) {
            const firstKey = this.spriteCache.keys().next().value;
            if (firstKey !== undefined)
                this.spriteCache.delete(firstKey);
        }
        this.spriteCache.set(key, sprite);
        return sprite;
    }
    /**
     * Pre-load an image
     */
    preloadImage(src) {
        if (this.imageCache.has(src)) {
            return Promise.resolve(this.imageCache.get(src));
        }
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }
    /**
     * Draw a single particle (emoji or image)
     */
    drawParticle(particle) {
        const { x, y, rotation, size, opacity, content, type } = particle;
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(x, y);
        this.ctx.rotate((rotation * Math.PI) / 180);
        if (type === 'emoji') {
            const sprite = this.cacheEmoji(content, Math.round(size));
            this.ctx.drawImage(sprite.canvas, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
        }
        else if (type === 'image') {
            const img = this.imageCache.get(content);
            if (img) {
                this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
            }
        }
        this.ctx.restore();
    }
    /**
     * Draw multiple particles efficiently
     */
    drawParticles(particles) {
        for (const particle of particles) {
            this.drawParticle(particle);
        }
    }
    /**
     * Draw a firework particle (glowing circle)
     */
    drawFireworkParticle(particle) {
        const { x, y, size, opacity, color } = particle;
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        // Draw glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = size * 2;
        // Draw particle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    /**
     * Draw multiple firework particles
     */
    drawFireworkParticles(particles) {
        for (const particle of particles) {
            this.drawFireworkParticle(particle);
        }
    }
    /**
     * Destroy the renderer and remove canvas from DOM
     */
    destroy() {
        this.canvas.remove();
        this.spriteCache.clear();
        this.imageCache.clear();
    }
}

/**
 * FallingAnimation - Main class for creating falling object animations (Canvas-based)
 */
/** Default configuration values */
const DEFAULTS$1 = {
    speed: { min: 2, max: 5 },
    spawnRate: 3,
    maxParticles: 50,
    animation: ['fall'],
    size: { min: 20, max: 40 },
    opacity: { min: 0.6, max: 1 },
    wind: 0,
    autoStart: true,
    zIndex: 9999,
    responsive: true
};
class FallingAnimation {
    constructor(options) {
        this.particles = [];
        this.renderer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        this.lastSpawnTime = 0;
        this.startTime = 0;
        this.lastFrameTime = 0;
        this.resizeHandler = null;
        this.visibilityHandler = null;
        this.imagesReady = false;
        /**
         * Main animation loop
         */
        this.animate = (currentTime) => {
            if (!this.isRunning || !this.renderer)
                return;
            // Calculate delta time
            if (this.lastFrameTime === 0) {
                this.lastFrameTime = currentTime;
                this.startTime = currentTime;
            }
            const deltaTime = Math.min(currentTime - this.lastFrameTime, 50); // Cap at 50ms
            const elapsed = currentTime - this.startTime;
            this.lastFrameTime = currentTime;
            // Spawn new particles based on rate
            const spawnInterval = 1000 / this.options.spawnRate;
            if (currentTime - this.lastSpawnTime >= spawnInterval) {
                this.spawnParticle();
                this.lastSpawnTime = currentTime;
            }
            // Update particles and collect out-of-bounds in one pass
            let hasRemoved = false;
            for (const particle of this.particles) {
                particle.update(deltaTime, elapsed);
                if (particle.isOutOfBounds())
                    hasRemoved = true;
            }
            // Remove out-of-bounds particles in a single filter pass (O(n))
            if (hasRemoved) {
                this.particles = this.particles.filter(p => !p.isOutOfBounds());
            }
            // Clear and render all particles — reuse inline to avoid per-frame allocation
            this.renderer.clear();
            const renderData = this.particles.map(p => ({
                x: p.x,
                y: p.y,
                rotation: p.rotation,
                size: p.size,
                opacity: p.opacity,
                content: p.content,
                type: p.objectType === 'image' ? 'image' : 'emoji'
            }));
            this.renderer.drawParticles(renderData);
            // Continue animation loop
            this.animationId = requestAnimationFrame(this.animate);
        };
        // Validate required options
        if (!options.objects || options.objects.length === 0) {
            throw new Error('[falling-animation] "objects" option is required and must not be empty');
        }
        // Resolve options with defaults
        this.options = this.resolveOptions(options);
        // Create canvas renderer
        this.renderer = new CanvasRenderer(this.options.container, this.options.zIndex);
        // Preload images; mark ready when done (non-image configs are immediately ready)
        const hasImages = this.options.objects.some(o => o.type === 'image');
        if (hasImages) {
            this.preloadImages().then(() => { this.imagesReady = true; });
        }
        else {
            this.imagesReady = true;
        }
        // Setup resize handler if responsive
        if (this.options.responsive) {
            this.setupResizeHandler();
        }
        // Pause when tab is hidden to save CPU/GPU
        this.visibilityHandler = () => {
            if (document.hidden) {
                if (this.isRunning)
                    this.pause();
            }
            else {
                if (this.isPaused)
                    this.resume();
            }
        };
        document.addEventListener('visibilitychange', this.visibilityHandler);
        // Auto start if enabled
        if (this.options.autoStart) {
            this.start();
        }
    }
    /**
     * Preload any image objects
     */
    async preloadImages() {
        if (!this.renderer)
            return;
        for (const obj of this.options.objects) {
            if (obj.type === 'image') {
                const src = obj.src || obj.content;
                if (src) {
                    try {
                        await this.renderer.preloadImage(src);
                    }
                    catch (e) {
                        console.warn(`[falling-animation] Failed to preload image: ${src}`);
                    }
                }
            }
        }
    }
    /**
     * Merge user options with defaults
     */
    resolveOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const container = resolveContainer(options.container);
        // Normalize animation to array
        let animation;
        if (!options.animation) {
            animation = DEFAULTS$1.animation;
        }
        else if (typeof options.animation === 'string') {
            animation = [options.animation];
        }
        else {
            animation = options.animation;
        }
        return {
            container,
            objects: options.objects,
            speed: (_a = options.speed) !== null && _a !== void 0 ? _a : DEFAULTS$1.speed,
            spawnRate: (_b = options.spawnRate) !== null && _b !== void 0 ? _b : DEFAULTS$1.spawnRate,
            maxParticles: (_c = options.maxParticles) !== null && _c !== void 0 ? _c : DEFAULTS$1.maxParticles,
            animation,
            size: (_d = options.size) !== null && _d !== void 0 ? _d : DEFAULTS$1.size,
            opacity: (_e = options.opacity) !== null && _e !== void 0 ? _e : DEFAULTS$1.opacity,
            wind: (_f = options.wind) !== null && _f !== void 0 ? _f : DEFAULTS$1.wind,
            autoStart: (_g = options.autoStart) !== null && _g !== void 0 ? _g : DEFAULTS$1.autoStart,
            zIndex: (_h = options.zIndex) !== null && _h !== void 0 ? _h : DEFAULTS$1.zIndex,
            responsive: (_j = options.responsive) !== null && _j !== void 0 ? _j : DEFAULTS$1.responsive
        };
    }
    /**
     * Setup resize handler for responsive behavior
     */
    setupResizeHandler() {
        this.resizeHandler = throttle(() => {
            if (this.renderer) {
                this.renderer.resize();
                const { width, height } = this.renderer.getSize();
                this.particles.forEach(particle => {
                    particle.updateContainerSize(width, height);
                });
            }
        }, 200);
        window.addEventListener('resize', this.resizeHandler);
    }
    /**
     * Spawn a new particle
     */
    spawnParticle() {
        if (this.particles.length >= this.options.maxParticles) {
            return;
        }
        if (!this.renderer)
            return;
        const { width, height } = this.renderer.getSize();
        const particle = new Particle(this.options, width, height);
        this.particles.push(particle);
    }
    /**
     * Start the animation
     */
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.lastSpawnTime = 0;
        this.animationId = requestAnimationFrame(this.animate);
    }
    /**
     * Stop the animation and clear all particles
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        // Clear all particles
        this.particles = [];
        // Clear canvas
        if (this.renderer) {
            this.renderer.clear();
        }
    }
    /**
     * Pause the animation (keeps particles in place)
     */
    pause() {
        if (!this.isRunning || this.isPaused)
            return;
        this.isPaused = true;
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    /**
     * Resume a paused animation
     */
    resume() {
        if (this.isRunning || !this.isPaused)
            return;
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.animationId = requestAnimationFrame(this.animate);
    }
    /**
     * Update options dynamically
     */
    setOptions(newOptions) {
        // Merge new options
        if (newOptions.speed) {
            this.options.speed = newOptions.speed;
        }
        if (newOptions.spawnRate !== undefined) {
            this.options.spawnRate = newOptions.spawnRate;
        }
        if (newOptions.maxParticles !== undefined) {
            this.options.maxParticles = newOptions.maxParticles;
        }
        if (newOptions.animation) {
            this.options.animation = typeof newOptions.animation === 'string'
                ? [newOptions.animation]
                : newOptions.animation;
        }
        if (newOptions.size) {
            this.options.size = newOptions.size;
        }
        if (newOptions.opacity) {
            this.options.opacity = newOptions.opacity;
        }
        if (newOptions.wind !== undefined) {
            this.options.wind = newOptions.wind;
        }
        if (newOptions.objects) {
            this.options.objects = newOptions.objects;
            this.preloadImages(); // Preload any new images
        }
    }
    /**
     * Get current particle count
     */
    getParticleCount() {
        return this.particles.length;
    }
    /**
     * Check if animation is running
     */
    getIsRunning() {
        return this.isRunning;
    }
    /**
     * Check if animation is paused
     */
    getIsPaused() {
        return this.isPaused;
    }
    /**
     * Destroy the animation and clean up
     */
    destroy() {
        this.stop();
        // Destroy renderer
        if (this.renderer) {
            this.renderer.destroy();
            this.renderer = null;
        }
        // Remove resize handler
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        // Remove visibility handler
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }
    }
}

/**
 * Fireworks Animation - Creates realistic firework effects (Canvas-based)
 *
 * Features:
 * - Rockets shooting up from bottom
 * - Explosions spreading particles in all directions (360°)
 * - Gravity effect on particles
 * - Fade out over time
 * - Glow effects
 */
/** Default colors for fireworks */
const DEFAULT_COLORS = [
    '#ff0000', // Red
    '#ff6b00', // Orange
    '#ffff00', // Yellow
    '#00ff00', // Green
    '#00ffff', // Cyan
    '#0066ff', // Blue
    '#ff00ff', // Magenta
    '#ffffff', // White
    '#ff69b4', // Pink
    '#ffd700', // Gold
];
const DEFAULTS = {
    colors: DEFAULT_COLORS,
    launchRate: 0.5,
    particlesPerExplosion: 50,
    rocketSpeed: { min: 7, max: 12 },
    explosionSpeed: { min: 1, max: 6 },
    particleSize: { min: 2, max: 6 },
    particleLifetime: { min: 1000, max: 2000 },
    gravity: 0.1,
    trail: true,
    explosionPattern: 'circular',
    maxParticles: 500,
    autoStart: true,
    zIndex: 9999
};
class Fireworks {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        this.particles = [];
        this.renderer = null;
        this.isRunning = false;
        this.animationId = null;
        this.lastLaunchTime = 0;
        this.lastFrameTime = 0;
        this.resizeHandler = null;
        this.visibilityHandler = null;
        this.pendingLaunches = [];
        this.animate = (currentTime) => {
            var _a;
            if (!this.isRunning || !this.renderer)
                return;
            if (this.lastFrameTime === 0) {
                this.lastFrameTime = currentTime;
            }
            const deltaTime = Math.min(currentTime - this.lastFrameTime, 50);
            this.lastFrameTime = currentTime;
            // Launch new rockets
            const launchInterval = 1000 / this.options.launchRate;
            if (currentTime - this.lastLaunchTime >= launchInterval) {
                this.launchRocket();
                this.lastLaunchTime = currentTime;
            }
            // Update particles
            const particlesToExplode = [];
            const removeSet = new Set();
            for (const particle of this.particles) {
                particle.age += deltaTime;
                if (particle.phase === 'rocket') {
                    particle.x += particle.vx * deltaTime * 0.1;
                    particle.y += particle.vy * deltaTime * 0.1;
                    particle.vy += 0.01 * deltaTime;
                    const targetY = (_a = particle.targetY) !== null && _a !== void 0 ? _a : 0;
                    if (particle.y <= targetY || particle.age >= particle.maxAge || particle.vy >= 0) {
                        particlesToExplode.push(particle);
                    }
                    particle.opacity = Math.max(0.5, 1 - (particle.age / particle.maxAge) * 0.3);
                }
                else {
                    particle.x += particle.vx * deltaTime * 0.1;
                    particle.y += particle.vy * deltaTime * 0.1;
                    particle.vy += particle.gravity * deltaTime * 0.01;
                    const lifeProgress = particle.age / particle.maxAge;
                    particle.opacity = Math.max(0, 1 - lifeProgress);
                    // Higher drag for small particles (embers effect)
                    const drag = particle.size < 2 ? 0.96 : 0.99;
                    particle.vx *= drag;
                    particle.vy *= drag;
                    // Double pattern secondary explosion: trigger at 50% lifetime if flag is set
                    if (particle.hasSecondaryExplosion && lifeProgress >= 0.5 && particle.targetY !== -1) {
                        particle.targetY = -1;
                        particlesToExplode.push(particle);
                    }
                    if (particle.age >= particle.maxAge) {
                        removeSet.add(particle);
                    }
                }
            }
            // Handle explosions and mark rockets for removal
            for (const rocket of particlesToExplode) {
                if (rocket.stage === 1) {
                    this.explodeSecondary(rocket);
                }
                else {
                    this.explode(rocket);
                }
                removeSet.add(rocket);
            }
            // Remove dead particles in a single filter pass (O(n))
            if (removeSet.size > 0) {
                this.particles = this.particles.filter(p => !removeSet.has(p));
            }
            // Render all particles
            this.renderer.clear(this.options.trail);
            const renderData = this.particles.map(p => ({
                x: p.x,
                y: p.y,
                size: p.size,
                opacity: p.opacity,
                color: p.color
            }));
            this.renderer.drawFireworkParticles(renderData);
            this.animationId = requestAnimationFrame(this.animate);
        };
        // Check for browser environment
        if (!isBrowser()) {
            throw new Error('[falling-animation] Fireworks requires a browser environment. ' +
                'If using SSR (Next.js, Nuxt, etc.), make sure to only initialize on the client side.');
        }
        const container = resolveContainer(options.container);
        this.options = {
            container,
            colors: (_a = options.colors) !== null && _a !== void 0 ? _a : DEFAULTS.colors,
            launchRate: (_b = options.launchRate) !== null && _b !== void 0 ? _b : DEFAULTS.launchRate,
            particlesPerExplosion: (_c = options.particlesPerExplosion) !== null && _c !== void 0 ? _c : DEFAULTS.particlesPerExplosion,
            rocketSpeed: (_d = options.rocketSpeed) !== null && _d !== void 0 ? _d : DEFAULTS.rocketSpeed,
            explosionSpeed: (_e = options.explosionSpeed) !== null && _e !== void 0 ? _e : DEFAULTS.explosionSpeed,
            particleSize: (_f = options.particleSize) !== null && _f !== void 0 ? _f : DEFAULTS.particleSize,
            particleLifetime: (_g = options.particleLifetime) !== null && _g !== void 0 ? _g : DEFAULTS.particleLifetime,
            gravity: (_h = options.gravity) !== null && _h !== void 0 ? _h : DEFAULTS.gravity,
            trail: (_j = options.trail) !== null && _j !== void 0 ? _j : DEFAULTS.trail,
            explosionPattern: (_k = options.explosionPattern) !== null && _k !== void 0 ? _k : DEFAULTS.explosionPattern,
            maxParticles: (_l = options.maxParticles) !== null && _l !== void 0 ? _l : DEFAULTS.maxParticles,
            autoStart: (_m = options.autoStart) !== null && _m !== void 0 ? _m : DEFAULTS.autoStart,
            zIndex: (_o = options.zIndex) !== null && _o !== void 0 ? _o : DEFAULTS.zIndex
        };
        // Create canvas renderer
        this.renderer = new CanvasRenderer(container, this.options.zIndex);
        this.setupResizeHandler();
        // Pause when tab is hidden to save CPU/GPU
        this.visibilityHandler = () => {
            if (document.hidden) {
                if (this.isRunning)
                    this.stop();
            }
            else {
                if (!this.isRunning)
                    this.start();
            }
        };
        document.addEventListener('visibilitychange', this.visibilityHandler);
        if (this.options.autoStart) {
            this.start();
        }
    }
    setupResizeHandler() {
        this.resizeHandler = throttle(() => {
            if (this.renderer) {
                this.renderer.resize();
            }
        }, 200);
        window.addEventListener('resize', this.resizeHandler);
    }
    getContainerSize() {
        if (this.renderer) {
            return this.renderer.getSize();
        }
        return { width: 0, height: 0 };
    }
    launchRocket() {
        const { width, height } = this.getContainerSize();
        if (width === 0 || height === 0)
            return;
        const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
        // Random explosion height: 10% to 90% from top of screen
        const targetY = randomRange(height * 0.1, height * 0.9);
        const distanceToTravel = height - targetY;
        // Calculate time based on distance and speed
        const rocketSpeed = randomFromRange(this.options.rocketSpeed);
        const travelTime = distanceToTravel / (rocketSpeed * 0.1);
        const particle = {
            id: generateId(),
            x: randomRange(width * 0.1, width * 0.9),
            y: height + 10,
            vx: randomRange(-0.5, 0.5),
            vy: -rocketSpeed,
            size: 4,
            opacity: 1,
            color,
            age: 0,
            maxAge: Math.min(travelTime, 3000),
            phase: 'rocket',
            gravity: 0,
            targetY,
            stage: 0
        };
        this.particles.push(particle);
    }
    explode(rocket) {
        if (this.particles.length >= this.options.maxParticles)
            return;
        const particleCount = this.options.particlesPerExplosion;
        const color = rocket.color;
        // Get pattern (resolve 'random' or array to single pattern)
        let pattern;
        const patternOption = this.options.explosionPattern;
        if (Array.isArray(patternOption)) {
            // Pick random from array
            pattern = patternOption[Math.floor(Math.random() * patternOption.length)];
        }
        else if (patternOption === 'random') {
            const patterns = ['circular', 'ring', 'heart', 'star', 'willow', 'palm', 'chrysanthemum', 'embers', 'double', 'waterfall'];
            pattern = patterns[Math.floor(Math.random() * patterns.length)];
        }
        else {
            pattern = patternOption;
        }
        // Generate particles based on pattern
        const particles = this.generatePatternParticles(pattern, rocket, particleCount, color);
        for (const particle of particles) {
            this.particles.push(particle);
        }
    }
    generatePatternParticles(pattern, rocket, count, color) {
        switch (pattern) {
            case 'ring':
                return this.createRingExplosion(rocket, count, color);
            case 'heart':
                return this.createHeartExplosion(rocket, count, color);
            case 'star':
                return this.createStarExplosion(rocket, count, color);
            case 'willow':
                return this.createWillowExplosion(rocket, count, color);
            case 'palm':
                return this.createPalmExplosion(rocket, count, color);
            case 'chrysanthemum':
                return this.createChrysanthemumExplosion(rocket, count, color);
            case 'embers':
                return this.createEmbersExplosion(rocket, count, color);
            case 'double':
                return this.createDoubleExplosion(rocket, count, color);
            case 'waterfall':
                return this.createWaterfallExplosion(rocket, count, color);
            case 'circular':
            default:
                return this.createCircularExplosion(rocket, count, color);
        }
    }
    /** Standard circular explosion - even spread */
    createCircularExplosion(rocket, count, color) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + randomRange(-0.1, 0.1);
            const speed = randomFromRange(this.options.explosionSpeed);
            particles.push(this.createExplosionParticle(rocket, color, angle, speed));
        }
        return particles;
    }
    /** Ring/donut shape - particles at similar radius */
    createRingExplosion(rocket, count, color) {
        const particles = [];
        const baseSpeed = (this.options.explosionSpeed.min + this.options.explosionSpeed.max) / 2;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = baseSpeed + randomRange(-0.5, 0.5);
            particles.push(this.createExplosionParticle(rocket, color, angle, speed, 0.05)); // Low gravity
        }
        return particles;
    }
    /** Heart shape explosion */
    createHeartExplosion(rocket, count, color) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            // Heart parametric equation
            const heartX = 16 * Math.pow(Math.sin(t), 3);
            const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            const angle = Math.atan2(heartY, heartX);
            const speed = Math.sqrt(heartX * heartX + heartY * heartY) / 16 * randomFromRange(this.options.explosionSpeed);
            particles.push(this.createExplosionParticle(rocket, color, angle, speed * 0.8, 0.08));
        }
        return particles;
    }
    /** Star burst - concentrated beams */
    createStarExplosion(rocket, count, color) {
        const particles = [];
        const points = 5; // 5-pointed star
        for (let i = 0; i < count; i++) {
            const starAngle = (Math.floor(i / (count / points)) / points) * Math.PI * 2;
            const spreadAngle = starAngle + randomRange(-0.15, 0.15);
            const speed = randomFromRange(this.options.explosionSpeed) * (0.8 + Math.random() * 0.4);
            particles.push(this.createExplosionParticle(rocket, color, spreadAngle, speed));
        }
        return particles;
    }
    /** Willow - heavy gravity, long trails */
    createWillowExplosion(rocket, count, color) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + randomRange(-0.1, 0.1);
            const speed = randomFromRange(this.options.explosionSpeed) * 0.6;
            const p = this.createExplosionParticle(rocket, '#ffd700', angle, speed, 0.25); // Gold, high gravity
            p.maxAge *= 1.5; // Longer life
            particles.push(p);
        }
        return particles;
    }
    /** Palm tree - upward bias */
    createPalmExplosion(rocket, count, color) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            // Bias upward (angles from -60 to 240 degrees, avoiding straight down)
            const angle = randomRange(-Math.PI * 0.8, Math.PI * 0.8) - Math.PI / 2;
            const speed = randomFromRange(this.options.explosionSpeed) * (0.7 + Math.random() * 0.6);
            const p = this.createExplosionParticle(rocket, color, angle, speed, 0.18);
            p.maxAge *= 1.2;
            particles.push(p);
        }
        return particles;
    }
    /** Chrysanthemum - dense spherical burst */
    createChrysanthemumExplosion(rocket, count, color) {
        const particles = [];
        const layers = 3;
        for (let layer = 0; layer < layers; layer++) {
            const layerCount = Math.floor(count / layers);
            const baseSpeed = this.options.explosionSpeed.min +
                (this.options.explosionSpeed.max - this.options.explosionSpeed.min) * (layer / layers);
            for (let i = 0; i < layerCount; i++) {
                const angle = (i / layerCount) * Math.PI * 2 + (layer * 0.3);
                const speed = baseSpeed + randomRange(-0.5, 0.5);
                particles.push(this.createExplosionParticle(rocket, color, angle, speed, 0.08));
            }
        }
        return particles;
    }
    /** Embers - Slow-falling micro particles (Tàn Lửa Trôi Nhẹ)
     * Very small particles (0.5-1.5px) with low gravity and high drag
     */
    createEmbersExplosion(rocket, count, color) {
        const particles = [];
        // More particles for embers effect (1.5x normal count)
        const emberCount = Math.floor(count * 1.5);
        for (let i = 0; i < emberCount; i++) {
            const angle = (i / emberCount) * Math.PI * 2 + randomRange(-0.3, 0.3);
            // Very slow initial speed
            const speed = randomFromRange(this.options.explosionSpeed) * 0.3;
            const particle = {
                id: generateId(),
                x: rocket.x + randomRange(-5, 5), // Slight position randomness
                y: rocket.y + randomRange(-5, 5),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                // Very small particles (0.5 - 1.5 px)
                size: randomRange(0.5, 1.5),
                opacity: 1,
                // Warm ember colors
                color: this.getEmberColor(color),
                age: 0,
                // Long lifetime for slow fade
                maxAge: randomFromRange(this.options.particleLifetime) * 2,
                phase: 'explosion',
                // Very low gravity - particles float
                gravity: 0.02,
                stage: rocket.stage + 1
            };
            particles.push(particle);
        }
        return particles;
    }
    /** Double explosion - first explosion creates particles that explode again
     * Secondary particles are 2-3x smaller than primary
     */
    createDoubleExplosion(rocket, count, color) {
        const particles = [];
        // First explosion: create fewer, larger particles that will explode again
        const primaryCount = Math.floor(count * 0.6);
        for (let i = 0; i < primaryCount; i++) {
            const angle = (i / primaryCount) * Math.PI * 2 + randomRange(-0.1, 0.1);
            const speed = randomFromRange(this.options.explosionSpeed) * 0.8;
            const particle = {
                id: generateId(),
                x: rocket.x,
                y: rocket.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                // Normal size for primary particles
                size: randomFromRange(this.options.particleSize),
                opacity: 1,
                color: this.getVariantColor(color),
                age: 0,
                maxAge: randomFromRange(this.options.particleLifetime),
                phase: 'explosion',
                gravity: this.options.gravity,
                stage: 1,
                hasSecondaryExplosion: true, // Explicitly enable secondary explosion
            };
            particles.push(particle);
        }
        return particles;
    }
    /** Waterfall - Gentle explosion up, then heavy fall like water */
    createWaterfallExplosion(rocket, count, color) {
        const particles = [];
        // Waterfall needs VERY high density to look like streams
        const waterfallCount = Math.floor(count * 2.5);
        for (let i = 0; i < waterfallCount; i++) {
            // Semicircle upwards (0 to PI, negative for canvas Y)
            // But we want a slight spread, mostly up
            const angle = Math.PI + Math.random() * Math.PI; // Full arc upwards (-PI to 0 effectively)
            // Low initial speed - "nổ nhẹ nhàng"
            const speed = randomFromRange(this.options.explosionSpeed) * 0.4;
            const particle = {
                id: generateId(),
                x: rocket.x,
                y: rocket.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed * 0.5, // Flatten the vertical explosion a bit
                size: randomFromRange(this.options.particleSize),
                opacity: 1,
                color: this.getVariantColor(color),
                age: 0,
                // Long lifetime to fall down screen
                maxAge: randomFromRange(this.options.particleLifetime) * 2.5,
                phase: 'explosion',
                // High gravity for waterfall effect
                gravity: 0.25,
                stage: 0
            };
            particles.push(particle);
        }
        return particles;
    }
    /** Create secondary explosion particles (called when stage 1 particles reach 50% lifetime)
     * These particles are 2-3x smaller than the originals
     */
    explodeSecondary(parent) {
        const secondaryCount = Math.floor(this.options.particlesPerExplosion * 0.3); // 30% of normal
        for (let i = 0; i < secondaryCount; i++) {
            const angle = (i / secondaryCount) * Math.PI * 2 + randomRange(-0.2, 0.2);
            const speed = randomFromRange(this.options.explosionSpeed) * 0.5;
            const particle = {
                id: generateId(),
                x: parent.x,
                y: parent.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                // Secondary particles are 2-3x smaller!
                size: Math.max(1, randomFromRange(this.options.particleSize) / randomRange(2, 3)),
                opacity: 0.9,
                color: this.getVariantColor(parent.color),
                age: 0,
                maxAge: randomFromRange(this.options.particleLifetime) * 0.7, // Shorter lifetime
                phase: 'explosion',
                gravity: this.options.gravity * 0.5, // Less gravity
                stage: 2 // Stage 2 - no more explosions
            };
            this.particles.push(particle);
        }
    }
    /** Get warm ember color variant */
    getEmberColor(baseColor) {
        const emberColors = ['#ffaa00', '#ff6600', '#ff4400', '#ffcc00', '#ff8800', '#ffffff'];
        if (Math.random() < 0.7) {
            // 70% chance of ember colors
            return emberColors[Math.floor(Math.random() * emberColors.length)];
        }
        return baseColor;
    }
    /** Helper to create a single explosion particle */
    createExplosionParticle(rocket, color, angle, speed, gravity) {
        return {
            id: generateId(),
            x: rocket.x,
            y: rocket.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: randomFromRange(this.options.particleSize),
            opacity: 1,
            color: this.getVariantColor(color),
            age: 0,
            maxAge: randomFromRange(this.options.particleLifetime),
            phase: 'explosion',
            gravity: gravity !== null && gravity !== void 0 ? gravity : this.options.gravity,
            stage: rocket.stage + 1
        };
    }
    getVariantColor(baseColor) {
        if (Math.random() < 0.2) {
            return '#ffffff';
        }
        if (Math.random() < 0.3) {
            return this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
        }
        return baseColor;
    }
    /** Start the fireworks */
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.lastFrameTime = 0;
        this.lastLaunchTime = 0;
        this.animationId = requestAnimationFrame(this.animate);
    }
    /** Stop the fireworks */
    stop() {
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.pendingLaunches.forEach(id => clearTimeout(id));
        this.pendingLaunches = [];
    }
    /** Clear all particles but keep running */
    clear() {
        this.particles = [];
        if (this.renderer) {
            this.renderer.clear();
        }
    }
    /** Launch a single firework manually */
    launch() {
        this.launchRocket();
    }
    /** Launch multiple fireworks at once */
    burst(count = 5) {
        for (let i = 0; i < count; i++) {
            const id = window.setTimeout(() => {
                this.launchRocket();
                this.pendingLaunches = this.pendingLaunches.filter(t => t !== id);
            }, i * 100);
            this.pendingLaunches.push(id);
        }
    }
    /** Update options */
    setOptions(newOptions) {
        if (newOptions.colors)
            this.options.colors = newOptions.colors;
        if (newOptions.launchRate !== undefined)
            this.options.launchRate = newOptions.launchRate;
        if (newOptions.particlesPerExplosion !== undefined)
            this.options.particlesPerExplosion = newOptions.particlesPerExplosion;
        if (newOptions.rocketSpeed)
            this.options.rocketSpeed = newOptions.rocketSpeed;
        if (newOptions.explosionSpeed)
            this.options.explosionSpeed = newOptions.explosionSpeed;
        if (newOptions.particleSize)
            this.options.particleSize = newOptions.particleSize;
        if (newOptions.particleLifetime)
            this.options.particleLifetime = newOptions.particleLifetime;
        if (newOptions.gravity !== undefined)
            this.options.gravity = newOptions.gravity;
        if (newOptions.explosionPattern)
            this.options.explosionPattern = newOptions.explosionPattern;
        if (newOptions.maxParticles !== undefined)
            this.options.maxParticles = newOptions.maxParticles;
    }
    /** Get particle count */
    getParticleCount() {
        return this.particles.length;
    }
    /** Check if running */
    getIsRunning() {
        return this.isRunning;
    }
    /** Destroy and cleanup */
    destroy() {
        this.stop();
        this.clear();
        if (this.renderer) {
            this.renderer.destroy();
            this.renderer = null;
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }
    }
}

/**
 * falling-animation
 * A lightweight, customizable falling objects animation library
 *
 * @author phongdh
 * @license MIT
 */
// Main classes

export { FallingAnimation, Fireworks, animations, FallingAnimation as default, getAnimation, isBrowser };
