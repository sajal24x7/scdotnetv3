import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate, isNotBackfilled } from '../../utils/rss';
import { publicationFilter } from '../../utils/publication';

export async function GET(context) {
  const allowed = publicationFilter('rss', 'tvshelf');
  // Backfilled Netflix-history entries stay out of the feed on top of the allowlist
  const posts = sortByDate(await getCollection('tvshelf', (post) => allowed(post) && isNotBackfilled(post)));
  return rss({
    title: 'Sajal Choudhary - TV Shelf',
    description: 'TV shows I\'ve watched — tracking and reviews.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
