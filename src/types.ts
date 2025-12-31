/**
 * Type definitions for falling-animation package
 */

/** Object type that can fall */
export type FallingObjectType = 'emoji' | 'image' | 'html';

/** Single falling object configuration */
export interface FallingObject {
    /** Type of the object */
    type: FallingObjectType;
    /** Content: emoji string, image URL, or HTML string */
    content?: string;
    /** Image source (for type: 'image') */
    src?: string;
    /** Optional weight for random selection (default: 1) */
    weight?: number;
}

/** Range value for min/max configuration */
export interface RangeValue {
    min: number;
    max: number;
}

/** Available animation types */
export type AnimationType =
    | 'fall'      // Simple vertical fall
    | 'swing'     // Fall with pendulum swing
    | 'rotate'    // Fall with continuous rotation
    | 'flutter'   // Butterfly-like flutter
    | 'spiral'    // Spiral falling pattern
    | 'tumble'    // Random tumbling
    | 'zigzag'    // Zigzag pattern
    | 'float';    // Slow floating down

/** Animation function signature */
export type AnimationFunction = (
    particle: ParticleState,
    deltaTime: number,
    elapsed: number
) => void;

/** Internal particle state */
export interface ParticleState {
    /** Unique identifier */
    id: number;
    /** DOM element reference */
    element: HTMLElement;
    /** Current X position */
    x: number;
    /** Current Y position */
    y: number;
    /** Horizontal velocity */
    vx: number;
    /** Vertical velocity (speed) */
    vy: number;
    /** Current rotation angle (degrees) */
    rotation: number;
    /** Rotation speed (degrees per frame) */
    rotationSpeed: number;
    /** Particle size */
    size: number;
    /** Particle opacity */
    opacity: number;
    /** Animation type for this particle */
    animation: AnimationType;
    /** Time since spawn (ms) */
    age: number;
    /** Animation-specific phase offset */
    phase: number;
    /** Additional animation data */
    data: Record<string, number>;
}

/** Main configuration options */
export interface FallingAnimationOptions {
    /** Container element or selector (default: document.body) */
    container?: HTMLElement | string;

    /** Array of objects to fall */
    objects: FallingObject[];

    /** Falling speed range in pixels per frame (default: { min: 2, max: 5 }) */
    speed?: RangeValue;

    /** Number of objects spawned per second (default: 3) */
    spawnRate?: number;

    /** Maximum concurrent particles (default: 50) */
    maxParticles?: number;

    /** Animation type(s) to use (default: 'fall') */
    animation?: AnimationType | AnimationType[];

    /** Object size range in pixels (default: { min: 20, max: 40 }) */
    size?: RangeValue;

    /** Object opacity range (default: { min: 0.6, max: 1 }) */
    opacity?: RangeValue;

    /** Wind effect (-1 to 1, default: 0) */
    wind?: number;

    /** Auto start animation (default: true) */
    autoStart?: boolean;

    /** Z-index for the container (default: 9999) */
    zIndex?: number;

    /** Enable responsive behavior (default: true) */
    responsive?: boolean;
}

/** Resolved options with all defaults applied */
export interface ResolvedOptions {
    container: HTMLElement;
    objects: FallingObject[];
    speed: RangeValue;
    spawnRate: number;
    maxParticles: number;
    animation: AnimationType[];
    size: RangeValue;
    opacity: RangeValue;
    wind: number;
    autoStart: boolean;
    zIndex: number;
    responsive: boolean;
}

/** Animation registry type */
export type AnimationRegistry = Record<AnimationType, AnimationFunction>;
