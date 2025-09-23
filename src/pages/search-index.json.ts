import { getAllPosts } from '../utils/content';

export const prerender = true;

type SearchIndexEntry = {
    slug: string;
    data: {
        title?: string;
        description?: string;
        category?: string;
        tags: string[];
    };
};

export async function GET() {
    const posts = await getAllPosts();
    const index: SearchIndexEntry[] = posts.map((post) => ({
        slug: post.slug,
        data: {
            title: post.data.title,
            description: post.data.description,
            category: post.data.category,
            tags: post.data.tags ?? []
        }
    }));

    return new Response(JSON.stringify(index), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=0, s-maxage=600'
        }
    });
}
