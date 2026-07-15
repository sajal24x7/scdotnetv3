import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';

export async function GET(context) {
  const isFinished = (post) => post.data.status === 'finished';
  const [bookshelf, filmshelf, tvshelf, gameshelf] = await Promise.all([
    getCollection('bookshelf', isFinished),
    getCollection('filmshelf', isFinished),
    getCollection('tvshelf', isFinished),
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
