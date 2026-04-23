/**
 * FallingAnimation - Main class for creating falling object animations (Canvas-based)
 */
import { FallingAnimationOptions } from './types';
export declare class FallingAnimation {
    private options;
    private particles;
    private renderer;
    private isRunning;
    private isPaused;
    private animationId;
    private lastSpawnTime;
    private startTime;
    private lastFrameTime;
    private resizeHandler;
    private visibilityHandler;
    private imagesReady;
    constructor(options: FallingAnimationOptions);
    /**
     * Preload any image objects
     */
    private preloadImages;
    /**
     * Merge user options with defaults
     */
    private resolveOptions;
    /**
     * Setup resize handler for responsive behavior
     */
    private setupResizeHandler;
    /**
     * Spawn a new particle
     */
    private spawnParticle;
    /**
     * Main animation loop
     */
    private animate;
    /**
     * Start the animation
     */
    start(): void;
    /**
     * Stop the animation and clear all particles
     */
    stop(): void;
    /**
     * Pause the animation (keeps particles in place)
     */
    pause(): void;
    /**
     * Resume a paused animation
     */
    resume(): void;
    /**
     * Update options dynamically
     */
    setOptions(newOptions: Partial<FallingAnimationOptions>): void;
    /**
     * Get current particle count
     */
    getParticleCount(): number;
    /**
     * Check if animation is running
     */
    getIsRunning(): boolean;
    /**
     * Check if animation is paused
     */
    getIsPaused(): boolean;
    /**
     * Destroy the animation and clean up
     */
    destroy(): void;
}
