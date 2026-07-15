import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate, isNotBackfilled } from '../../utils/rss';

export async function GET(context) {
  const posts = sortByDate(await getCollection('filmshelf', isNotBackfilled));
  return rss({
    title: 'Sajal Choudhary - Filmshelf',
    description: 'Films I\'ve watched — reviews and notes.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
