import type { ImageMetadata } from 'astro';
import type { Post } from './content';
import { parseMarkdown } from './markdown';
import { cleanNordletterTitle, extractEditionNumber } from './content';
import { getBookCoverImage } from './bookCovers';
import { bookRatingLabels } from './bookRatings';
import { convertWikilinks } from './remarkWikilinks';
import { relativeTime } from './relativeTime';
import nordletterManifest from '../data/nordletter-image-manifest.json';

export const FEED_PAGE_SIZE = 10;

export const FEED_GROUPS = {
  stream: ['blog', 'micro', 'photo'],
  garden: ['evergreen', 'til', 'bookshelf', 'story', 'poem'],
  nordletter: ['nordletter']
} as const;

export type FeedGroup = keyof typeof FEED_GROUPS | 'all';

export const FEED_CATEGORIES: string[] = Object.values(FEED_GROUPS).flat();

const CATEGORY_TO_GROUP: Record<string, keyof typeof FEED_GROUPS> = Object.fromEntries(
  Object.entries(FEED_GROUPS).flatMap(([group, categories]) =>
    categories.map((category: string) => [category, group as keyof typeof FEED_GROUPS])
  )
);

const CATEGORY_LABELS: Record<string, string> = {
  blog: 'Blog',
  micro: 'Micro',
  photo: 'Photos',
  evergreen: 'Evergreen',
  til: 'TIL',
  bookshelf: 'Bookshelf',
  story: 'Story',
  poem: 'Poem',
  nordletter: 'Nord Letter'
};

// Nordletter cover images are cached locally by scripts/cache-nordletter-images.js
const nordletterImageModules = import.meta.glob(
  '../images/nordletter/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
) as Record<string, { default: ImageMetadata }>;

const nordletterImagesByFileName = Object.fromEntries(
  Object.entries(nordletterImageModules).map(([key, module]) => [
    key.split('/').pop() ?? key,
    module.default
  ])
);

const nordletterManifestMap = nordletterManifest as Record<string, string>;

function getNordletterImageSrc(post: Post): string | undefined {
  const fileName = nordletterManifestMap[post.id];
  const local = fileName ? nordletterImagesByFileName[fileName] : undefined;
  return local?.src ?? post.data.image ?? undefined;
}

export interface FeedEntry {
  html: string;
  group: keyof typeof FEED_GROUPS;
  month: string; // e.g. "July 2026" — used to insert month headers
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function postDate(post: Post): Date {
  const created = post.data.created;
  return created instanceof Date ? created : new Date(created);
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Full date shown as the tooltip behind the relative-time label
function dayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function postLink(post: Post): string {
  return `/${post.data.category}/${post.id}/`;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^-{3,}\s*$/gm, '') // thematic breaks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[\[[^\]|]*\|([^\]]+)\]\]/g, '$1') // wikilinks with alias -> alias
    .replace(/\[\[(?:\d{8,}\s+)?([^\]]+)\]\]/g, '$1') // bare wikilinks -> target sans timestamp id
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function bodySnippet(post: Post, maxLength = 160): string {
  const plain = stripMarkdown(post.body || '');
  if (!plain) {
    return '';
  }
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}

function poemVerse(post: Post): string {
  const lines = (post.body || '')
    .split('\n')
    .map((line) => stripMarkdown(line))
    .filter(Boolean)
    .slice(0, 2);
  return lines.map(escapeHtml).join('<br>');
}

function metaHtml(post: Post, extra = ''): string {
  const category = post.data.category;
  const label = CATEGORY_LABELS[category] ?? category;
  const date = postDate(post);
  // Relative label is rendered at build time and refreshed client-side from data-created.
  // The date doubles as the permalink — the only link to the post for untitled entries like micro.
  return `<div class="feed-entry__meta"><span class="card-chip">${escapeHtml(label)}</span><a class="feed-entry__date" data-created="${date.toISOString()}" title="${escapeHtml(dayLabel(date))}" href="${postLink(post)}">${escapeHtml(relativeTime(date))}</a>${extra}</div>`;
}

function titleHtml(post: Post, title?: string): string {
  const text = title ?? post.data.title;
  if (!text) {
    return '';
  }
  return `<h3 class="feed-entry__title"><a href="${postLink(post)}">${escapeHtml(text)}</a></h3>`;
}

function excerptHtml(text: string): string {
  if (!text) {
    return '';
  }
  return `<p class="feed-entry__excerpt">${escapeHtml(text)}</p>`;
}

// Evergreen notes that were revised well after planting get a "tended" marker
const TENDED_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

function tendedMarker(post: Post): string {
  const { updated } = post.data;
  if (!updated) {
    return '';
  }
  const updatedDate = updated instanceof Date ? updated : new Date(updated);
  if (updatedDate.getTime() - postDate(post).getTime() > TENDED_THRESHOLD_MS) {
    return '<span class="feed-entry__tended">↺ tended</span>';
  }
  return '';
}

async function renderMicro(post: Post): Promise<string> {
  const source = post.body ? await convertWikilinks(post.body) : '';
  const body = source ? parseMarkdown(source) : '';
  return `${metaHtml(post)}<div class="feed-entry__body prose dark:prose-invert">${body}</div>`;
}

async function renderPhoto(post: Post): Promise<string> {
  const source = post.body ? await convertWikilinks(post.body) : '';
  const body = source ? parseMarkdown(source) : '';
  return `${metaHtml(post)}${titleHtml(post)}<div class="feed-entry__body feed-entry__body--photo prose dark:prose-invert">${body}</div>`;
}

function renderBlog(post: Post): string {
  const excerpt = post.data.description || bodySnippet(post);
  return `${metaHtml(post)}${titleHtml(post)}${excerptHtml(excerpt)}`;
}

function renderTil(post: Post): string {
  return `${metaHtml(post)}${titleHtml(post)}`;
}

function renderEvergreen(post: Post): string {
  const excerpt = post.data.description || bodySnippet(post);
  return `${metaHtml(post, tendedMarker(post))}${titleHtml(post)}${excerptHtml(excerpt)}`;
}

function renderPoem(post: Post): string {
  const verse = poemVerse(post);
  const verseHtml = verse ? `<p class="feed-entry__verse">${verse}</p>` : '';
  return `${metaHtml(post)}${titleHtml(post)}${verseHtml}`;
}

function renderStory(post: Post): string {
  const excerpt = post.data.description || bodySnippet(post);
  return `${metaHtml(post)}${titleHtml(post)}${excerptHtml(excerpt)}`;
}

function renderBookshelf(post: Post): string {
  const coverMeta = post.data.cover ? getBookCoverImage(post.data.cover as any) : undefined;
  const coverHtml = coverMeta
    ? `<img class="feed-entry__book-cover" src="${coverMeta.src}" alt="" loading="lazy" width="48" height="70">`
    : '<div class="feed-entry__book-cover feed-entry__book-cover--placeholder" aria-hidden="true"></div>';

  const authors = Array.isArray(post.data.author)
    ? post.data.author.join(', ')
    : post.data.author || '';
  const rating = post.data.rating ? bookRatingLabels[post.data.rating] : '';
  const details = [authors, rating].filter(Boolean).join(' · ');
  const detailsHtml = details ? `<p class="feed-entry__book-note">${escapeHtml(details)}</p>` : '';
  const verb = post.data.shelfStatus === 'reading' ? 'Reading' : 'Finished';
  const title = post.data.title ? `${verb}: ${post.data.title}` : undefined;

  return `${metaHtml(post)}<div class="feed-entry__book">${coverHtml}<div>${titleHtml(post, title)}${detailsHtml}</div></div>`;
}

// Nordletter editions open with a recurring subscribe/reach-out preamble followed by a
// thematic break; the excerpt should come from the actual content after that break.
function nordletterContent(post: Post): string {
  const body = post.body || '';
  const breakMatch = body.match(/^---\s*$/m);
  if (breakMatch && typeof breakMatch.index === 'number') {
    const intro = body.slice(0, breakMatch.index);
    if (/this is nord\s*letter/i.test(intro)) {
      return body.slice(breakMatch.index + breakMatch[0].length);
    }
  }
  return body;
}

function renderNordletter(post: Post): string {
  const title = post.data.title ? cleanNordletterTitle(post.data.title) : '';
  const edition = post.data.edition ?? extractEditionNumber(post.data.title || '', post.id);
  const badge = edition ? `<span class="feed-entry__nl-badge">NL ${escapeHtml(String(edition))}</span>` : '';
  const imageSrc = getNordletterImageSrc(post);
  const imageHtml = imageSrc
    ? `<img class="feed-entry__nl-img" src="${escapeHtml(imageSrc)}" alt="" loading="lazy">`
    : '';
  const content = stripMarkdown(nordletterContent(post));
  const excerpt = content
    ? (content.length <= 220 ? content : `${content.slice(0, 220).replace(/\s+\S*$/, '')}…`)
    : post.data.description || '';

  return `${metaHtml(post)}<div class="feed-entry__nl-card">${imageHtml}<div class="feed-entry__nl-body">${badge}${titleHtml(post, title)}${excerptHtml(excerpt)}</div></div>`;
}

const RENDERERS: Record<string, (post: Post) => string | Promise<string>> = {
  micro: renderMicro,
  photo: renderPhoto,
  blog: renderBlog,
  til: renderTil,
  evergreen: renderEvergreen,
  poem: renderPoem,
  story: renderStory,
  bookshelf: renderBookshelf,
  nordletter: renderNordletter
};

export function getFeedPosts(posts: Post[]): Post[] {
  const categorySet = new Set(FEED_CATEGORIES);
  return posts
    .filter((post) => categorySet.has(post.data.category))
    .sort((a, b) => postDate(b).getTime() - postDate(a).getTime());
}

// Entries are rendered once per build and reused across the homepage and every
// /api/feed/ page, so memoize per post.
const entryCache = new Map<string, Promise<FeedEntry>>();

export function toFeedEntry(post: Post): Promise<FeedEntry> {
  const cacheKey = `${post.data.category}/${post.id}`;
  let cached = entryCache.get(cacheKey);
  if (!cached) {
    const render = RENDERERS[post.data.category] ?? renderBlog;
    cached = Promise.resolve(render(post)).then((html) => ({
      html,
      group: CATEGORY_TO_GROUP[post.data.category],
      month: monthLabel(postDate(post))
    }));
    entryCache.set(cacheKey, cached);
  }
  return cached;
}

export async function getFeedEntriesForGroup(posts: Post[], group: FeedGroup): Promise<FeedEntry[]> {
  const feedPosts = getFeedPosts(posts);
  const scoped =
    group === 'all'
      ? feedPosts
      : feedPosts.filter((post) => CATEGORY_TO_GROUP[post.data.category] === group);
  return Promise.all(scoped.map(toFeedEntry));
}
