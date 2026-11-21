/**
 * Content Formatter for POSSE Syndication
 *
 * Builds the short social post for each category. The style is one or two
 * lines plus a bare link back, with no "Read more" text. Hashtags only go
 * out on photo posts. See docs/operations/syndication.md for the rules.
 *
 * Platform limits come from syndication.config.json at the repo root.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const CONFIG_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'syndication.config.json'
);
export const SYNDICATION_CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const PLATFORM_CONFIG = SYNDICATION_CONFIG.platforms;
const HASHTAG_CATEGORIES = new Set(SYNDICATION_CONFIG.defaults.hashtagCategories || []);
const MAX_HASHTAGS = SYNDICATION_CONFIG.defaults.maxHashtags || 3;

const SITE_URL = 'https://sajalchoudhary.net';
const HAIKU_PAGE_URL = `${SITE_URL}/haiku/`;
const SHELF_VERBS = {
  bookshelf: 'reading',
  filmshelf: 'watching',
  tvshelf: 'watching',
  gameshelf: 'playing'
};

const URL_REGEX = /https?:\/\/[^\s)]+/g;
const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

/**
 * Length of `text` as the platform counts it. Mastodon counts every URL
 * as `urlLength` characters; Bluesky counts graphemes, so an emoji is one.
 */
function measure(text, config) {
  let counted = text;
  if (config.urlLength) {
    counted = counted.replace(URL_REGEX, 'x'.repeat(config.urlLength));
  }
  if (config.countGraphemes && segmenter) {
    return [...segmenter.segment(counted)].length;
  }
  return [...counted].length;
}

function fits(text, config) {
  return measure(text, config) <= config.maxLength;
}

/**
 * Shorten `text` so that `text + suffix` fits the platform limit. Cuts at
 * the last sentence end that fits, else at a word boundary with "…".
 */
function truncateToFit(text, suffix, config) {
  if (fits(text + suffix, config)) {
    return text;
  }

  // Sentence ends: punctuation followed by whitespace or the end of text
  const sentenceEnds = [...text.matchAll(/[.!?…](?=\s|$)/g)].map(m => m.index + 1);
  for (let i = sentenceEnds.length - 1; i >= 0; i--) {
    const cut = text.slice(0, sentenceEnds[i]).trim();
    if (fits(cut + suffix, config)) {
      return cut;
    }
  }

  const words = text.split(/(\s+)/);
  while (words.length > 0) {
    words.pop();
    const cut = `${words.join('').trimEnd()}…`;
    if (fits(cut + suffix, config)) {
      return cut;
    }
  }
  return '';
}

/**
 * `text`, a blank line, then `url`, shortening `text` if needed
 */
function withLink(text, url, config) {
  const suffix = `\n\n${url}`;
  const lead = truncateToFit(text, suffix, config);
  return lead ? `${lead}${suffix}` : url;
}

/**
 * Resolve an image reference to an absolute URL
 */
function resolveImageUrl(src) {
  if (/^https?:\/\//.test(src)) {
    return src;
  }
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

/**
 * Extract markdown images (![alt](url)) from text
 */
function extractImages(text) {
  const images = [];
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;

  while ((match = imageRegex.exec(text || '')) !== null) {
    images.push({
      alt: match[1].trim(),
      url: resolveImageUrl(match[2].trim())
    });
  }

  return images;
}

function stripImages(text) {
  return (text || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '');
}

/**
 * Markdown to plain text for social posts. Line breaks are kept (poems,
 * haiku); images are removed (they upload natively); links become
 * "text (url)"; blockquotes become quoted text.
 */
function toPlainText(body, { dropQuotes = false } = {}) {
  let text = stripImages(body);

  // Blockquote blocks → quoted text, or dropped entirely
  text = text.replace(/(?:^>[^\n]*\n?)+/gm, (block) => {
    if (dropQuotes) return '\n';
    const quote = block.replace(/^>\s?/gm, '').replace(/\n+/g, ' ').trim();
    return quote ? `"${quote}"\n` : '';
  });

  // Markdown links → "text (url)", or just the URL when the text is the URL
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const cleanLabel = label.trim();
    const cleanUrl = resolveImageUrl(url.trim());
    return cleanLabel === url.trim() ? cleanUrl : `${cleanLabel} (${cleanUrl})`;
  });

  // Headings, emphasis and code markers
  text = text.replace(/^#+\s*/gm, '').replace(/[*_`]/g, '');

  // Markdown hard breaks (trailing spaces or a trailing backslash)
  text = text.replace(/[ \t]*\\?[ \t]*$/gm, '');

  // Collapse blank lines left behind by removed images and quotes
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * A link post starts with a line that is only a markdown link to the
 * thing being shared. Returns that URL, or null for a plain note.
 */
function findSharedLink(body) {
  const firstLine = stripImages(body).split('\n').find(line => line.trim());
  const match = firstLine && firstLine.trim().match(/^\[[^\]]+\]\((https?:\/\/[^)\s]+)\)$/);
  return match ? match[1] : null;
}

function generateHashtags(post) {
  if (!post.data.tags || post.data.tags.length === 0) {
    return '';
  }

  return post.data.tags
    .slice(0, MAX_HASHTAGS)
    .map(tag => `#${String(tag).replace(/[^a-zA-Z0-9]/g, '')}`)
    .join(' ');
}

function getPostUrl(post) {
  return `${SITE_URL}/${post.data.category}/${post.slug}/`;
}

/**
 * Micro: your comments plus the link to the shared item. The quoted
 * excerpt is skipped. If the comments don't fit, they are shortened and
 * the link points at the post on the site instead. Plain notes (no shared
 * link) post in full, or shortened with a link to the post.
 */
function formatMicro(post, config, postUrl) {
  const sharedUrl = findSharedLink(post.body);

  if (sharedUrl) {
    const withoutLinkLine = stripImages(post.body).replace(/^\s*\[[^\]]+\]\([^)]+\)[ \t]*\n?/, '');
    const comments = toPlainText(withoutLinkLine, { dropQuotes: true }) || post.data.title || '';
    const full = `${comments}\n\n${sharedUrl}`;
    return fits(full, config) ? full : withLink(comments, postUrl, config);
  }

  const text = toPlainText(post.body) || post.data.title || '';
  return fits(text, config) ? text : withLink(text, postUrl, config);
}

/**
 * Photo: the caption verbatim with hashtags. If too long, the caption is
 * shortened and a link to the post is added before the hashtags.
 */
function formatPhoto(post, config, postUrl) {
  const hashtags = generateHashtags(post);
  const tagSuffix = hashtags ? `\n\n${hashtags}` : '';
  const caption = toPlainText(post.body) || post.data.title || '';

  if (fits(caption + tagSuffix, config)) {
    return (caption + tagSuffix).trim();
  }

  const linkSuffix = `\n\n${postUrl}${tagSuffix}`;
  const lead = truncateToFit(caption, linkSuffix, config);
  return lead ? `${lead}${linkSuffix}` : `${postUrl}${tagSuffix}`;
}

/**
 * Haiku: "No. 12", the verse with its line breaks, then a link to the
 * /haiku/ page. Whole trailing lines drop if it ever overflows.
 */
function formatHaiku(post, config) {
  const footer = `\n\nRead all haiku: ${HAIKU_PAGE_URL}`;
  const header = post.data.number ? `No. ${post.data.number}\n\n` : '';
  const lines = toPlainText(post.body).split('\n');

  let verse = lines.join('\n');
  while (!fits(header + verse + footer, config) && lines.length > 1) {
    lines.pop();
    verse = `${lines.join('\n')}\n…`;
  }

  return header + (verse || post.data.title || 'New haiku') + footer;
}

/**
 * Poem: the full poem, line breaks kept and no title, when it fits.
 * Otherwise the title and a link back.
 */
function formatPoem(post, config, postUrl) {
  const verse = toPlainText(post.body);
  if (verse && fits(verse, config)) {
    return verse;
  }
  return withLink((post.data.title || '').trim() || 'New poem', postUrl, config);
}

/**
 * Shelf notes with the template boilerplate removed: empty "Review" and
 * "Notes" headings and auto lines such as "Finished watching on 2026-11-09."
 */
function shelfNotes(body) {
  const boilerplate = /^finished (reading|watching|playing)( this season| season \d+)?( on \S+)?\.?$/i;
  return toPlainText(body)
    .split('\n')
    .filter(line => !/^(review|notes)$/i.test(line.trim()) && !boilerplate.test(line.trim()))
    .join('\n')
    .trim();
}

function shelfName(post) {
  const { category, title, showTitle, season } = post.data;
  if (category === 'tvshelf' && season) {
    return `${showTitle || title}, season ${season}`;
  }
  return title || 'it';
}

/**
 * Shelf (finished only):
 *   notes + description → "<description>\n\nMy review: <link>"
 *   notes, no description → "Finished watching X. My review: <link>"
 *   no notes → "Finished watching X" (no link)
 */
function formatShelf(post, config, postUrl) {
  const verb = SHELF_VERBS[post.data.category] || 'reading';
  const finished = `Finished ${verb} ${shelfName(post)}`;

  if (!shelfNotes(post.body)) {
    return truncateToFit(finished, '', config);
  }

  const description = (post.data.description || '').trim();
  if (description) {
    const suffix = `\n\nMy review: ${postUrl}`;
    return `${truncateToFit(description, suffix, config)}${suffix}`;
  }

  const suffix = `. My review: ${postUrl}`;
  return `${truncateToFit(finished, suffix, config)}${suffix}`;
}

/**
 * Format content for a specific platform
 */
export function formatContentForPlatform(post, platform) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  const postUrl = getPostUrl(post);
  const category = (post.data.category || '').toLowerCase();
  const title = (post.data.title || '').trim();
  let content;

  if (category === 'micro') {
    content = formatMicro(post, config, postUrl);
  } else if (category === 'photo') {
    content = formatPhoto(post, config, postUrl);
  } else if (category === 'haiku') {
    content = formatHaiku(post, config);
  } else if (category === 'poem') {
    content = formatPoem(post, config, postUrl);
  } else if (category in SHELF_VERBS) {
    content = formatShelf(post, config, postUrl);
  } else if (category === 'til') {
    content = withLink(title || 'New TIL', postUrl, config);
  } else {
    // Blog, Nordletter, evergreen, story and other long-form posts
    content = withLink(post.data.description || title || 'New post', postUrl, config);
  }

  // Images to attach as native media (micro and photo posts).
  // Photo posts keep their gallery in frontmatter `images:`; micro posts
  // embed markdown images in the body.
  let images = [];
  if (category === 'micro' || category === 'photo') {
    if (Array.isArray(post.data.images) && post.data.images.length > 0) {
      images = post.data.images.map((url) => ({
        url: resolveImageUrl(String(url).trim()),
        alt: post.data.title || ''
      }));
    } else {
      images = extractImages(post.body);
    }
    if (images.length === 0 && post.data.image) {
      images = [{ url: resolveImageUrl(post.data.image), alt: post.data.title || '' }];
    }
  }

  return {
    text: content.trim(),
    url: postUrl,
    title: post.data.title,
    category: post.data.category,
    tags: post.data.tags || [],
    image: post.data.image ? resolveImageUrl(post.data.image) : (images[0]?.url || null),
    images,
    originalPost: post
  };
}

/**
 * Measure text the way a platform counts it (exported for tests)
 */
export function measureForPlatform(text, platform) {
  return measure(text, PLATFORM_CONFIG[platform]);
}
