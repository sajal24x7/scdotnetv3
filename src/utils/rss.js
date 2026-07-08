import sanitizeHtml from 'sanitize-html';
import { parseMarkdown } from './markdown';
import { convertWikilinks } from './remarkWikilinks';

export const rssNamespaces = {
  media: "http://search.yahoo.com/mrss/",
  atom: "http://www.w3.org/2005/Atom",
  content: "http://purl.org/rss/1.0/modules/content/"
};

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height'],
    a: ['href', 'title', 'target', 'rel']
  }
};

export async function buildRssItem(item) {
  let content = '';
  if (typeof item.body === 'string') {
    content = sanitizeHtml(parseMarkdown(await convertWikilinks(item.body)), sanitizeOptions);
  } else {
    content = item.data.description || '';
  }

  return {
    link: `/${item.data.category}/${item.id}/`,
    title: item.data.title || 'Untitled',
    description: item.data.description || '',
    content,
    pubDate: item.data.created,
    categories: [item.data.category, ...(item.data.tags || [])],
    author: 'sajal@sajalchoudhary.net (Sajal Choudhary)',
    customData: item.data.image ? `
      <media:content url="${item.data.image}" medium="image" />
      <media:thumbnail url="${item.data.image}" />
    ` : ''
  };
}

export function sortByDate(posts) {
  return posts.slice().sort((a, b) =>
    new Date(b.data.created).valueOf() - new Date(a.data.created).valueOf()
  );
}
