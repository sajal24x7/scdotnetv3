import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate, isNotBackfilled } from '../../utils/rss';

export async function GET(context) {
  const isFinished = (post) => post.data.status === 'finished';
  // film/tv were bulk-backfilled from Netflix history; keep the backfill out
  // of the feed while books/games (no backfill) keep their normal behavior.
  const [bookshelf, filmshelf, tvshelf, gameshelf] = await Promise.all([
    getCollection('bookshelf', isFinished),
    getCollection('filmshelf', isNotBackfilled),
    getCollection('tvshelf', isNotBackfilled),
    getCollection('gameshelf', isFinished),
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
