import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

export async function GET(context) {
  // Get all notes from the notes collection
  const notes = await getCollection('notes');
  
  // Sort by publish date (newest first)
  const sortedNotes = notes.sort((a, b) => 
    new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
  
  // Generate the RSS feed
  return rss({
    title: 'Sajal Choudhary - Notes',
    description: 'Personal notes, thoughts in progress, and digital garden entries. Ideas in various stages of development.',
    site: context.site,
    items: await Promise.all(sortedNotes.map(async (item) => {
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
        link: `/notes/${item.slug}/`,
        title: item.data.title || 'Untitled',
        description: item.data.description || '',
        content,
        pubDate: item.data.pubDate,
        categories: item.data.tags || [],
        author: 'sajal@sajalchoudhary.net (Sajal Choudhary)',
        customData: `
          ${item.data.image ? `
            <media:content url="${item.data.image}" medium="image" />
            <media:thumbnail url="${item.data.image}" />
          ` : ''}
          ${item.data.stage ? `<note:stage>${item.data.stage}</note:stage>` : ''}
        `
      };
    })),
    customData: `
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:note="https://example.com/ns/note"
    `,
    stylesheet: '/rss-style.xsl'
  });
} 