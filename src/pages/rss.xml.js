import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getContentCategories } from '../utils/content';
import { buildRssItem, rssNamespaces, sortByDate } from '../utils/rss.js';
import { publicationFilter, publishedCategories } from '../utils/publication';

// Which categories (and which shelf statuses) appear here is governed by the
// central allowlist in publication.config.json.
export async function GET(context) {
  const published = new Set(publishedCategories('rss'));
  const categories = getContentCategories().filter((category) => published.has(category));
  const allPosts = await Promise.all(
    categories.map((category) => getCollection(category, publicationFilter('rss', category)))
  );
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
