// Helpers for photo posts. New photo posts keep their gallery in the
// `images:` frontmatter array (body is just the caption); legacy posts embed
// markdown images in the body, sometimes duplicated in the `image:` field.

const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

// Some migrated frontmatter carries smart quotes around URLs
const cleanUrl = (url: string) => url.replace(/[“”"']/g, '').trim();

/**
 * Collect a photo post's gallery images: frontmatter `images` first, then
 * markdown images found in the body, then the single `image` field.
 */
export function getPhotoImages(data: Record<string, any>, body?: string | null): string[] {
    if (Array.isArray(data.images) && data.images.length > 0) {
        return data.images.map(cleanUrl).filter(Boolean);
    }

    const found: string[] = [];
    if (body) {
        for (const match of body.matchAll(MARKDOWN_IMAGE_REGEX)) {
            found.push(cleanUrl(match[1]));
        }
    }
    if (found.length === 0 && typeof data.image === 'string' && data.image.trim()) {
        found.push(cleanUrl(data.image));
    }

    return [...new Set(found)].filter(Boolean);
}

/**
 * Short caption for grid tiles: the title when present, otherwise the body
 * text with markdown syntax stripped.
 */
export function getPhotoCaption(data: Record<string, any>, body?: string | null): string {
    if (typeof data.title === 'string' && data.title.trim()) {
        return data.title.trim();
    }
    if (!body) return '';
    return body
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')       // drop images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')     // links → label
        .replace(/[#>*_`~\\]/g, '')                  // markdown punctuation
        .replace(/\s+/g, ' ')
        .trim();
}
