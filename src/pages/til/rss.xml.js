import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';
import { publicationFilter } from '../../utils/publication';

export async function GET(context) {
  const posts = sortByDate(await getCollection('til', publicationFilter('rss', 'til')));
  return rss({
    title: 'Sajal Choudhary - TIL',
    description: 'Today I Learned — short technical discoveries and notes.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
