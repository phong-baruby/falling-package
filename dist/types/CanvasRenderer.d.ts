/**
 * CanvasRenderer - Handles canvas-based rendering for particle effects
 * Provides high-performance drawing of emojis and images
 */
/** Particle data for rendering */
export interface RenderParticle {
    x: number;
    y: number;
    rotation: number;
    size: number;
    opacity: number;
    content: string;
    type: 'emoji' | 'image';
}
/** Firework particle data for rendering */
export interface RenderFireworkParticle {
    x: number;
    y: number;
    size: number;
    opacity: number;
    color: string;
}
export declare class CanvasRenderer {
    private canvas;
    private ctx;
    private spriteCache;
    private imageCache;
    private width;
    private height;
    constructor(container: HTMLElement, zIndex?: number);
    /**
     * Resize canvas to match container
     */
    resize(): void;
    /**
     * Get container dimensions
     */
    getSize(): {
        width: number;
        height: number;
    };
    /**
     * Clear the entire canvas.
     * @param trail If true, fades out existing content instead of hard clear
     */
    clear(trail?: boolean): void;
    /**
     * Pre-cache an emoji as a sprite for fast drawing (HiDPI aware)
     */
    private cacheEmoji;
    /**
     * Pre-load an image
     */
    preloadImage(src: string): Promise<HTMLImageElement>;
    /**
     * Draw a single particle (emoji or image)
     */
    drawParticle(particle: RenderParticle): void;
    /**
     * Draw multiple particles efficiently
     */
    drawParticles(particles: RenderParticle[]): void;
    /**
     * Draw a firework particle (glowing circle)
     */
    drawFireworkParticle(particle: RenderFireworkParticle): void;
    /**
     * Draw multiple firework particles
     */
    drawFireworkParticles(particles: RenderFireworkParticle[]): void;
    /**
     * Destroy the renderer and remove canvas from DOM
     */
    destroy(): void;
}
