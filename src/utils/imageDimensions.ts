// Shared helpers for responsive R2 images. Kept free of `astro:assets` so the
// remark plugin (loaded from astro.config.mjs) can import it too.
//
// Image sizes come from `src/data/image-dimensions.json`, written by
// `scripts/cache-image-dimensions.js`. Knowing sizes up front means the build
// never has to fetch an image just to measure it, and an image missing from
// the manifest (new, broken or deleted) falls back to a plain <img> instead of
// failing the build.

import dimensionManifest from '../data/image-dimensions.json';

export const R2_HOST = 'storage.sajalchoudhary.net';

// Layout hint for images in a prose column (about 42rem wide), and the
// largest width generated for them (2x for high-density screens).
export const PROSE_SIZES = '(max-width: 48rem) 100vw, 42rem';
export const PROSE_MAX_WIDTH = 1600;

// Candidate srcset widths. Each image uses the ones below its own cap.
const BREAKPOINTS = [320, 480, 640, 800, 1080, 1280, 1600, 2048];

const manifest = dimensionManifest as Record<string, [number, number]>;

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ResponsivePlan extends ImageDimensions {
    /** srcset widths, ascending, never larger than the original. */
    widths: number[];
}

// Some migrated frontmatter carries smart quotes around URLs
export function cleanImageUrl(url: string): string {
    return url.replace(/[“”"']/g, '').trim();
}

export function isR2Image(url: string): boolean {
    try {
        return new URL(url).hostname === R2_HOST;
    } catch {
        return false;
    }
}

function safeDecode(url: string): string {
    try {
        return decodeURI(url);
    } catch {
        return url;
    }
}

export function getImageDimensions(url: string): ImageDimensions | undefined {
    const cleaned = cleanImageUrl(url);
    // Markdown parsing percent-encodes some characters; the manifest stores
    // URLs as written in the source files.
    const entry = manifest[cleaned] ?? manifest[safeDecode(cleaned)];
    return entry ? { width: entry[0], height: entry[1] } : undefined;
}

/**
 * Size plan for an R2 image shown at most `maxWidth` CSS pixels wide (pass
 * twice the layout width so high-density screens stay sharp). Returns
 * undefined for non-R2 images and images missing from the manifest.
 */
export function planResponsiveImage(url: string, maxWidth: number): ResponsivePlan | undefined {
    if (!isR2Image(url)) {
        return undefined;
    }
    const original = getImageDimensions(url);
    if (!original) {
        return undefined;
    }

    const width = Math.min(original.width, maxWidth);
    const height = Math.round((width * original.height) / original.width);
    const widths = BREAKPOINTS.filter((w) => w < width);
    widths.push(width);

    return { width, height, widths };
}
