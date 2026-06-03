import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { getContentCategories } from '../../utils/content';
import { parseMarkdown } from '../../utils/markdown';

export async function GET(context) {
  const categories = getContentCategories();
  const allPosts = await Promise.all(categories.map(category => getCollection(category)));
  const flatPosts = allPosts.flat();
  const garden = flatPosts.filter(post => 
    ['evergreen', 'til', 'now'].includes(post.data.category)
  );
  
  // Sort by publish date (newest first)
  const sortedPosts = garden.sort((a, b) => 
    new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
  
  // Generate the RSS feed
  return rss({
    title: 'Sajal Choudhary - Garden',
    description: 'A collection of documentation, notes, and explorations from my projects and learning.',
    site: context.site,
    items: await Promise.all(sortedPosts.map(async (item) => {
      // Render the content body to HTML
      let content = '';
      
      // If it's a string, parse it with the shared markdown helper
      if (typeof item.body === 'string') {
        content = sanitizeHtml(parseMarkdown(item.body), {
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
        link: `/${item.data.category}/${item.id}/`,
        title: item.data.title || 'Untitled',
        description: item.data.description || '',
        content,
        pubDate: item.data.pubDate,
        categories: [item.data.category, ...(item.data.tags || [])],
        author: 'sajal@sajalchoudhary.net (Sajal Choudhary)',
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