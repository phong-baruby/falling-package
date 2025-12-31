/**
 * falling-animation
 * A lightweight, customizable falling objects animation library
 * 
 * @author phongdh
 * @license MIT
 */

// Main class
export { FallingAnimation } from './FallingAnimation';

// Types
export type {
    FallingAnimationOptions,
    FallingObject,
    FallingObjectType,
    AnimationType,
    RangeValue
} from './types';

// Animations (for advanced usage)
export { animations, getAnimation } from './animations';

// Default export
import { FallingAnimation } from './FallingAnimation';
export default FallingAnimation;
