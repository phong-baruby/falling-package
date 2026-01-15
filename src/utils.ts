/**
 * Utility functions for falling-animation
 */

import { RangeValue } from './types';

/**
 * Generate a random number between min and max
 */
export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random number from a RangeValue
 */
export function randomFromRange(range: RangeValue): number {
    return randomRange(range.min, range.max);
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random item from an array
 */
export function randomPick<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick a random item based on weights
 */
export function weightedRandomPick<T extends { weight?: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        random -= item.weight ?? 1;
        if (random <= 0) {
            return item;
        }
    }

    return items[items.length - 1];
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Generate a unique ID
 */
let idCounter = 0;
export function generateId(): number {
    return ++idCounter;
}

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Resolve container from element or selector
 * Throws an error if called in non-browser environment
 */
export function resolveContainer(container: HTMLElement | string | undefined): HTMLElement {
    if (!isBrowser()) {
        throw new Error(
            '[falling-animation] This library requires a browser environment. ' +
            'If using SSR (Next.js, Nuxt, etc.), make sure to only initialize on the client side.'
        );
    }

    if (!container) {
        return document.body;
    }

    if (typeof container === 'string') {
        const element = document.querySelector<HTMLElement>(container);
        if (!element) {
            console.warn(`[falling-animation] Container "${container}" not found, using document.body`);
            return document.body;
        }
        return element;
    }

    return container;
}

/**
 * Create a style string from object
 */
export function styleToString(styles: Record<string, string | number>): string {
    return Object.entries(styles)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${value}`;
        })
        .join('; ');
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
): T {
    let inThrottle = false;

    return function (this: unknown, ...args: unknown[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    } as T;
}
