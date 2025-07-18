import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import { getYearDirectories } from '../utils/content';

export async function GET(context) {
  // Get all year directories
  const years = getYearDirectories();
  
  // Get all posts from year collections
  const allPosts = await Promise.all(years.map(year => getCollection(year)));
  const flatPosts = allPosts.flat();
  
  // Sort by publish date (newest first)
  const sortedPosts = flatPosts.sort((a, b) => 
    new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
  
  // Limit to latest 50 posts for main feed
  const recentPosts = sortedPosts.slice(0, 50);
  
  // Extract the site URL from the Astro context
  const site = context.site.toString();
  
  // Generate the RSS feed
  return rss({
    title: 'Sajal Choudhary',
    description: 'Personal blog, thoughts, stories, and discoveries. Writing since 2012 about technology, life, books, and everything in between.',
    site: context.site,
    items: await Promise.all(recentPosts.map(async (item) => {
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
        // For rendered components, we'll just use the description
        content = item.data.description || '';
      }
      
      // Determine the post URL based on category
      const postUrl = `/${item.data.category}/${item.slug}/`;
      
      return {
        link: postUrl,
        title: item.data.title || 'Untitled',
        description: item.data.description || '',
        content,
        pubDate: item.data.pubDate,
        categories: item.data.tags || [],
        author: 'sajal@sajalchoudhary.net (Sajal Choudhary)',
        // Add custom namespace elements for better RSS features
        customData: item.data.image ? `
          <media:content url="${item.data.image}" medium="image" />
          <media:thumbnail url="${item.data.image}" />
        ` : ''
      };
    })),
    stylesheet: '/rss-style.xsl',
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
      atom: "http://www.w3.org/2005/Atom",
      content: "http://purl.org/rss/1.0/modules/content/"
    }
  });
} 