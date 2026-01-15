/**
 * falling-animation
 * A lightweight, customizable falling objects animation library
 * 
 * @author phongdh
 * @license MIT
 */

// Main classes
export { FallingAnimation } from './FallingAnimation';
export { Fireworks } from './Fireworks';

// Types
export type {
    FallingAnimationOptions,
    FallingObject,
    FallingObjectType,
    AnimationType,
    RangeValue
} from './types';

export type { FireworksOptions } from './Fireworks';

// Animations (for advanced usage)
export { animations, getAnimation } from './animations';

// Utilities
export { isBrowser } from './utils';

// Default export
import { FallingAnimation } from './FallingAnimation';
export default FallingAnimation;
