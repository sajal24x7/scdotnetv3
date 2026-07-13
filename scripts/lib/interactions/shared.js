/**
 * Shared helpers for the interactions backfeed collectors.
 *
 * Every collector returns entries in the shape stored in
 * src/data/interactions-index.json and rendered by
 * src/components/interactions/Interactions.astro — keep the two in sync.
 */

import sanitizeHtml from 'sanitize-html';

// Only formatting survives; everything else (images, scripts, styles,
// classes) is dropped so third-party HTML can never affect the site.
const SANITIZE_OPTIONS = {
  allowedTags: ['p', 'a', 'br', 'em', 'strong', 'code', 'blockquote'],
  allowedAttributes: {
    a: ['href', 'rel', 'target'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'nofollow noopener noreferrer',
      target: '_blank',
    }),
  },
};

/**
 * Sanitize third-party HTML (e.g. Mastodon status content) for storage.
 */
export function sanitizeInteractionHtml(html) {
  if (!html) return '';
  return sanitizeHtml(String(html), SANITIZE_OPTIONS).trim();
}

/**
 * Escape plain text (e.g. Bluesky post text) into a single sanitized
 * HTML paragraph, preserving line breaks.
 */
export function plainTextToHtml(text) {
  if (!text) return '';
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
  return sanitizeInteractionHtml(`<p>${escaped}</p>`);
}

/**
 * Build a normalized interaction entry. Collectors funnel everything
 * through here so the index stays uniform.
 *
 * @param {object} fields
 * @param {string} fields.platform - mastodon | bluesky | threads | instagram | web | email
 * @param {string} fields.type - reply | like | repost | mention | like-count
 * @param {string} fields.nativeId - platform-native id, unique per (platform, type)
 * @param {{name: string, url?: string, avatar?: string}} fields.author
 * @param {string} [fields.content] - sanitized HTML (replies only)
 * @param {string} [fields.url] - permalink to the interaction
 * @param {string} [fields.published] - ISO timestamp when known
 * @param {number} [fields.count] - aggregate total ("like-count" entries only)
 */
export function makeEntry({ platform, type, nativeId, author, content, url, published, count }) {
  const entry = {
    id: `${platform}:${type}:${nativeId}`,
    type,
    platform,
    author: {
      name: author?.name || 'Someone',
      ...(author?.url ? { url: author.url } : {}),
      ...(author?.avatar ? { avatar: author.avatar } : {}),
    },
    ...(content ? { content } : {}),
    ...(url ? { url } : {}),
    ...(published ? { published } : {}),
    ...(typeof count === 'number' ? { count } : {}),
    status: 'approved',
  };
  return entry;
}

/**
 * Normalize timestamps to the UTC ISO form the index sorts by — Meta's
 * Graph APIs return "+0000"-suffixed strings that would collate wrongly
 * against the "Z"-suffixed ones from other platforms.
 */
export function toIsoTimestamp(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

const warned = new Set();

/**
 * Warn about a platform-level condition (e.g. a missing OAuth scope) once
 * per run instead of once per polled post.
 */
export function warnOnce(key, message) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(message);
}

/**
 * Fetch JSON with a timeout. Returns { ok, status, data }.
 * Network-level failures are rethrown so callers can decide whether the
 * whole run should fail; HTTP errors are returned for per-post handling.
 */
export async function fetchJson(url, { headers = {}, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json', ...headers },
      signal: controller.signal,
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      // Non-JSON body on an error status is fine; callers check `ok`.
    }
    return { ok: response.ok, status: response.status, data, headers: response.headers };
  } finally {
    clearTimeout(timer);
  }
}
