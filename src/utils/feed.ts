import type { ImageMetadata } from 'astro';
import type { Post } from './content';
import { parseMarkdown } from './markdown';
import { cleanNordletterTitle, extractEditionNumber } from './content';
import { getBookCoverImage } from './bookCovers';
import { getFilmCoverImage } from './filmCovers';
import { getTVCoverImage } from './tvCovers';
import { getGameCoverImage } from './gameCovers';
import { bookRatingLabels } from './bookRatings';
import { convertWikilinks } from './remarkWikilinks';
import { formatRelativeDate } from './dateFormat';
import { getPhotoImages } from './photos';
import nordletterManifest from '../data/nordletter-image-manifest.json';

export const FEED_PAGE_SIZE = 10;

export const FEED_GROUPS = {
  stream: ['blog', 'micro', 'photo'],
  garden: ['evergreen', 'til', 'bookshelf', 'filmshelf', 'tvshelf', 'gameshelf', 'story', 'poem', 'now'],
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
  filmshelf: 'Filmshelf',
  tvshelf: 'TVshelf',
  gameshelf: 'Gameshelf',
  story: 'Story',
  poem: 'Poem',
  now: 'Now',
  nordletter: 'Nordletter'
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

function updatedDate(post: Post): Date | null {
  const { updated } = post.data;
  if (!updated) {
    return null;
  }
  const date = updated instanceof Date ? updated : new Date(updated);
  return Number.isNaN(date.getTime()) ? null : date;
}

// The feed is ordered by last activity: updated when present, created otherwise
function effectiveDate(post: Post): Date {
  const updated = updatedDate(post);
  const created = postDate(post);
  return updated && updated.getTime() > created.getTime() ? updated : created;
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

// Entries touched well after publication label their date as an update
const UPDATED_LABEL_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function metaHtml(post: Post, extra = ''): string {
  const category = post.data.category;
  const label = CATEGORY_LABELS[category] ?? category;
  const created = postDate(post);
  const date = effectiveDate(post);
  const isUpdate = date.getTime() - created.getTime() > UPDATED_LABEL_THRESHOLD_MS;
  const dateText = `${isUpdate ? 'updated ' : ''}${formatRelativeDate(date)}`;
  const tooltip = isUpdate
    ? `Published ${dayLabel(created)} · Updated ${dayLabel(date)}`
    : dayLabel(created);
  // The date doubles as the permalink — the only link to the post for untitled entries like micro
  return `<div class="feed-entry__meta"><span class="card-chip">${escapeHtml(label)}</span><a class="card-chip feed-entry__date" title="${escapeHtml(tooltip)}" href="${postLink(post)}">${escapeHtml(dateText)}</a>${extra}</div>`;
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

async function renderMicro(post: Post): Promise<string> {
  const source = post.body ? await convertWikilinks(post.body) : '';
  const body = source ? parseMarkdown(source) : '';
  return `${metaHtml(post)}<div class="feed-entry__body prose dark:prose-invert">${body}</div>`;
}

async function renderPhoto(post: Post): Promise<string> {
  const source = post.body ? await convertWikilinks(post.body) : '';
  const body = source ? parseMarkdown(source) : '';
  // New-style photo posts keep their images in frontmatter, so the body is
  // caption-only — surface the first gallery image above it. Legacy posts
  // already embed images in the body.
  const bodyHasImage = /!\[[^\]]*\]\(/.test(post.body || '');
  const galleryImages = bodyHasImage ? [] : getPhotoImages(post.data, null);
  const galleryHtml = galleryImages.length > 0
    ? `<p><a href="${postLink(post)}"><img src="${escapeHtml(galleryImages[0])}" alt="" loading="lazy"></a></p>`
    : '';
  return `${metaHtml(post)}${titleHtml(post)}<div class="feed-entry__body feed-entry__body--photo prose dark:prose-invert">${galleryHtml}${body}</div>`;
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
  return `${metaHtml(post)}${titleHtml(post)}${excerptHtml(excerpt)}`;
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

// Shared row layout for all shelf categories: cover, "<verb>: <title>", credits · rating
const SHELF_VERBS: Record<string, string> = {
  reading: 'Reading',
  read: 'Finished',
  watching: 'Watching',
  watched: 'Watched',
  playing: 'Playing',
  played: 'Played',
  'on-hold': 'On hold'
};

function joinNames(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(', ') : value || '';
}

function renderShelf(
  post: Post,
  coverMeta: ImageMetadata | undefined,
  fallbackVerb: string,
  credits: string,
  displayTitle?: string
): string {
  const coverHtml = coverMeta
    ? `<img class="feed-entry__book-cover" src="${coverMeta.src}" alt="" loading="lazy" width="72" height="106">`
    : '<div class="feed-entry__book-cover feed-entry__book-cover--placeholder" aria-hidden="true"></div>';

  const rating = post.data.rating ? bookRatingLabels[post.data.rating] : '';
  const details = [credits, rating].filter(Boolean).join(' · ');
  const detailsHtml = details ? `<p class="feed-entry__book-note">${escapeHtml(details)}</p>` : '';
  const verb = (post.data.shelfStatus && SHELF_VERBS[post.data.shelfStatus]) || fallbackVerb;
  const baseTitle = displayTitle ?? post.data.title;
  const title = baseTitle ? `${verb}: ${baseTitle}` : undefined;

  return `${metaHtml(post)}<div class="feed-entry__book">${coverHtml}<div>${titleHtml(post, title)}${detailsHtml}</div></div>`;
}

function renderBookshelf(post: Post): string {
  const coverMeta = post.data.cover ? getBookCoverImage(post.data.cover as any) : undefined;
  return renderShelf(post, coverMeta, 'Finished', joinNames(post.data.author));
}

function renderFilmshelf(post: Post): string {
  const coverMeta = post.data.cover ? getFilmCoverImage(post.data.cover as any) : undefined;
  return renderShelf(post, coverMeta, 'Watched', joinNames(post.data.director));
}

function renderTvshelf(post: Post): string {
  const coverMeta = post.data.cover ? getTVCoverImage(post.data.cover as any) : undefined;
  const title = post.data.title
    ? `${post.data.title}${post.data.season ? ` · Season ${post.data.season}` : ''}`
    : undefined;
  return renderShelf(post, coverMeta, 'Watched', joinNames(post.data.creator), title);
}

function renderGameshelf(post: Post): string {
  const coverMeta = post.data.cover ? getGameCoverImage(post.data.cover as any) : undefined;
  const credits = [post.data.developer, post.data.platform].filter(Boolean).join(' · ');
  return renderShelf(post, coverMeta, 'Played', credits);
}

function renderNow(post: Post): string {
  const excerpt = post.data.description || bodySnippet(post);
  return `${metaHtml(post)}${titleHtml(post)}${excerptHtml(excerpt)}`;
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
  filmshelf: renderFilmshelf,
  tvshelf: renderTvshelf,
  gameshelf: renderGameshelf,
  now: renderNow,
  nordletter: renderNordletter
};

export function getFeedPosts(posts: Post[]): Post[] {
  const categorySet = new Set(FEED_CATEGORIES);
  return posts
    .filter((post) => categorySet.has(post.data.category))
    .sort((a, b) => effectiveDate(b).getTime() - effectiveDate(a).getTime());
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
      month: monthLabel(effectiveDate(post))
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
