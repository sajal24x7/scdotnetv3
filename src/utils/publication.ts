import publicationConfig from '../../publication.config.json';

// Central publication allowlist (publication.config.json): the single source
// of truth for which posts reach readers. Each surface maps a category to
// "all" (every post) or an array of allowed `status` frontmatter values.
// Explicit allow only — a category or status missing from a surface publishes
// nothing there, so new categories/statuses stay off every feed until listed.
export type PublicationSurface = 'rss' | 'syndication';
type PublicationRule = 'all' | string[];

const config = publicationConfig as unknown as Record<
  PublicationSurface,
  Record<string, PublicationRule>
>;

interface PublishablePost {
  data: {
    category?: string;
    status?: string;
  };
}

export function publishedCategories(surface: PublicationSurface): string[] {
  return Object.keys(config[surface] ?? {});
}

export function isPublished(
  surface: PublicationSurface,
  category: string,
  status?: string
): boolean {
  const rule = config[surface]?.[category];
  if (!rule) {
    return false;
  }
  return rule === 'all' || (status != null && rule.includes(status));
}

// Predicate usable both as a getCollection() filter and with Array#filter.
// Pass the category when it's known up front; otherwise it's read per post.
export function publicationFilter(surface: PublicationSurface, category?: string) {
  return (post: PublishablePost): boolean =>
    isPublished(surface, category ?? post.data.category ?? '', post.data.status);
}
