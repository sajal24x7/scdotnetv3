import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';

export async function GET(context) {
  const posts = sortByDate(await getCollection('tvshelf'));
  return rss({
    title: 'Sajal Choudhary - TV Shelf',
    description: 'TV shows I\'ve watched — tracking and reviews.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
