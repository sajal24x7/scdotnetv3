// Build-time optimisation for R2 images rendered outside Astro's markdown
// pipeline: frontmatter images (via RemoteImage.astro) and HTML produced by
// `parseMarkdown` for stream and garden previews.

import { getImage } from 'astro:assets';
import { PROSE_MAX_WIDTH, PROSE_SIZES, planResponsiveImage } from './imageDimensions';
import { parseMarkdown } from './markdown';

export interface ResponsiveImageAttributes {
    src: string;
    srcset: string;
    sizes: string;
    width: number;
    height: number;
}

/**
 * Optimised `src`/`srcset` for an R2 image. Returns undefined when the image
 * can't be optimised (not on R2, not in the dimension manifest, or the
 * transform failed) so callers render the original URL instead.
 */
export async function getResponsiveImage(
    url: string,
    { sizes, maxWidth }: { sizes: string; maxWidth: number },
): Promise<ResponsiveImageAttributes | undefined> {
    const plan = planResponsiveImage(url, maxWidth);
    if (!plan) {
        return undefined;
    }

    try {
        const image = await getImage({
            src: url.trim(),
            width: plan.width,
            height: plan.height,
            widths: plan.widths,
            sizes,
            layout: 'constrained',
        });
        return {
            src: image.src,
            srcset: image.srcSet.attribute,
            sizes,
            width: plan.width,
            height: plan.height,
        };
    } catch (error) {
        console.warn(`[images] Could not optimise ${url}:`, error);
        return undefined;
    }
}

const IMG_TAG_REGEX = /<img\b[^>]*>/gi;
const SRC_ATTR_REGEX = /\ssrc="([^"]+)"/i;

const decodeEntities = (value: string) => value.replace(/&amp;/g, '&');

/**
 * Rewrite R2 `<img>` tags in an HTML string with optimised responsive
 * attributes. Other images get lazy loading and are otherwise left alone.
 */
export async function optimizeHtmlImages(
    html: string,
    { sizes = PROSE_SIZES, maxWidth = PROSE_MAX_WIDTH } = {},
): Promise<string> {
    const tags = html.match(IMG_TAG_REGEX);
    if (!tags) {
        return html;
    }

    const replacements = new Map<string, string>();
    await Promise.all(
        [...new Set(tags)].map(async (tag) => {
            const srcMatch = tag.match(SRC_ATTR_REGEX);
            const lazy = /\sloading=/i.test(tag) ? '' : ' loading="lazy" decoding="async"';
            const image = srcMatch
                ? await getResponsiveImage(decodeEntities(srcMatch[1]), { sizes, maxWidth })
                : undefined;

            if (!image) {
                replacements.set(tag, lazy ? tag.replace(/^<img\b/i, `<img${lazy}`) : tag);
                return;
            }

            const rest = tag
                .replace(/^<img\b/i, '')
                .replace(/\s(?:src|srcset|sizes|width|height)="[^"]*"/gi, '');
            replacements.set(
                tag,
                `<img src="${image.src}" srcset="${image.srcset}" sizes="${image.sizes}" width="${image.width}" height="${image.height}"${lazy}${rest}`,
            );
        }),
    );

    return html.replace(IMG_TAG_REGEX, (tag) => replacements.get(tag) ?? tag);
}

/** `parseMarkdown` plus responsive R2 images, for listing previews. */
export async function parseMarkdownWithImages(content: string): Promise<string> {
    return optimizeHtmlImages(parseMarkdown(content));
}
