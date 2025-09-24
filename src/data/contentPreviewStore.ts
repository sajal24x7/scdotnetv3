import type { ContentPreview } from '../utils/contentPreview';
import { generateContentPreviews } from '../utils/contentPreview';

let previewsPromise: Promise<Map<string, ContentPreview>> | null = null;
let previewsObjectPromise: Promise<Record<string, ContentPreview>> | null = null;
let segmentedPreviewsPromise: Promise<Record<string, Record<string, ContentPreview>>> | null = null;
let previewCategoriesPromise: Promise<string[]> | null = null;

async function resolvePreviewsMap(): Promise<Map<string, ContentPreview>> {
    if (!previewsPromise) {
        previewsPromise = generateContentPreviews();
    }

    return previewsPromise;
}

export async function getContentPreviewsMap(): Promise<Map<string, ContentPreview>> {
    const previews = await resolvePreviewsMap();
    return previews;
}

export async function getContentPreviewsObject(): Promise<Record<string, ContentPreview>> {
    if (!previewsObjectPromise) {
        previewsObjectPromise = (async () => {
            const previews = await resolvePreviewsMap();
            return Object.fromEntries(previews.entries());
        })();
    }

    return previewsObjectPromise;
}

export async function getContentPreviewsJson(): Promise<string> {
    const previewsObject = await getContentPreviewsObject();
    return JSON.stringify(previewsObject);
}

export async function getSegmentedContentPreviewsObject(): Promise<Record<string, Record<string, ContentPreview>>> {
    if (!segmentedPreviewsPromise) {
        segmentedPreviewsPromise = (async () => {
            const previews = await resolvePreviewsMap();
            const segmented = new Map<string, Map<string, ContentPreview>>();

            for (const [path, preview] of previews.entries()) {
                const category = preview.category || 'uncategorized';
                const existing = segmented.get(category);

                if (existing) {
                    existing.set(path, preview);
                } else {
                    segmented.set(category, new Map([[path, preview]]));
                }
            }

            return Object.fromEntries(
                Array.from(segmented.entries(), ([category, map]) => [category, Object.fromEntries(map.entries())])
            );
        })();
    }

    return segmentedPreviewsPromise;
}

export async function getContentPreviewCategories(): Promise<string[]> {
    if (!previewCategoriesPromise) {
        previewCategoriesPromise = (async () => {
            const previews = await resolvePreviewsMap();
            const categories = new Set<string>();

            for (const preview of previews.values()) {
                if (preview.category) {
                    categories.add(preview.category);
                }
            }

            return Array.from(categories).sort();
        })();
    }

    return previewCategoriesPromise;
}
