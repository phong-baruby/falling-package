/**
 * Fireworks Animation - Creates realistic firework effects
 * 
 * Features:
 * - Rockets shooting up from bottom
 * - Explosions spreading particles in all directions (360°)
 * - Gravity effect on particles
 * - Fade out over time
 * - Trail effects
 */

import { RangeValue } from './types';
import { randomRange, randomFromRange, generateId, throttle } from './utils';

/** Firework particle state */
interface FireworkParticle {
    id: number;
    element: HTMLElement;
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
}

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

/** Default configuration */
const DEFAULTS: Required<Omit<FireworksOptions, 'container'>> = {
    colors: DEFAULT_COLORS,
    launchRate: 1,
    particlesPerExplosion: 50,
    rocketSpeed: { min: 8, max: 15 },
    explosionSpeed: { min: 2, max: 8 },
    particleSize: { min: 2, max: 6 },
    particleLifetime: { min: 1000, max: 2000 },
    gravity: 0.1,
    trail: true,
    autoStart: true,
    zIndex: 9999
};

export class Fireworks {
    private options: Required<FireworksOptions> & { container: HTMLElement };
    private particles: FireworkParticle[] = [];
    private wrapper: HTMLElement | null = null;
    private isRunning = false;
    private animationId: number | null = null;
    private lastLaunchTime = 0;
    private lastFrameTime = 0;
    private resizeHandler: (() => void) | null = null;

    constructor(options: FireworksOptions = {}) {
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
            autoStart: options.autoStart ?? DEFAULTS.autoStart,
            zIndex: options.zIndex ?? DEFAULTS.zIndex
        };

        this.createWrapper();
        this.setupResizeHandler();

        if (this.options.autoStart) {
            this.start();
        }
    }

    private createWrapper(): void {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'fireworks-wrapper';

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

        if (this.options.container !== document.body) {
            const containerPosition = getComputedStyle(this.options.container).position;
            if (containerPosition === 'static') {
                this.options.container.style.position = 'relative';
            }
        }

        this.options.container.appendChild(this.wrapper);
    }

    private setupResizeHandler(): void {
        this.resizeHandler = throttle(() => {
            // Handle resize if needed
        }, 200);
        window.addEventListener('resize', this.resizeHandler);
    }

    private getContainerSize(): { width: number; height: number } {
        return {
            width: this.options.container.clientWidth,
            height: this.options.container.clientHeight
        };
    }

    private createParticleElement(particle: FireworkParticle): HTMLElement {
        const element = document.createElement('div');
        element.className = 'firework-particle';

        Object.assign(element.style, {
            position: 'absolute',
            left: '0',
            top: '0',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            opacity: String(particle.opacity),
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            transform: `translate3d(${particle.x}px, ${particle.y}px, 0)`
        });

        return element;
    }

    private launchRocket(): void {
        const { width, height } = this.getContainerSize();
        const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];

        // Random explosion height: 10% to 90% from top of screen
        const targetY = randomRange(height * 0.1, height * 0.9);
        const distanceToTravel = height - targetY;

        // Calculate time based on distance and speed
        const rocketSpeed = randomFromRange(this.options.rocketSpeed);
        const travelTime = distanceToTravel / (rocketSpeed * 0.1); // approximate time in ms

        const particle: FireworkParticle = {
            id: generateId(),
            element: null as unknown as HTMLElement,
            x: randomRange(width * 0.1, width * 0.9),
            y: height + 10, // Start slightly below viewport
            vx: randomRange(-0.5, 0.5),
            vy: -rocketSpeed,
            size: 4,
            opacity: 1,
            color,
            age: 0,
            maxAge: Math.min(travelTime, 3000), // Cap at 3 seconds
            phase: 'rocket',
            gravity: 0,
            targetY // Store target explosion height
        } as FireworkParticle & { targetY: number };

        particle.element = this.createParticleElement(particle);
        this.particles.push(particle);

        if (this.wrapper) {
            this.wrapper.appendChild(particle.element);
        }
    }

    private explode(rocket: FireworkParticle): void {
        const particleCount = this.options.particlesPerExplosion;
        const color = rocket.color;

        // Create explosion particles spreading in all directions
        for (let i = 0; i < particleCount; i++) {
            // Spread evenly in 360 degrees
            const angle = (i / particleCount) * Math.PI * 2 + randomRange(-0.1, 0.1);
            const speed = randomFromRange(this.options.explosionSpeed);

            const particle: FireworkParticle = {
                id: generateId(),
                element: null as unknown as HTMLElement,
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
                gravity: this.options.gravity
            };

            particle.element = this.createParticleElement(particle);
            this.particles.push(particle);

            if (this.wrapper) {
                this.wrapper.appendChild(particle.element);
            }
        }
    }

    private getVariantColor(baseColor: string): string {
        // Sometimes return white or a lighter variant for sparkle effect
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
            particle.element.remove();
        }
    }

    private animate = (currentTime: number): void => {
        if (!this.isRunning) return;

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
                // Update rocket
                particle.x += particle.vx * deltaTime * 0.1;
                particle.y += particle.vy * deltaTime * 0.1;
                particle.vy += 0.01 * deltaTime; // Slow down slightly as it rises

                // Check if ready to explode (reached target height or max age)
                const targetY = (particle as unknown as { targetY: number }).targetY ?? 0;
                if (particle.y <= targetY || particle.age >= particle.maxAge || particle.vy >= 0) {
                    particlesToExplode.push(particle);
                }

                // Trail effect - dim the rocket slightly
                particle.opacity = Math.max(0.5, 1 - (particle.age / particle.maxAge) * 0.3);
            } else {
                // Update explosion particle
                particle.x += particle.vx * deltaTime * 0.1;
                particle.y += particle.vy * deltaTime * 0.1;
                particle.vy += particle.gravity * deltaTime * 0.01; // Apply gravity

                // Fade out
                const lifeProgress = particle.age / particle.maxAge;
                particle.opacity = Math.max(0, 1 - lifeProgress);

                // Slow down
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Check if dead
                if (particle.age >= particle.maxAge) {
                    particlesToRemove.push(particle);
                }
            }

            // Update DOM
            particle.element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
            particle.element.style.opacity = String(particle.opacity);
        }

        // Handle explosions
        for (const rocket of particlesToExplode) {
            this.explode(rocket);
            particlesToRemove.push(rocket);
        }

        // Remove dead particles
        for (const particle of particlesToRemove) {
            this.removeParticle(particle);
        }

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
        for (const particle of this.particles) {
            particle.element.remove();
        }
        this.particles = [];
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

        if (this.wrapper) {
            this.wrapper.remove();
            this.wrapper = null;
        }

        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
    }
}
