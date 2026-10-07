import { CONTENT_IMAGE_SIZES, fitContentImage, isOptimizableRemoteImage } from './imageDomains';
import { getRemoteImageSize } from './remoteImageSize';

// Markdown images on the R2 bucket are optimized by Astro (image.domains).
// Left alone, Astro would keep each image at its full original size and
// probe its dimensions on every build. This plugin runs just before Astro's
// image step and gives each image a capped width, height and srcset, using
// the cached sizes. If an image cannot be reached it is removed from Astro's
// list and stays a plain <img>, so one broken link never fails the build.

interface HastNode {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
}

interface AstroVFileData {
    astro?: { remoteImagePaths?: string[] };
}

function collectImages(node: HastNode, found: HastNode[]) {
    if (node.type === 'element' && node.tagName === 'img') {
        found.push(node);
    }
    node.children?.forEach((child) => collectImages(child, found));
}

export function rehypeRemoteImages() {
    return async (tree: HastNode, file: { data: AstroVFileData }) => {
        const remotePaths = file.data.astro?.remoteImagePaths;
        if (!remotePaths?.length) {
            return;
        }

        const images: HastNode[] = [];
        collectImages(tree, images);
        const unreachable = new Set<string>();

        await Promise.all(images.map(async (node) => {
            const props = node.properties ?? {};
            const src = props.src;
            if (!isOptimizableRemoteImage(src) || ('width' in props && 'height' in props)) {
                return;
            }
            try {
                const { width, height, widths } = fitContentImage(await getRemoteImageSize(src));
                node.properties = {
                    ...props,
                    width,
                    height,
                    widths,
                    sizes: CONTENT_IMAGE_SIZES,
                    format: 'webp',
                    loading: 'lazy',
                    decoding: 'async',
                };
            } catch (error) {
                const reason = error instanceof Error ? error.message : String(error);
                console.warn(`[images] Leaving ${src} unoptimized: ${reason}`);
                unreachable.add(decodeURI(src));
            }
        }));

        if (unreachable.size > 0) {
            file.data.astro!.remoteImagePaths = remotePaths.filter((p) => !unreachable.has(p));
        }
    };
}
