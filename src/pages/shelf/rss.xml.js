import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate, isNotBackfilled } from '../../utils/rss';
import { publicationFilter } from '../../utils/publication';

export async function GET(context) {
  // publication.config.json decides which statuses publish; film/tv were
  // bulk-backfilled from Netflix history, so a date rule additionally keeps
  // the backfill out of the feed.
  const shelfFilter = (category, extra) => {
    const allowed = publicationFilter('rss', category);
    return extra ? (post) => allowed(post) && extra(post) : allowed;
  };
  const [bookshelf, filmshelf, tvshelf, gameshelf] = await Promise.all([
    getCollection('bookshelf', shelfFilter('bookshelf')),
    getCollection('filmshelf', shelfFilter('filmshelf', isNotBackfilled)),
    getCollection('tvshelf', shelfFilter('tvshelf', isNotBackfilled)),
    getCollection('gameshelf', shelfFilter('gameshelf')),
  ]);

  const posts = sortByDate([...bookshelf, ...filmshelf, ...tvshelf, ...gameshelf]);

  return rss({
    title: 'Sajal Choudhary - Shelf',
    description: 'Books, films, TV shows, and games — all shelf entries.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
