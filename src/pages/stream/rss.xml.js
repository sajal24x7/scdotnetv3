import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import { getYearDirectories } from '../../utils/content';

export async function GET(context) {
  // Get all year directories
  const years = getYearDirectories();
  
  // Get all posts from year collections and filter for stream (blog, micro, photo)
  const allPosts = await Promise.all(years.map(year => getCollection(year)));
  const flatPosts = allPosts.flat();
  const stream = flatPosts.filter(post => 
    ['blog', 'micro', 'photo'].includes(post.data.category)
  );
  
  // Sort by publish date (newest first)
  const sortedPosts = stream.sort((a, b) => 
    new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
  
  // Generate the RSS feed
  return rss({
    title: 'Sajal Choudhary - Stream',
    description: 'A collection of blog posts, micro updates, and photos - the everyday digital stream of life.',
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
      
      // Create hashtags from tags for social media
      const hashtags = (item.data.tags || []).map(tag => `#${tag}`).join(' ');
      
      // For Bridgy syndication, send only title + description + link (no full content)
      const syndicationContent = item.data.description || item.data.title || 'Read more on my website';
      
      return {
        link: `/${item.data.category}/${item.slug}/`,
        title: item.data.title || 'Untitled',
        description: item.data.description || '',
        content: syndicationContent, // Only send description, not full content
        pubDate: item.data.pubDate,
        categories: [item.data.category, ...(item.data.tags || [])],
        author: 'sajal@sajalchoudhary.net (Sajal Choudhary)',
        customData: `
          ${item.data.image ? `
            <media:content url="${item.data.image}" medium="image" />
            <media:thumbnail url="${item.data.image}" />
          ` : ''}
          <syndication:hashtags>${hashtags}</syndication:hashtags>
        `
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