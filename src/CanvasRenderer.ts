/**
 * CanvasRenderer - Handles canvas-based rendering for particle effects
 * Provides high-performance drawing of emojis and images
 */

import { isBrowser } from './utils';

/** Cached emoji/image for fast drawing */
interface CachedSprite {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    width: number;
    height: number;
}

const SPRITE_CACHE_MAX = 100;

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

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private spriteCache: Map<string, CachedSprite> = new Map();
    private imageCache: Map<string, HTMLImageElement> = new Map();
    private width: number = 0;
    private height: number = 0;

    constructor(container: HTMLElement, zIndex: number = 9999) {
        if (!isBrowser()) {
            throw new Error('[falling-animation] CanvasRenderer requires a browser environment.');
        }

        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'falling-animation-canvas';

        // Get 2D context
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('[falling-animation] Could not get 2D context from canvas.');
        }
        this.ctx = ctx;

        // Set canvas styles
        const isBody = container === document.body;
        Object.assign(this.canvas.style, {
            position: isBody ? 'fixed' : 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: String(zIndex)
        });

        // Ensure container has position for absolute canvas
        if (!isBody) {
            const containerPosition = getComputedStyle(container).position;
            if (containerPosition === 'static') {
                container.style.position = 'relative';
            }
        }

        // Append to container
        container.appendChild(this.canvas);

        // Set initial size
        this.resize();
    }

    /**
     * Resize canvas to match container
     */
    resize(): void {
        const isFixed = this.canvas.style.position === 'fixed';
        const rect = isFixed
            ? { width: window.innerWidth, height: window.innerHeight }
            : this.canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            const dpr = window.devicePixelRatio || 1;
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            // Reset transform before scaling to prevent accumulation on repeated resizes
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(dpr, dpr);
        }
    }

    /**
     * Get container dimensions
     */
    getSize(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    /**
     * Clear the entire canvas.
     * @param trail If true, fades out existing content instead of hard clear
     */
    clear(trail: boolean = false): void {
        if (trail) {
            // "Trail trick": fill with semi-transparent black to create trails
            // Adjust opacity for longer/shorter trails (current: very long trails)
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Pre-cache an emoji as a sprite for fast drawing (HiDPI aware)
     */
    private cacheEmoji(content: string, size: number): CachedSprite {
        const dpr = window.devicePixelRatio || 1;
        const key = `emoji:${content}:${size}:${dpr}`;

        if (this.spriteCache.has(key)) {
            return this.spriteCache.get(key)!;
        }

        // Create off-screen canvas for the emoji at HiDPI resolution
        const spriteCanvas = document.createElement('canvas');
        const padding = size * 0.3; // Padding for effects and emoji overflow
        const logicalSize = size + padding * 2;
        const physicalSize = logicalSize * dpr;

        spriteCanvas.width = physicalSize;
        spriteCanvas.height = physicalSize;

        const spriteCtx = spriteCanvas.getContext('2d')!;

        // Scale for HiDPI
        spriteCtx.scale(dpr, dpr);

        // High quality rendering
        spriteCtx.imageSmoothingEnabled = true;
        spriteCtx.imageSmoothingQuality = 'high';

        // Draw emoji with proper font settings
        const fontSize = size * 1.0; // Emoji font size
        spriteCtx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", "EmojiOne", sans-serif`;
        spriteCtx.textAlign = 'center';
        spriteCtx.textBaseline = 'middle';
        spriteCtx.fillText(content, logicalSize / 2, logicalSize / 2);

        const sprite: CachedSprite = {
            canvas: spriteCanvas,
            width: logicalSize,
            height: logicalSize
        };

        // Evict oldest entry if cache is full
        if (this.spriteCache.size >= SPRITE_CACHE_MAX) {
            const firstKey = this.spriteCache.keys().next().value;
            if (firstKey !== undefined) this.spriteCache.delete(firstKey);
        }
        this.spriteCache.set(key, sprite);
        return sprite;
    }

    /**
     * Pre-load an image
     */
    preloadImage(src: string): Promise<HTMLImageElement> {
        if (this.imageCache.has(src)) {
            return Promise.resolve(this.imageCache.get(src)!);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Draw a single particle (emoji or image)
     */
    drawParticle(particle: RenderParticle): void {
        const { x, y, rotation, size, opacity, content, type } = particle;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.translate(x, y);
        this.ctx.rotate((rotation * Math.PI) / 180);

        if (type === 'emoji') {
            const sprite = this.cacheEmoji(content, Math.round(size));
            this.ctx.drawImage(
                sprite.canvas,
                -sprite.width / 2,
                -sprite.height / 2,
                sprite.width,
                sprite.height
            );
        } else if (type === 'image') {
            const img = this.imageCache.get(content);
            if (img) {
                this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
            }
        }

        this.ctx.restore();
    }

    /**
     * Draw multiple particles efficiently
     */
    drawParticles(particles: RenderParticle[]): void {
        for (const particle of particles) {
            this.drawParticle(particle);
        }
    }

    /**
     * Draw a firework particle (glowing circle)
     */
    drawFireworkParticle(particle: RenderFireworkParticle): void {
        const { x, y, size, opacity, color } = particle;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        // Draw glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = size * 2;

        // Draw particle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw multiple firework particles
     */
    drawFireworkParticles(particles: RenderFireworkParticle[]): void {
        for (const particle of particles) {
            this.drawFireworkParticle(particle);
        }
    }

    /**
     * Destroy the renderer and remove canvas from DOM
     */
    destroy(): void {
        this.canvas.remove();
        this.spriteCache.clear();
        this.imageCache.clear();
    }
}
