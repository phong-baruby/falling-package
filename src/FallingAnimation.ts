/**
 * FallingAnimation - Main class for creating falling object animations (Canvas-based)
 */

import {
    FallingAnimationOptions,
    ResolvedOptions,
    AnimationType
} from './types';
import { Particle } from './Particle';
import { resolveContainer, throttle } from './utils';
import { CanvasRenderer, RenderParticle } from './CanvasRenderer';

/** Default configuration values */
const DEFAULTS: Omit<ResolvedOptions, 'container' | 'objects'> = {
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

export class FallingAnimation {
    private options: ResolvedOptions;
    private particles: Particle[] = [];
    private renderer: CanvasRenderer | null = null;
    private isRunning = false;
    private isPaused = false;
    private animationId: number | null = null;
    private lastSpawnTime = 0;
    private startTime = 0;
    private lastFrameTime = 0;
    private resizeHandler: (() => void) | null = null;
    private visibilityHandler: (() => void) | null = null;
    private imagesReady = false;

    constructor(options: FallingAnimationOptions) {
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
        } else {
            this.imagesReady = true;
        }

        // Setup resize handler if responsive
        if (this.options.responsive) {
            this.setupResizeHandler();
        }

        // Pause when tab is hidden to save CPU/GPU
        this.visibilityHandler = () => {
            if (document.hidden) {
                if (this.isRunning) this.pause();
            } else {
                if (this.isPaused) this.resume();
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
    private async preloadImages(): Promise<void> {
        if (!this.renderer) return;

        for (const obj of this.options.objects) {
            if (obj.type === 'image') {
                const src = obj.src || obj.content;
                if (src) {
                    try {
                        await this.renderer.preloadImage(src);
                    } catch (e) {
                        console.warn(`[falling-animation] Failed to preload image: ${src}`);
                    }
                }
            }
        }
    }

    /**
     * Merge user options with defaults
     */
    private resolveOptions(options: FallingAnimationOptions): ResolvedOptions {
        const container = resolveContainer(options.container);

        // Normalize animation to array
        let animation: AnimationType[];
        if (!options.animation) {
            animation = DEFAULTS.animation;
        } else if (typeof options.animation === 'string') {
            animation = [options.animation];
        } else {
            animation = options.animation;
        }

        return {
            container,
            objects: options.objects,
            speed: options.speed ?? DEFAULTS.speed,
            spawnRate: options.spawnRate ?? DEFAULTS.spawnRate,
            maxParticles: options.maxParticles ?? DEFAULTS.maxParticles,
            animation,
            size: options.size ?? DEFAULTS.size,
            opacity: options.opacity ?? DEFAULTS.opacity,
            wind: options.wind ?? DEFAULTS.wind,
            autoStart: options.autoStart ?? DEFAULTS.autoStart,
            zIndex: options.zIndex ?? DEFAULTS.zIndex,
            responsive: options.responsive ?? DEFAULTS.responsive
        };
    }

    /**
     * Setup resize handler for responsive behavior
     */
    private setupResizeHandler(): void {
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
    private spawnParticle(): void {
        if (this.particles.length >= this.options.maxParticles) {
            return;
        }

        if (!this.renderer) return;

        const { width, height } = this.renderer.getSize();
        const particle = new Particle(this.options, width, height);
        this.particles.push(particle);
    }

    /**
     * Main animation loop
     */
    private animate = (currentTime: number): void => {
        if (!this.isRunning || !this.renderer) return;

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
            if (particle.isOutOfBounds()) hasRemoved = true;
        }

        // Remove out-of-bounds particles in a single filter pass (O(n))
        if (hasRemoved) {
            this.particles = this.particles.filter(p => !p.isOutOfBounds());
        }

        // Clear and render all particles — reuse inline to avoid per-frame allocation
        this.renderer.clear();

        const renderData: RenderParticle[] = this.particles.map(p => ({
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

    /**
     * Start the animation
     */
    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.lastSpawnTime = 0;

        this.animationId = requestAnimationFrame(this.animate);
    }

    /**
     * Stop the animation and clear all particles
     */
    stop(): void {
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
    pause(): void {
        if (!this.isRunning || this.isPaused) return;

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
    resume(): void {
        if (this.isRunning || !this.isPaused) return;

        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = 0;

        this.animationId = requestAnimationFrame(this.animate);
    }

    /**
     * Update options dynamically
     */
    setOptions(newOptions: Partial<FallingAnimationOptions>): void {
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
    getParticleCount(): number {
        return this.particles.length;
    }

    /**
     * Check if animation is running
     */
    getIsRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Check if animation is paused
     */
    getIsPaused(): boolean {
        return this.isPaused;
    }

    /**
     * Destroy the animation and clean up
     */
    destroy(): void {
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
