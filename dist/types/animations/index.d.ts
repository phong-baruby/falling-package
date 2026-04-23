/**
 * Animation functions for falling particles
 * Each animation modifies particle state based on deltaTime and elapsed time
 */
import { AnimationFunction, AnimationRegistry } from '../types';
/**
 * Simple vertical fall - no special effects
 */
export declare const fall: AnimationFunction;
/**
 * Swing - pendulum-like swinging motion while falling
 */
export declare const swing: AnimationFunction;
/**
 * Rotate - continuous 360° rotation while falling
 */
export declare const rotate: AnimationFunction;
/**
 * Flutter - butterfly-like fluttering motion
 */
export declare const flutter: AnimationFunction;
/**
 * Spiral - spiraling down pattern
 */
export declare const spiral: AnimationFunction;
/**
 * Tumble - chaotic tumbling motion
 */
export declare const tumble: AnimationFunction;
/**
 * Zigzag - zigzag falling pattern
 */
export declare const zigzag: AnimationFunction;
/**
 * Float - slow floating descent with gentle movement
 */
export declare const float: AnimationFunction;
/**
 * Animation registry - all available animations
 */
export declare const animations: AnimationRegistry;
/**
 * Get animation function by name
 */
export declare function getAnimation(name: string): AnimationFunction;
