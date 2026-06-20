import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';

export async function GET(context) {
  const posts = sortByDate(await getCollection('photo'));
  return rss({
    title: 'Sajal Choudhary - Photos',
    description: 'Photography and visual notes.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
