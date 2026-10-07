import { getImage } from 'astro:assets';
import { CONTENT_IMAGE_SIZES, fitContentImage, isOptimizableRemoteImage } from './imageDomains';
import { describeProbeFailure, getRemoteImageSize } from './remoteImageSize';

// Remote images live in the R2 bucket. Astro downloads, resizes and converts
// them at build time and keeps the results in node_modules/.astro, which the
// Cloudflare Pages build cache carries between deploys. Every image is probed
// (once, then cached) before Astro queues it; an image that cannot be reached
// keeps its original URL, so a bad link never fails a build.

export type ImageAttributes = Record<string, string | number | boolean | undefined>;

function toAttributes(image: Awaited<ReturnType<typeof getImage>>): ImageAttributes {
    const attributes: ImageAttributes = { ...image.attributes, src: image.src };
    if (image.srcSet.attribute) {
        attributes.srcset = image.srcSet.attribute;
    }
    return attributes;
}

async function warnFallback(src: string, error: unknown) {
    console.warn(`[images] Using original URL for ${src}: ${await describeProbeFailure(src, error)}`);
}

/**
 * Responsive attributes for a post image (hero, gallery slide). Keeps the
 * original aspect ratio and never upscales.
 */
export async function getContentImageAttributes(
    src: string,
    { loading = 'lazy' }: { loading?: 'eager' | 'lazy' } = {}
): Promise<ImageAttributes> {
    const plain = { src, loading, decoding: 'async' };
    if (!isOptimizableRemoteImage(src)) {
        return plain;
    }
    try {
        const { width, height, widths } = fitContentImage(await getRemoteImageSize(src));
        const image = await getImage({
            src,
            width,
            height,
            widths,
            sizes: CONTENT_IMAGE_SIZES,
            format: 'webp',
            loading,
        });
        return toAttributes(image);
    } catch (error) {
        await warnFallback(src, error);
        return plain;
    }
}

/**
 * Attributes for a square, center-cropped thumbnail (Nordletter covers).
 */
export async function getSquareImageAttributes(
    src: string,
    size: number,
    sizes: string
): Promise<ImageAttributes> {
    const plain = { src, width: size, height: size, loading: 'lazy', decoding: 'async' };
    if (!isOptimizableRemoteImage(src)) {
        return plain;
    }
    try {
        // The size itself is not needed, but a successful (cached) probe
        // confirms the image is reachable before Astro queues it for download.
        await getRemoteImageSize(src);
        const image = await getImage({
            src,
            width: size,
            height: size,
            fit: 'cover',
            widths: [Math.round(size / 2), size],
            sizes,
            format: 'webp',
        });
        return toAttributes(image);
    } catch (error) {
        await warnFallback(src, error);
        return plain;
    }
}
