// Shared settings for remote images. Imported by astro.config.mjs, so this
// module must not import `astro:assets`.

// Hosts whose images Astro may download and optimize at build time.
export const REMOTE_IMAGE_DOMAINS = ['storage.sajalchoudhary.net'];

// Post media max out around the 65ch prose column (~750px); 2x covers retina.
export const CONTENT_IMAGE_WIDTHS = [750, 1500];
export const CONTENT_IMAGE_SIZES = '(min-width: 50rem) 750px, 100vw';

export function isOptimizableRemoteImage(src: unknown): src is string {
    if (typeof src !== 'string' || !src) {
        return false;
    }
    try {
        return REMOTE_IMAGE_DOMAINS.includes(new URL(src).hostname);
    } catch {
        return false;
    }
}

/**
 * Output size and srcset widths for a post image: capped at the largest
 * content width, original aspect ratio kept, never upscaled.
 */
export function fitContentImage(original: { width: number; height: number }) {
    const maxWidth = CONTENT_IMAGE_WIDTHS[CONTENT_IMAGE_WIDTHS.length - 1];
    const width = Math.min(original.width, maxWidth);
    const height = Math.round((original.height * width) / original.width);
    const widths = [...CONTENT_IMAGE_WIDTHS.filter((w) => w < width), width];
    return { width, height, widths };
}
