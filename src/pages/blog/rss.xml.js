import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';

export async function GET(context) {
  const posts = sortByDate(await getCollection('blog'));
  return rss({
    title: 'Sajal Choudhary - Blog',
    description: 'Long-form articles, essays, and thoughts.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
