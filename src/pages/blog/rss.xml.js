import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import { getYearDirectories } from '../../utils/content';

export async function GET(context) {
  // Get all year directories
  const years = getYearDirectories();
  
  // Get all posts from year collections and filter for blog posts
  const allPosts = await Promise.all(years.map(year => getCollection(year)));
  const flatPosts = allPosts.flat();
  const blogPosts = flatPosts.filter(post => post.data.category === 'blog');
  
  // Sort by publish date (newest first)
  const sortedPosts = blogPosts.sort((a, b) => 
    new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
  
  // Extract the site URL from the Astro context
  const site = context.site.toString();
  
  // Generate the RSS feed
  return rss({
    title: 'Sajal Choudhary - Blog Posts',
    description: 'Long-form articles, essays, and thoughts on technology, life, books, and personal experiences.',
    site: context.site,
    items: await Promise.all(sortedPosts.map(async (item) => {
      // Render the content body to HTML
      let content = '';
      
      // If it's a string, parse it with marked
      if (typeof item.body === 'string') {
        content = sanitizeHtml(marked.parse(item.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height'],
            a: ['href', 'title', 'target', 'rel']
          }
        });
      } else {
        content = item.data.description || '';
      }
      
      return {
        link: `/blog/${item.slug}/`,
        title: item.data.title || 'Untitled',
        description: item.data.description || '',
        content,
        pubDate: item.data.pubDate,
        categories: item.data.tags || [],
        author: 'sajal@sajalchoudhary.net (Sajal Choudhary)',
        customData: item.data.image ? `
          <media:content url="${item.data.image}" medium="image" />
          <media:thumbnail url="${item.data.image}" />
        ` : ''
      };
    })),
    customData: `
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
    `,
    stylesheet: '/rss-style.xsl'
  });
} 