import sanitizeHtml from 'sanitize-html';
import { parseMarkdown } from './markdown';
import { convertWikilinks } from './remarkWikilinks';
import { stripLearnBlocks } from './learnBlocks';

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
    content = sanitizeHtml(parseMarkdown(await convertWikilinks(stripLearnBlocks(item.body))), sanitizeOptions);
  } else {
    content = item.data.description || '';
  }

  // Photo posts keep their gallery in frontmatter (`images:`), not the body —
  // prepend the pictures so feed readers see them above the caption.
  const galleryImages = Array.isArray(item.data.images) ? item.data.images : [];
  if (galleryImages.length > 0) {
    const galleryHtml = galleryImages
      .map((url) => `<p><img src="${url}" alt="" /></p>`)
      .join('');
    content = galleryHtml + content;
  }

  const mediaImages = galleryImages.length > 0
    ? galleryImages
    : (item.data.image ? [item.data.image] : []);

  const title = item.data.title;

  return {
    link: `/${item.data.category}/${item.id}/`,
    // Titleless notes (micro posts) omit <title> entirely, so feed readers
    // render just the body — like a status update — instead of "Untitled".
    // RSS requires title or description, so the body doubles as description.
    ...(title ? { title } : {}),
    description: item.data.description || (title ? '' : content),
    content,
    pubDate: item.data.created,
    categories: [item.data.category, ...(item.data.tags || [])],
    author: 'sajal@sajalchoudhary.net (Sajal Choudhary)',
    customData: mediaImages.length > 0 ? `
      ${mediaImages.map((url) => `<media:content url="${url}" medium="image" />`).join('\n      ')}
      <media:thumbnail url="${mediaImages[0]}" />
    ` : ''
  };
}

export function sortByDate(posts) {
  return posts.slice().sort((a, b) =>
    new Date(b.data.created).valueOf() - new Date(a.data.created).valueOf()
  );
}
