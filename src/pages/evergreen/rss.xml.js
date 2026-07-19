import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';
import { publicationFilter } from '../../utils/publication';

export async function GET(context) {
  const posts = sortByDate(await getCollection('evergreen', publicationFilter('rss', 'evergreen')));
  return rss({
    title: 'Sajal Choudhary - Evergreen',
    description: 'Evergreen notes and documentation that stay relevant over time.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
