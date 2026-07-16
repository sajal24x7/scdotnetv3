import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getContentCategories } from '../utils/content';
import { buildRssItem, rssNamespaces, sortByDate, isNotBackfilled } from '../utils/rss.js';

// Shelf categories carry a `todo`/`started`/`paused`/`finished` status; only
// finished entries are posts, so keep queue stubs out of the site-wide feed
// the same way each shelf's own feed already does (see shelf/rss.xml.js).
const isFinished = (post) => post.data.status === 'finished';
const SHELF_STATUS_FILTERS = {
  bookshelf: isFinished,
  filmshelf: isNotBackfilled,
  tvshelf: isNotBackfilled,
  gameshelf: isFinished,
};

export async function GET(context) {
  const categories = getContentCategories();
  const allPosts = await Promise.all(
    categories.map(category => getCollection(category, SHELF_STATUS_FILTERS[category]))
  );
  const flatPosts = allPosts.flat();

  // Generate the RSS feed (latest 50 posts across all sections)
  return rss({
    title: 'Sajal Choudhary',
    description: 'Personal blog, thoughts, stories, and discoveries. Writing since 2012 about technology, life, books, and everything in between.',
    site: context.site,
    items: await Promise.all(sortByDate(flatPosts).slice(0, 50).map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
