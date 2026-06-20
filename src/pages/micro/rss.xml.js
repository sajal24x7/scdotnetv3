import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';

export async function GET(context) {
  const posts = sortByDate(await getCollection('micro'));
  return rss({
    title: 'Sajal Choudhary - Micro',
    description: 'Short-form updates, links, and quick thoughts.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
