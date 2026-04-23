/**
 * falling-animation
 * A lightweight, customizable falling objects animation library
 *
 * @author phongdh
 * @license MIT
 */
export { FallingAnimation } from './FallingAnimation';
export { Fireworks } from './Fireworks';
export type { FallingAnimationOptions, FallingObject, FallingObjectType, AnimationType, RangeValue } from './types';
export type { FireworksOptions, ExplosionPattern } from './Fireworks';
export { animations, getAnimation } from './animations';
export { isBrowser } from './utils';
import { FallingAnimation } from './FallingAnimation';
export default FallingAnimation;
