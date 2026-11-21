// Prepares markdown images on R2 for Astro's image pipeline.
//
// With `storage.sajalchoudhary.net` in `image.domains`, Astro optimises every
// markdown image on that host, fetching each one to measure it and failing the
// build if a fetch fails. This plugin runs first and:
//   - gives images found in the dimension manifest their size, srcset widths
//     and a prose `sizes` hint, so Astro skips the measuring fetch;
//   - turns R2 images missing from the manifest into plain lazy <img> HTML,
//     which Astro leaves alone, so a new or broken image can't fail a build.

import { PROSE_MAX_WIDTH, PROSE_SIZES, isR2Image, planResponsiveImage } from './imageDimensions';

interface MarkdownNode {
    type: string;
    url?: string;
    alt?: string | null;
    title?: string | null;
    value?: string;
    data?: Record<string, unknown>;
    children?: MarkdownNode[];
}

function escapeAttribute(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

// `astro.config.mjs` passes the srcset widths as an option. The plugin doesn't
// read it: it is there so Astro's content cache key changes with the widths.
// Astro caches rendered markdown between builds and only clears that cache when
// the config changes, not when an imported module like imageDimensions.ts does.
export function remarkResponsiveImages(_cacheKey?: Record<string, unknown>) {
    return (tree: MarkdownNode) => {
        function visit(node: MarkdownNode) {
            if (!node.children) return;
            node.children.forEach((child, index) => {
                if (child.type !== 'image' || !child.url || !isR2Image(child.url)) {
                    visit(child);
                    return;
                }

                const plan = planResponsiveImage(child.url, PROSE_MAX_WIDTH);
                if (plan) {
                    child.data = {
                        ...child.data,
                        hProperties: {
                            width: plan.width,
                            height: plan.height,
                            widths: plan.widths,
                            sizes: PROSE_SIZES,
                        },
                    };
                    return;
                }

                const title = child.title ? ` title="${escapeAttribute(child.title)}"` : '';
                node.children![index] = {
                    type: 'html',
                    value: `<img src="${escapeAttribute(child.url)}" alt="${escapeAttribute(child.alt ?? '')}"${title} loading="lazy" decoding="async">`,
                };
            });
        }
        visit(tree);
    };
}
