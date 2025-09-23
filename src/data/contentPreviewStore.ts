import type { ContentPreview } from '../utils/contentPreview';
import { generateContentPreviews } from '../utils/contentPreview';

let previewsPromise: Promise<Map<string, ContentPreview>> | null = null;
let previewsObjectPromise: Promise<Record<string, ContentPreview>> | null = null;

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
