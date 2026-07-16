import type { APIRoute } from 'astro';
import { getAllPosts } from '../../utils/content';
import { SHELF_QUEUE_CONFIG, getQueueCreator } from '../../utils/shelfQueue';
import type { ShelfCategory } from '../../utils/shelfStatus';

export const prerender = true;

const SHELF_CATEGORIES = Object.keys(SHELF_QUEUE_CONFIG) as ShelfCategory[];

export const GET: APIRoute = async () => {
    const allPosts = await getAllPosts();

    const queue = allPosts
        .filter((post) => SHELF_CATEGORIES.includes(post.data.category as ShelfCategory) && post.data.status === 'todo')
        .map((post) => {
            const category = post.data.category as ShelfCategory;
            const config = SHELF_QUEUE_CONFIG[category];
            return {
                id: post.id,
                category,
                title: (category === 'tvshelf' ? post.data.showTitle ?? post.data.title : post.data.title) ?? '',
                creator: getQueueCreator(post.data, config.creatorField),
                created: new Date(post.data.created).toISOString(),
                path: post.filePath ?? '',
            };
        })
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return new Response(JSON.stringify(queue), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, must-revalidate',
        },
    });
};
