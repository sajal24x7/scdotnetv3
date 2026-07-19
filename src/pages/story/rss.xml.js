import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';
import { publicationFilter } from '../../utils/publication';

export async function GET(context) {
  const posts = sortByDate(await getCollection('story', publicationFilter('rss', 'story')));
  return rss({
    title: 'Sajal Choudhary - Stories',
    description: 'Fiction and short stories.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
