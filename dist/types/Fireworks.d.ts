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
import { RangeValue } from './types';
/** Available explosion patterns */
export type ExplosionPattern = 'circular' | 'ring' | 'heart' | 'star' | 'willow' | 'palm' | 'chrysanthemum' | 'embers' | 'double' | 'waterfall' | 'random';
/** Fireworks configuration options */
export interface FireworksOptions {
    /** Container element or selector (default: document.body) */
    container?: HTMLElement | string;
    /** Colors for fireworks (default: festive colors) */
    colors?: string[];
    /** Launch rate - fireworks per second (default: 1) */
    launchRate?: number;
    /** Particles per explosion (default: 50) */
    particlesPerExplosion?: number;
    /** Rocket speed range (default: { min: 8, max: 15 }) */
    rocketSpeed?: RangeValue;
    /** Explosion particle speed range (default: { min: 2, max: 8 }) */
    explosionSpeed?: RangeValue;
    /** Particle size range in pixels (default: { min: 2, max: 6 }) */
    particleSize?: RangeValue;
    /** Explosion particle lifetime in ms (default: { min: 1000, max: 2000 }) */
    particleLifetime?: RangeValue;
    /** Gravity strength (default: 0.1) */
    gravity?: number;
    /** Enable trail effect (default: true) */
    trail?: boolean;
    /** Explosion pattern type - single pattern or array for random selection (default: 'circular') */
    explosionPattern?: ExplosionPattern | ExplosionPattern[];
    /** Maximum concurrent particles to prevent frame drops (default: 500) */
    maxParticles?: number;
    /** Auto start animation (default: true) */
    autoStart?: boolean;
    /** Z-index for the container (default: 9999) */
    zIndex?: number;
}
export declare class Fireworks {
    private options;
    private particles;
    private renderer;
    private isRunning;
    private animationId;
    private lastLaunchTime;
    private lastFrameTime;
    private resizeHandler;
    private visibilityHandler;
    private pendingLaunches;
    constructor(options?: FireworksOptions);
    private setupResizeHandler;
    private getContainerSize;
    private launchRocket;
    private explode;
    private generatePatternParticles;
    /** Standard circular explosion - even spread */
    private createCircularExplosion;
    /** Ring/donut shape - particles at similar radius */
    private createRingExplosion;
    /** Heart shape explosion */
    private createHeartExplosion;
    /** Star burst - concentrated beams */
    private createStarExplosion;
    /** Willow - heavy gravity, long trails */
    private createWillowExplosion;
    /** Palm tree - upward bias */
    private createPalmExplosion;
    /** Chrysanthemum - dense spherical burst */
    private createChrysanthemumExplosion;
    /** Embers - Slow-falling micro particles (Tàn Lửa Trôi Nhẹ)
     * Very small particles (0.5-1.5px) with low gravity and high drag
     */
    private createEmbersExplosion;
    /** Double explosion - first explosion creates particles that explode again
     * Secondary particles are 2-3x smaller than primary
     */
    private createDoubleExplosion;
    /** Waterfall - Gentle explosion up, then heavy fall like water */
    private createWaterfallExplosion;
    /** Create secondary explosion particles (called when stage 1 particles reach 50% lifetime)
     * These particles are 2-3x smaller than the originals
     */
    private explodeSecondary;
    /** Get warm ember color variant */
    private getEmberColor;
    /** Helper to create a single explosion particle */
    private createExplosionParticle;
    private getVariantColor;
    private animate;
    /** Start the fireworks */
    start(): void;
    /** Stop the fireworks */
    stop(): void;
    /** Clear all particles but keep running */
    clear(): void;
    /** Launch a single firework manually */
    launch(): void;
    /** Launch multiple fireworks at once */
    burst(count?: number): void;
    /** Update options */
    setOptions(newOptions: Partial<FireworksOptions>): void;
    /** Get particle count */
    getParticleCount(): number;
    /** Check if running */
    getIsRunning(): boolean;
    /** Destroy and cleanup */
    destroy(): void;
}
