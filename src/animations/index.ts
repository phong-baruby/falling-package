/**
 * Animation functions for falling particles
 * Each animation modifies particle state based on deltaTime and elapsed time
 */

import { AnimationFunction, AnimationRegistry, ParticleState } from '../types';

/**
 * Simple vertical fall - no special effects
 */
export const fall: AnimationFunction = (particle, deltaTime) => {
    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    particle.y += particle.vy * deltaTime;
    particle.x += particle.vx * deltaTime;
};

/**
 * Swing - pendulum-like swinging motion while falling
 */
export const swing: AnimationFunction = (particle, deltaTime, elapsed) => {
    const swingAmplitude = 30; // pixels
    const swingFrequency = 0.002; // oscillations per ms

    // Slight rotation based on swing - always animate
    particle.rotation = Math.sin((elapsed + particle.phase) * swingFrequency) * 20;

    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    particle.y += particle.vy * deltaTime;

    // Calculate swing offset
    const swingOffset = Math.sin((elapsed + particle.phase) * swingFrequency) * swingAmplitude;
    particle.x += particle.vx * deltaTime + (swingOffset * 0.05);
};

/**
 * Rotate - continuous 360° rotation while falling
 */
export const rotate: AnimationFunction = (particle, deltaTime) => {
    // Continuous rotation - always animate
    particle.rotation += particle.rotationSpeed * deltaTime;

    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    particle.y += particle.vy * deltaTime;
    particle.x += particle.vx * deltaTime;
};

/**
 * Flutter - butterfly-like fluttering motion
 */
export const flutter: AnimationFunction = (particle, deltaTime, elapsed) => {
    const flutterFrequency = 0.005;

    // Tilt based on direction - always animate
    particle.rotation = Math.sin((elapsed + particle.phase) * flutterFrequency) * 30;

    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    const flutterAmplitude = 40;
    const verticalWobble = 0.3;

    // Horizontal flutter
    const flutter = Math.sin((elapsed + particle.phase) * flutterFrequency) * flutterAmplitude;
    particle.x += particle.vx * deltaTime + flutter * 0.03;

    // Vertical movement with slight wobble
    const wobble = Math.sin((elapsed + particle.phase) * flutterFrequency * 2) * verticalWobble;
    particle.y += (particle.vy + wobble) * deltaTime;
};

/**
 * Spiral - spiraling down pattern
 */
export const spiral: AnimationFunction = (particle, deltaTime, elapsed) => {
    const spiralSpeed = 0.003;
    const angle = (elapsed + particle.phase) * spiralSpeed;

    // Rotate with spiral - always animate
    particle.rotation = angle * (180 / Math.PI);

    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    const spiralRadius = 25;

    particle.y += particle.vy * deltaTime;

    // Spiral motion
    particle.x += particle.vx * deltaTime + Math.cos(angle) * spiralRadius * 0.02;
};

/**
 * Tumble - chaotic tumbling motion
 */
export const tumble: AnimationFunction = (particle, deltaTime, elapsed) => {
    const tumbleSpeed = particle.data.tumbleSpeed ?? 5;

    // Fast tumbling rotation - always animate
    particle.rotation += tumbleSpeed * deltaTime;

    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    const wobbleX = particle.data.wobbleX ?? 0.02;
    const wobbleY = particle.data.wobbleY ?? 0.01;

    particle.y += particle.vy * deltaTime;

    // Chaotic horizontal movement
    particle.x += particle.vx * deltaTime +
        Math.sin((elapsed + particle.phase) * wobbleX) * 20 * 0.02;

    // Add some vertical variation
    particle.y += Math.sin((elapsed + particle.phase * 1.5) * wobbleY) * 0.5;
};

/**
 * Zigzag - zigzag falling pattern
 */
export const zigzag: AnimationFunction = (particle, deltaTime, elapsed) => {
    const zigzagFrequency = 0.002;
    const period = 1 / zigzagFrequency;
    const t = ((elapsed + particle.phase) % period) / period;
    const triangleWave = Math.abs(t * 2 - 1) * 2 - 1;

    // Tilt in direction of movement - always animate
    particle.rotation = triangleWave * 25;

    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    const zigzagWidth = 50;

    particle.y += particle.vy * deltaTime;

    // Create zigzag using triangle wave
    particle.x += particle.vx * deltaTime + triangleWave * zigzagWidth * 0.02;
};

/**
 * Float - slow floating descent with gentle movement
 */
export const float: AnimationFunction = (particle, deltaTime, elapsed) => {
    const floatFrequency = 0.001;

    // Gentle rotation - always animate
    particle.rotation = Math.sin((elapsed + particle.phase) * floatFrequency) * 10;

    // Skip movement if speed is 0
    if (particle.vy === 0 && particle.vx === 0) return;

    const floatAmplitudeX = 20;
    const floatAmplitudeY = 5;

    // Very slow descent with vertical wobble
    const yWobble = Math.sin((elapsed + particle.phase) * floatFrequency * 2) * floatAmplitudeY;
    particle.y += (particle.vy * 0.5 + yWobble * 0.01) * deltaTime;

    // Gentle horizontal drift
    const xDrift = Math.sin((elapsed + particle.phase) * floatFrequency) * floatAmplitudeX;
    particle.x += particle.vx * deltaTime + xDrift * 0.01;
};

/**
 * Animation registry - all available animations
 */
export const animations: AnimationRegistry = {
    fall,
    swing,
    rotate,
    flutter,
    spiral,
    tumble,
    zigzag,
    float
};

/**
 * Get animation function by name
 */
export function getAnimation(name: string): AnimationFunction {
    return animations[name as keyof AnimationRegistry] ?? fall;
}
