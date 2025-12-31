/**
 * Particle class - manages individual falling objects
 */

import {
    ParticleState,
    FallingObject,
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
    element: HTMLElement;
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
    private options: ResolvedOptions;

    constructor(options: ResolvedOptions) {
        this.options = options;
        this.id = generateId();
        this.age = 0;
        this.phase = Math.random() * Math.PI * 2;
        this.data = {};

        // Get container dimensions
        this.containerWidth = options.container.clientWidth;
        this.containerHeight = options.container.clientHeight;

        // Pick random object
        const object = weightedRandomPick(options.objects);

        // Initialize position at top with random x
        this.x = randomRange(-50, this.containerWidth + 50);
        this.y = -50;

        // Initialize velocity (apply speed multiplier for intuitive units)
        // speed=1 → ~40px/s (1cm/s), speed=0.1 → ~4px/s (1mm/s)
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

        // Create DOM element
        this.element = this.createElement(object);
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
     * Create DOM element for the particle
     */
    private createElement(object: FallingObject): HTMLElement {
        const element = document.createElement('div');
        element.className = 'falling-particle';
        element.setAttribute('data-particle-id', String(this.id));

        // Set content based on type
        switch (object.type) {
            case 'emoji':
                element.textContent = object.content ?? '❄️';
                element.style.fontSize = `${this.size}px`;
                element.style.lineHeight = '1';
                break;

            case 'image':
                const img = document.createElement('img');
                img.src = object.src ?? object.content ?? '';
                img.alt = '';
                img.style.width = `${this.size}px`;
                img.style.height = `${this.size}px`;
                img.style.objectFit = 'contain';
                img.draggable = false;
                element.appendChild(img);
                break;

            case 'html':
                element.innerHTML = object.content ?? '';
                break;
        }

        // Apply base styles
        Object.assign(element.style, {
            position: 'absolute',
            pointerEvents: 'none',
            userSelect: 'none',
            willChange: 'transform, opacity',
            opacity: String(this.opacity),
            left: '0',
            top: '0',
            transform: this.getTransform()
        });

        return element;
    }

    /**
     * Get CSS transform string
     */
    private getTransform(): string {
        return `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg)`;
    }

    /**
     * Update particle state
     */
    update(deltaTime: number, elapsed: number): void {
        this.age += deltaTime;

        // Apply animation
        const animationFn = getAnimation(this.animation);
        animationFn(this, deltaTime, elapsed);

        // Update DOM
        this.element.style.transform = this.getTransform();
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

    /**
     * Remove particle from DOM
     */
    destroy(): void {
        this.element.remove();
    }
}
