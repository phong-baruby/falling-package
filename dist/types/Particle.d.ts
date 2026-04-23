/**
 * Particle class - manages individual falling objects (Canvas-based, no DOM)
 */
import { ParticleState, FallingObjectType, AnimationType, ResolvedOptions } from './types';
export declare class Particle implements ParticleState {
    id: number;
    content: string;
    objectType: FallingObjectType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    size: number;
    opacity: number;
    animation: AnimationType;
    age: number;
    phase: number;
    data: Record<string, number>;
    private containerWidth;
    private containerHeight;
    private animationFn;
    constructor(options: ResolvedOptions, containerWidth: number, containerHeight: number);
    /**
     * Initialize animation-specific data
     */
    private initAnimationData;
    /**
     * Update particle state
     */
    update(deltaTime: number, elapsed: number): void;
    /**
     * Check if particle is out of bounds
     */
    isOutOfBounds(): boolean;
    /**
     * Update container dimensions (for resize handling)
     */
    updateContainerSize(width: number, height: number): void;
}
