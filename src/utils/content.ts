import { getCollection } from 'astro:content';
import { readdirSync } from 'fs';
import { join } from 'path';

interface Post {
  data: {
    title?: string;
    description?: string;
    pubDate: Date;
    category: string;
    image?: string;
    tags?: string[];
  };
  slug: string;
  body: string;
  render: () => Promise<{ Content: any }>;
}

// Get all year directories from src/content
export function getYearDirectories(): string[] {
  const contentDir = join(process.cwd(), 'src', 'content');
  return readdirSync(contentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && /^\d{4}$/.test(dirent.name))
    .map(dirent => dirent.name)
    .sort();
}

// Get all posts from year collections
export async function getAllPosts(): Promise<Post[]> {
  const years = getYearDirectories();
  const allPosts = await Promise.all(years.map(async year => {
    const posts = await getCollection(year as any);
    return posts.map((post: any) => ({
      data: post.data,
      slug: post.slug,
      body: post.body,
      render: post.render
    }));
  }));
  return allPosts.flat() as Post[];
}

// Transform post for ContentGrid component
export function transformPost(post: Post) {
  return {
    data: {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      category: post.data.category,
      image: post.data.image,
      link: `/${post.data.category}/${post.slug}/`
    },
    body: post.body,
    render: post.render
  };
} 