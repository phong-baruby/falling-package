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
import { randomRange, randomFromRange, generateId, throttle, isBrowser } from './utils';
import { CanvasRenderer, RenderFireworkParticle } from './CanvasRenderer';

/** Firework particle state */
interface FireworkParticle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    age: number;
    maxAge: number;
    phase: 'rocket' | 'explosion';
    gravity: number;
    targetY?: number;
    /** Explosion stage (0 = primary, 1 = secondary, etc.) */
    stage: number;
    /** Whether this particle triggers a secondary explosion */
    hasSecondaryExplosion?: boolean;
}

/** Available explosion patterns */
export type ExplosionPattern =
    | 'circular'   // Standard circular explosion
    | 'ring'       // Ring/donut shape
    | 'heart'      // Heart shape
    | 'star'       // Star burst pattern
    | 'willow'     // Trailing willow effect (gravity-heavy)
    | 'palm'       // Palm tree effect
    | 'chrysanthemum' // Dense spherical burst
    | 'embers'     // Slow-falling micro embers (Tàn Lửa Trôi Nhẹ)
    | 'double'     // Double explosion (nổ 2 lần, lần 2 nhỏ hơn)
    | 'waterfall'  // Waterfall effect (gentle rise, rain down)
    | 'random';    // Random pattern each time

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

    /** Auto start animation (default: true) */
    autoStart?: boolean;

    /** Z-index for the container (default: 9999) */
    zIndex?: number;
}

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

const DEFAULTS: Required<Omit<FireworksOptions, 'container'>> = {
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
    autoStart: true,
    zIndex: 9999
};

export class Fireworks {
    private options: Required<FireworksOptions> & { container: HTMLElement };
    private particles: FireworkParticle[] = [];
    private renderer: CanvasRenderer | null = null;
    private isRunning = false;
    private animationId: number | null = null;
    private lastLaunchTime = 0;
    private lastFrameTime = 0;
    private resizeHandler: (() => void) | null = null;

    constructor(options: FireworksOptions = {}) {
        // Check for browser environment
        if (!isBrowser()) {
            throw new Error(
                '[falling-animation] Fireworks requires a browser environment. ' +
                'If using SSR (Next.js, Nuxt, etc.), make sure to only initialize on the client side.'
            );
        }

        // Resolve container
        let container: HTMLElement;
        if (!options.container) {
            container = document.body;
        } else if (typeof options.container === 'string') {
            container = document.querySelector<HTMLElement>(options.container) || document.body;
        } else {
            container = options.container;
        }

        this.options = {
            container,
            colors: options.colors ?? DEFAULTS.colors,
            launchRate: options.launchRate ?? DEFAULTS.launchRate,
            particlesPerExplosion: options.particlesPerExplosion ?? DEFAULTS.particlesPerExplosion,
            rocketSpeed: options.rocketSpeed ?? DEFAULTS.rocketSpeed,
            explosionSpeed: options.explosionSpeed ?? DEFAULTS.explosionSpeed,
            particleSize: options.particleSize ?? DEFAULTS.particleSize,
            particleLifetime: options.particleLifetime ?? DEFAULTS.particleLifetime,
            gravity: options.gravity ?? DEFAULTS.gravity,
            trail: options.trail ?? DEFAULTS.trail,
            explosionPattern: options.explosionPattern ?? DEFAULTS.explosionPattern,
            autoStart: options.autoStart ?? DEFAULTS.autoStart,
            zIndex: options.zIndex ?? DEFAULTS.zIndex
        };

        // Create canvas renderer
        this.renderer = new CanvasRenderer(container, this.options.zIndex);
        this.setupResizeHandler();

        if (this.options.autoStart) {
            this.start();
        }
    }

    private setupResizeHandler(): void {
        this.resizeHandler = throttle(() => {
            if (this.renderer) {
                this.renderer.resize();
            }
        }, 200);
        window.addEventListener('resize', this.resizeHandler);
    }

    private getContainerSize(): { width: number; height: number } {
        if (this.renderer) {
            return this.renderer.getSize();
        }
        return { width: 0, height: 0 };
    }

    private launchRocket(): void {
        const { width, height } = this.getContainerSize();
        if (width === 0 || height === 0) return;

        const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];

        // Random explosion height: 10% to 90% from top of screen
        const targetY = randomRange(height * 0.1, height * 0.9);
        const distanceToTravel = height - targetY;

        // Calculate time based on distance and speed
        const rocketSpeed = randomFromRange(this.options.rocketSpeed);
        const travelTime = distanceToTravel / (rocketSpeed * 0.1);

        const particle: FireworkParticle = {
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

    private explode(rocket: FireworkParticle): void {
        const particleCount = this.options.particlesPerExplosion;
        const color = rocket.color;

        // Get pattern (resolve 'random' or array to single pattern)
        let pattern: ExplosionPattern;
        const patternOption = this.options.explosionPattern;

        if (Array.isArray(patternOption)) {
            // Pick random from array
            pattern = patternOption[Math.floor(Math.random() * patternOption.length)];
        } else if (patternOption === 'random') {
            const patterns: ExplosionPattern[] = ['circular', 'ring', 'heart', 'star', 'willow', 'palm', 'chrysanthemum', 'embers', 'double', 'waterfall'];
            pattern = patterns[Math.floor(Math.random() * patterns.length)];
        } else {
            pattern = patternOption;
        }

        // Generate particles based on pattern
        const particles = this.generatePatternParticles(pattern, rocket, particleCount, color);

        for (const particle of particles) {
            this.particles.push(particle);
        }
    }

    private generatePatternParticles(
        pattern: ExplosionPattern,
        rocket: FireworkParticle,
        count: number,
        color: string
    ): FireworkParticle[] {
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
    private createCircularExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + randomRange(-0.1, 0.1);
            const speed = randomFromRange(this.options.explosionSpeed);
            particles.push(this.createExplosionParticle(rocket, color, angle, speed));
        }
        return particles;
    }

    /** Ring/donut shape - particles at similar radius */
    private createRingExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        const baseSpeed = (this.options.explosionSpeed.min + this.options.explosionSpeed.max) / 2;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = baseSpeed + randomRange(-0.5, 0.5);
            particles.push(this.createExplosionParticle(rocket, color, angle, speed, 0.05)); // Low gravity
        }
        return particles;
    }

    /** Heart shape explosion */
    private createHeartExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
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
    private createStarExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
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
    private createWillowExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
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
    private createPalmExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
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
    private createChrysanthemumExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
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
    private createEmbersExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        // More particles for embers effect (1.5x normal count)
        const emberCount = Math.floor(count * 1.5);

        for (let i = 0; i < emberCount; i++) {
            const angle = (i / emberCount) * Math.PI * 2 + randomRange(-0.3, 0.3);
            // Very slow initial speed
            const speed = randomFromRange(this.options.explosionSpeed) * 0.3;

            const particle: FireworkParticle = {
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
    private createDoubleExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        // First explosion: create fewer, larger particles that will explode again
        const primaryCount = Math.floor(count * 0.6);

        for (let i = 0; i < primaryCount; i++) {
            const angle = (i / primaryCount) * Math.PI * 2 + randomRange(-0.1, 0.1);
            const speed = randomFromRange(this.options.explosionSpeed) * 0.8;

            const particle: FireworkParticle = {
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
    private createWaterfallExplosion(rocket: FireworkParticle, count: number, color: string): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        // Waterfall needs VERY high density to look like streams
        const waterfallCount = Math.floor(count * 2.5);

        // Force golden/waterfall colors significantly
        const isGold = Math.random() < 0.8;
        const waterfallColor = isGold ? '#ffd700' : color;

        for (let i = 0; i < waterfallCount; i++) {
            // Semicircle upwards (0 to PI, negative for canvas Y)
            // But we want a slight spread, mostly up
            const angle = Math.PI + Math.random() * Math.PI; // Full arc upwards (-PI to 0 effectively)

            // Low initial speed - "nổ nhẹ nhàng"
            const speed = randomFromRange(this.options.explosionSpeed) * 0.4;

            const particle: FireworkParticle = {
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
    private explodeSecondary(parent: FireworkParticle): void {
        const secondaryCount = Math.floor(this.options.particlesPerExplosion * 0.3); // 30% of normal

        for (let i = 0; i < secondaryCount; i++) {
            const angle = (i / secondaryCount) * Math.PI * 2 + randomRange(-0.2, 0.2);
            const speed = randomFromRange(this.options.explosionSpeed) * 0.5;

            const particle: FireworkParticle = {
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
                stage: 2  // Stage 2 - no more explosions
            };

            this.particles.push(particle);
        }
    }

    /** Get warm ember color variant */
    private getEmberColor(baseColor: string): string {
        const emberColors = ['#ffaa00', '#ff6600', '#ff4400', '#ffcc00', '#ff8800', '#ffffff'];
        if (Math.random() < 0.7) {
            // 70% chance of ember colors
            return emberColors[Math.floor(Math.random() * emberColors.length)];
        }
        return baseColor;
    }

    /** Helper to create a single explosion particle */
    private createExplosionParticle(
        rocket: FireworkParticle,
        color: string,
        angle: number,
        speed: number,
        gravity?: number
    ): FireworkParticle {
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
            gravity: gravity ?? this.options.gravity,
            stage: rocket.stage + 1
        };
    }

    private getVariantColor(baseColor: string): string {
        if (Math.random() < 0.2) {
            return '#ffffff';
        }
        if (Math.random() < 0.3) {
            return this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
        }
        return baseColor;
    }

    private removeParticle(particle: FireworkParticle): void {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }

    private animate = (currentTime: number): void => {
        if (!this.isRunning || !this.renderer) return;

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
        const particlesToRemove: FireworkParticle[] = [];
        const particlesToExplode: FireworkParticle[] = [];

        for (const particle of this.particles) {
            particle.age += deltaTime;

            if (particle.phase === 'rocket') {
                particle.x += particle.vx * deltaTime * 0.1;
                particle.y += particle.vy * deltaTime * 0.1;
                particle.vy += 0.01 * deltaTime;

                const targetY = particle.targetY ?? 0;
                if (particle.y <= targetY || particle.age >= particle.maxAge || particle.vy >= 0) {
                    particlesToExplode.push(particle);
                }

                particle.opacity = Math.max(0.5, 1 - (particle.age / particle.maxAge) * 0.3);
            } else {
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
                    // Mark as already triggered secondary explosion
                    particle.targetY = -1;
                    particlesToExplode.push(particle);
                }

                if (particle.age >= particle.maxAge) {
                    particlesToRemove.push(particle);
                }
            }
        }

        // Handle explosions
        for (const rocket of particlesToExplode) {
            if (rocket.stage === 1) {
                // Stage 1 particle: trigger secondary explosion with smaller particles
                this.explodeSecondary(rocket);
            } else {
                // Rocket: normal explosion
                this.explode(rocket);
            }
            particlesToRemove.push(rocket);
        }

        // Remove dead particles
        for (const particle of particlesToRemove) {
            this.removeParticle(particle);
        }

        // Render all particles
        this.renderer.clear();

        const renderData: RenderFireworkParticle[] = this.particles.map(p => ({
            x: p.x,
            y: p.y,
            size: p.size,
            opacity: p.opacity,
            color: p.color
        }));

        this.renderer.drawFireworkParticles(renderData);

        this.animationId = requestAnimationFrame(this.animate);
    };

    /** Start the fireworks */
    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = 0;
        this.lastLaunchTime = 0;
        this.animationId = requestAnimationFrame(this.animate);
    }

    /** Stop the fireworks */
    stop(): void {
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /** Clear all particles but keep running */
    clear(): void {
        this.particles = [];
        if (this.renderer) {
            this.renderer.clear();
        }
    }

    /** Launch a single firework manually */
    launch(): void {
        this.launchRocket();
    }

    /** Launch multiple fireworks at once */
    burst(count: number = 5): void {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.launchRocket(), i * 100);
        }
    }

    /** Update options */
    setOptions(newOptions: Partial<FireworksOptions>): void {
        if (newOptions.colors) this.options.colors = newOptions.colors;
        if (newOptions.launchRate !== undefined) this.options.launchRate = newOptions.launchRate;
        if (newOptions.particlesPerExplosion !== undefined) this.options.particlesPerExplosion = newOptions.particlesPerExplosion;
        if (newOptions.rocketSpeed) this.options.rocketSpeed = newOptions.rocketSpeed;
        if (newOptions.explosionSpeed) this.options.explosionSpeed = newOptions.explosionSpeed;
        if (newOptions.particleSize) this.options.particleSize = newOptions.particleSize;
        if (newOptions.particleLifetime) this.options.particleLifetime = newOptions.particleLifetime;
        if (newOptions.gravity !== undefined) this.options.gravity = newOptions.gravity;
        if (newOptions.explosionPattern) this.options.explosionPattern = newOptions.explosionPattern;
    }

    /** Get particle count */
    getParticleCount(): number {
        return this.particles.length;
    }

    /** Check if running */
    getIsRunning(): boolean {
        return this.isRunning;
    }

    /** Destroy and cleanup */
    destroy(): void {
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
    }
}
