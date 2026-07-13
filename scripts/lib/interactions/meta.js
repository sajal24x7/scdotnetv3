/**
 * Shared helpers for the Meta Graph API collectors (Threads + Instagram).
 *
 * Both platforms speak the same Graph dialect: Bearer-token auth, paging via
 * `paging.next`, and structured errors ({ error: { code, error_subcode } }).
 * Both also only accept media IDs while the site stores permalinks in
 * syndicationUrls, so the permalink → media-id resolution (cached in
 * src/data/interaction-sources.json) lives here too.
 */

import { fetchJson } from './shared.js';

// How much of the account's own media list one run will page through while
// resolving permalinks (100 items per page). If a permalink still isn't
// found within this cap, its fate is "unknown" rather than "deleted".
const MAX_LIST_PAGES = 25;

/**
 * Missing OAuth scope / feature permission — the token works but was never
 * granted this capability (e.g. threads_read_replies). Callers degrade
 * gracefully instead of failing the whole platform.
 */
export function isPermissionError(data) {
  const code = data?.error?.code;
  return code === 10 || (code >= 200 && code <= 299);
}

/**
 * The object no longer exists (deleted upstream) — Meta answers 400 with
 * code 100 / subcode 33 rather than a plain 404.
 */
export function isGoneError(status, data) {
  if (status === 404) return true;
  return data?.error?.code === 100 && data?.error?.error_subcode === 33;
}

function errorMessage(status, data) {
  return `${status}: ${data?.error?.message ?? 'unknown error'}`;
}

/** GET one Graph URL. Returns fetchJson's { ok, status, data }. */
export async function graphFetch(url, accessToken, rateLimiter) {
  await rateLimiter.checkLimit();
  return fetchJson(url, { headers: { authorization: `Bearer ${accessToken}` } });
}

/**
 * Follow `paging.next` and gather every `data` item.
 * Returns { items } on success, { gone: true } or { permission: true } for
 * the two recoverable Graph errors, and throws on anything else.
 */
export async function graphFetchAll(firstUrl, accessToken, rateLimiter, maxPages = 10) {
  const items = [];
  let url = firstUrl;
  for (let page = 0; page < maxPages && url; page++) {
    const { ok, status, data } = await graphFetch(url, accessToken, rateLimiter);
    if (!ok) {
      if (isGoneError(status, data)) return { gone: true, items: [] };
      if (isPermissionError(data)) return { permission: true, items: [] };
      throw new Error(`${new URL(firstUrl).pathname} returned ${errorMessage(status, data)}`);
    }
    items.push(...(data?.data ?? []));
    url = data?.paging?.next ?? null;
  }
  return { items };
}

/**
 * Resolve permalink shortcodes to media IDs by listing the account's own
 * media. `cache` (this platform's slice of interaction-sources.json) is
 * consulted first and updated in place — every listed permalink is cached,
 * so subsequent runs rarely need to page at all.
 *
 * Returns { ids: Map<shortcode, mediaId>, exhausted: boolean } — exhausted
 * means the full media list was seen, so a still-missing shortcode belongs
 * to a post deleted on the platform.
 */
export async function resolveMediaIds({ listUrl, accessToken, wanted, cache, parsePermalink, rateLimiter }) {
  const ids = new Map();
  const missing = new Set();
  for (const shortcode of wanted) {
    if (cache[shortcode]) ids.set(shortcode, cache[shortcode]);
    else missing.add(shortcode);
  }
  if (missing.size === 0) return { ids, exhausted: false };

  let url = listUrl;
  for (let page = 0; page < MAX_LIST_PAGES && url && missing.size > 0; page++) {
    const { ok, status, data } = await graphFetch(url, accessToken, rateLimiter);
    if (!ok) throw new Error(`media listing returned ${errorMessage(status, data)}`);
    for (const item of data?.data ?? []) {
      const shortcode = item.permalink ? parsePermalink(item.permalink)?.shortcode : null;
      if (!shortcode || !item.id) continue;
      cache[shortcode] = item.id;
      if (missing.delete(shortcode)) ids.set(shortcode, item.id);
    }
    url = data?.paging?.next ?? null;
  }

  return { ids, exhausted: !url };
}
