/**
 * FallingAnimation - Main class for creating falling object animations
 */

import {
    FallingAnimationOptions,
    ResolvedOptions,
    AnimationType
} from './types';
import { Particle } from './Particle';
import { resolveContainer, throttle } from './utils';

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
    private wrapper: HTMLElement | null = null;
    private isRunning = false;
    private isPaused = false;
    private animationId: number | null = null;
    private lastSpawnTime = 0;
    private startTime = 0;
    private lastFrameTime = 0;
    private resizeHandler: (() => void) | null = null;

    constructor(options: FallingAnimationOptions) {
        // Validate required options
        if (!options.objects || options.objects.length === 0) {
            throw new Error('[falling-animation] "objects" option is required and must not be empty');
        }

        // Resolve options with defaults
        this.options = this.resolveOptions(options);

        // Create wrapper element
        this.createWrapper();

        // Setup resize handler if responsive
        if (this.options.responsive) {
            this.setupResizeHandler();
        }

        // Auto start if enabled
        if (this.options.autoStart) {
            this.start();
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
     * Create wrapper element for particles
     */
    private createWrapper(): void {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'falling-animation-wrapper';

        // Apply styles
        Object.assign(this.wrapper.style, {
            position: this.options.container === document.body ? 'fixed' : 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: String(this.options.zIndex)
        });

        // Ensure container has position for absolute wrapper
        if (this.options.container !== document.body) {
            const containerPosition = getComputedStyle(this.options.container).position;
            if (containerPosition === 'static') {
                this.options.container.style.position = 'relative';
            }
        }

        this.options.container.appendChild(this.wrapper);
    }

    /**
     * Setup resize handler for responsive behavior
     */
    private setupResizeHandler(): void {
        this.resizeHandler = throttle(() => {
            const width = this.options.container.clientWidth;
            const height = this.options.container.clientHeight;

            this.particles.forEach(particle => {
                particle.updateContainerSize(width, height);
            });
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

        const particle = new Particle(this.options);
        this.particles.push(particle);

        if (this.wrapper) {
            this.wrapper.appendChild(particle.element);
        }
    }

    /**
     * Remove a particle
     */
    private removeParticle(particle: Particle): void {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
            particle.destroy();
        }
    }

    /**
     * Main animation loop
     */
    private animate = (currentTime: number): void => {
        if (!this.isRunning) return;

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

        // Update particles
        const particlesToRemove: Particle[] = [];

        for (const particle of this.particles) {
            particle.update(deltaTime, elapsed);

            if (particle.isOutOfBounds()) {
                particlesToRemove.push(particle);
            }
        }

        // Remove out-of-bounds particles
        particlesToRemove.forEach(p => this.removeParticle(p));

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
        this.particles.forEach(p => p.destroy());
        this.particles = [];
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

        // Remove wrapper
        if (this.wrapper) {
            this.wrapper.remove();
            this.wrapper = null;
        }

        // Remove resize handler
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
    }
}
