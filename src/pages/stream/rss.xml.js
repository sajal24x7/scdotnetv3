import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { getContentCategories } from '../../utils/content';
import { publicationFilter } from '../../utils/publication';
import { parseMarkdown } from '../../utils/markdown';
import { convertWikilinks } from '../../utils/remarkWikilinks';

export async function GET(context) {
  const categories = getContentCategories();
  const allPosts = await Promise.all(categories.map(category => getCollection(category)));
  const flatPosts = allPosts.flat();
  const allowed = publicationFilter('rss');
  const stream = flatPosts.filter(post =>
    ['blog', 'micro', 'photo'].includes(post.data.category) && allowed(post)
  );
  
  // Sort by publish date (newest first)
  const sortedPosts = stream.sort((a, b) => 
    new Date(b.data.created).valueOf() - new Date(a.data.created).valueOf()
  );
  
  // Generate the RSS feed
  return rss({
    title: 'Sajal Choudhary - Stream',
    description: 'A collection of blog posts, micro updates, and photos - the everyday digital stream of life.',
    site: context.site,
    items: await Promise.all(sortedPosts.map(async (item) => {
      // Render the content body to HTML
      let content = '';
      
      // If it's a string, parse it with the shared markdown helper
      if (typeof item.body === 'string') {
        content = sanitizeHtml(parseMarkdown(await convertWikilinks(item.body)), {
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

      const title = item.data.title;

      return {
        link: `/${item.data.category}/${item.id}/`,
        // Titleless notes omit <title> so readers render just the body,
        // like a status update, instead of "Untitled". RSS requires title
        // or description, so the body doubles as description.
        ...(title ? { title } : {}),
        description: item.data.description || (title ? '' : content),
        content,
        pubDate: item.data.created,
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