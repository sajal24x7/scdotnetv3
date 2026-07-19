import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { buildRssItem, rssNamespaces, sortByDate } from '../../utils/rss';
import { publicationFilter } from '../../utils/publication';

export async function GET(context) {
  const [blog, evergreen, nordletter, story, poem] = await Promise.all([
    getCollection('blog', publicationFilter('rss', 'blog')),
    getCollection('evergreen', publicationFilter('rss', 'evergreen')),
    getCollection('nordletter', publicationFilter('rss', 'nordletter')),
    getCollection('story', publicationFilter('rss', 'story')),
    getCollection('poem', publicationFilter('rss', 'poem')),
  ]);

  const posts = sortByDate([...blog, ...evergreen, ...nordletter, ...story, ...poem]);

  return rss({
    title: 'Sajal Choudhary - Longform',
    description: 'Long-form writing: blog essays, evergreen notes, stories, poetry, and the NordLetter newsletter.',
    site: context.site,
    items: await Promise.all(posts.map(buildRssItem)),
    stylesheet: '/rss-style.xsl',
    xmlns: rssNamespaces
  });
}
