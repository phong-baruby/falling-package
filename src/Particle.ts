/**
 * Particle class - manages individual falling objects (Canvas-based, no DOM)
 */

import {
    ParticleState,
    FallingObject,
    FallingObjectType,
    AnimationType,
    ResolvedOptions
} from './types';
import {
    generateId,
    randomFromRange,
    randomRange,
    weightedRandomPick,
    randomPick
} from './utils';
import { getAnimation } from './animations';

/**
 * Speed multiplier to convert user-friendly speed units to px/ms
 * speed = 1 means ~40 pixels per second (~1cm/s at 96 DPI)
 * speed = 0.1 means ~4 pixels per second (~1mm/s)
 * speed = 0 means standing still
 */
const SPEED_MULTIPLIER = 0.04; // 40 px/s per unit, divided by 1000 for ms

export class Particle implements ParticleState {
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

    private containerWidth: number;
    private containerHeight: number;

    constructor(options: ResolvedOptions, containerWidth: number, containerHeight: number) {
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

        // Pick animation
        this.animation = randomPick(options.animation);

        // Initialize animation-specific data
        this.initAnimationData();
    }

    /**
     * Initialize animation-specific data
     */
    private initAnimationData(): void {
        if (this.animation === 'tumble') {
            this.data.tumbleSpeed = randomRange(3, 8);
            this.data.wobbleX = randomRange(0.01, 0.03);
            this.data.wobbleY = randomRange(0.005, 0.015);
        }
    }

    /**
     * Update particle state
     */
    update(deltaTime: number, elapsed: number): void {
        this.age += deltaTime;

        // Apply animation
        const animationFn = getAnimation(this.animation);
        animationFn(this, deltaTime, elapsed);
    }

    /**
     * Check if particle is out of bounds
     */
    isOutOfBounds(): boolean {
        return (
            this.y > this.containerHeight + 100 ||
            this.x < -100 ||
            this.x > this.containerWidth + 100
        );
    }

    /**
     * Update container dimensions (for resize handling)
     */
    updateContainerSize(width: number, height: number): void {
        this.containerWidth = width;
        this.containerHeight = height;
    }
}
