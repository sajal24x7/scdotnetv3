import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';

export async function GET(context) {
  const [blog, evergreen, nordletter] = await Promise.all([
    getCollection('blog'),
    getCollection('evergreen'),
    getCollection('nordletter'),
  ]);

  const posts = sortByDate([...blog, ...evergreen, ...nordletter]);

  return rss({
    title: 'Sajal Choudhary - Longform',
    description: 'Long-form writing: blog essays, evergreen notes, and the NordLetter newsletter.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
