/**
 * Utility functions for falling-animation
 */
import { RangeValue } from './types';
/**
 * Generate a random number between min and max
 */
export declare function randomRange(min: number, max: number): number;
/**
 * Generate a random number from a RangeValue
 */
export declare function randomFromRange(range: RangeValue): number;
/**
 * Pick a random item from an array
 */
export declare function randomPick<T>(array: T[]): T;
/**
 * Pick a random item based on weights
 */
export declare function weightedRandomPick<T extends {
    weight?: number;
}>(items: T[]): T;
export declare function generateId(): number;
/**
 * Check if code is running in browser environment
 */
export declare function isBrowser(): boolean;
/**
 * Resolve container from element or selector
 * Throws an error if called in non-browser environment
 */
export declare function resolveContainer(container: HTMLElement | string | undefined): HTMLElement;
/**
 * Throttle function calls
 */
export declare function throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): T;
