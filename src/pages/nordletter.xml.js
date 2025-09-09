import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

export async function GET(context) {
  // Get all collections
  const allCollections = await getCollection('posts');
  
  // Filter for nordletter content
  const newsletterContent = allCollections
    .filter(entry => entry.data.category === 'nordletter')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  
  // Extract the site URL from the Astro context
  const site = context.site.toString();
  
  // Generate the RSS feed
  return rss({
    title: 'NordLetter - Your Newsletter',
    description: 'Articles, notes, and discoveries worth sharing in your inbox',
    site: context.site,
    items: await Promise.all(newsletterContent.map(async (item) => {
      // Render the content body to HTML
      const { Content } = await item.render();
      let content;
      
      // If it's a string, parse it with marked
      if (typeof item.body === 'string') {
        content = sanitizeHtml(marked.parse(item.body));
      } else {
        // For rendered components, we'll just use the description
        content = item.data.description || '';
      }
      
      return {
        link: `/${item.slug}/`,
        title: item.data.title,
        description: item.data.description || '',
        content,
        pubDate: item.data.pubDate,
        categories: item.data.tags || [],
        // Add custom namespace elements for better newsletter features
        customData: `
          ${item.data.image ? `<media:content url="${site}${item.data.image}" medium="image" />` : ''}
          <newsletter:issue>${item.data.edition || 1}</newsletter:issue>
        `
      };
    })),
    stylesheet: '/rss-style.xsl',
    xmlns: {
      newsletter: "https://buttondown.email/ns/newsletter",
      media: "http://search.yahoo.com/mrss/"
    }
  });
} 