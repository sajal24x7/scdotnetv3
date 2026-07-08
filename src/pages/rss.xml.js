import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getContentCategories } from '../utils/content';
import { buildRssItem, rssNamespaces, sortByDate } from '../utils/rss.js';

export async function GET(context) {
  const categories = getContentCategories();
  const allPosts = await Promise.all(categories.map(category => getCollection(category)));
  const flatPosts = allPosts.flat();

  // Generate the RSS feed (latest 50 posts across all sections)
  return rss({
    title: 'Sajal Choudhary',
    description: 'Personal blog, thoughts, stories, and discoveries. Writing since 2012 about technology, life, books, and everything in between.',
    site: context.site,
    items: await Promise.all(sortByDate(flatPosts).slice(0, 50).map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
