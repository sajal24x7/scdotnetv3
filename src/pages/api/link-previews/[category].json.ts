import type { APIRoute } from 'astro';
import { getSegmentedContentPreviewsObject } from '../../../data/contentPreviewStore';

export async function getStaticPaths() {
    const segmented = await getSegmentedContentPreviewsObject();
    return Object.keys(segmented).map((category) => ({
        params: { category }
    }));
}

export const prerender = true;

export const GET: APIRoute = async ({ params }) => {
    const segmented = await getSegmentedContentPreviewsObject();
    const category = params.category ?? '';
    const previews = segmented[category] ?? {};

    return new Response(JSON.stringify(previews), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, must-revalidate'
        }
    });
};
