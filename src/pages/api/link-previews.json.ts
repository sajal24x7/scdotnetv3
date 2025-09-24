import type { APIRoute } from 'astro';
import { getContentPreviewsObject } from '../../data/contentPreviewStore';

export const prerender = true;

export const GET: APIRoute = async () => {
    const previews = await getContentPreviewsObject();

    return new Response(JSON.stringify(previews), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, must-revalidate'
        }
    });
};
