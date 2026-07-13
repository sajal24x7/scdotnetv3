/**
 * Threads backfeed collector.
 *
 * Reads replies and like counts for syndicated Threads posts via the
 * Threads API (graph.threads.net), using the same THREADS_ACCESS_TOKEN /
 * THREADS_USER_ID credentials the syndicator publishes with.
 *
 * Platform limits shape what lands in the index (see
 * planning/webmention-interactions-plan.md, Phase 2):
 * - Reading replies needs the threads_read_replies scope; without it the
 *   collector warns once and ships like counts only.
 * - Likes are counts only (threads_manage_insights) — Threads never exposes
 *   who liked, so the total becomes a single `like-count` entry rendered as
 *   a count chip instead of a facepile.
 */

import { makeEntry, plainTextToHtml, toIsoTimestamp, warnOnce } from './shared.js';
import { graphFetch, graphFetchAll, isGoneError, isPermissionError, resolveMediaIds } from './meta.js';

const API = 'https://graph.threads.net/v1.0';

// Reply moderation states that should stay visible on the site.
const VISIBLE_HIDE_STATUS = new Set(['NOT_HUSHED', 'UNHUSHED']);

/** Credentials from the environment, or null when Threads isn't configured. */
export function threadsConfig() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN?.trim();
  const userId = process.env.THREADS_USER_ID?.trim();
  return accessToken && userId ? { accessToken, userId } : null;
}

/**
 * Parse a Threads permalink like
 * https://www.threads.com/@sajal24x7/post/DO4LuP2Dxpu (threads.net before
 * the domain move). Returns { username, shortcode } or null.
 */
export function parseThreadsUrl(url) {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)threads\.(com|net)$/.test(parsed.hostname)) return null;
    const match = parsed.pathname.match(/^\/@([^/]+)\/post\/([^/]+?)\/?$/);
    if (!match) return null;
    return { username: match[1], shortcode: match[2] };
  } catch {
    return null;
  }
}

/** Resolve permalink shortcodes → Threads media ids (see meta.js). */
export function resolveThreadsMediaIds({ config, wanted, cache, rateLimiter }) {
  return resolveMediaIds({
    listUrl: `${API}/${config.userId}/threads?fields=id,permalink&limit=100`,
    accessToken: config.accessToken,
    wanted,
    cache,
    parsePermalink: parseThreadsUrl,
    rateLimiter,
  });
}

/**
 * /conversation returns the whole flattened reply tree but only works on
 * root posts; /replies (direct replies only) is the fallback for the later
 * members of a syndicated chain.
 */
async function fetchReplies(ref, config, rateLimiter) {
  const fields = 'id,text,username,permalink,timestamp,hide_status';
  let lastError;
  for (const edge of ['conversation', 'replies']) {
    try {
      return await graphFetchAll(
        `${API}/${ref.mediaId}/${edge}?fields=${fields}&limit=100`,
        config.accessToken,
        rateLimiter
      );
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function fetchLikeCount(ref, config, rateLimiter) {
  const { ok, status, data } = await graphFetch(
    `${API}/${ref.mediaId}/insights?metric=likes`,
    config.accessToken,
    rateLimiter
  );
  if (!ok) {
    if (isPermissionError(data)) {
      warnOnce(
        'threads-insights',
        '  ⚠️  Threads like counts unavailable — token lacks threads_manage_insights; re-authorize to backfeed them.'
      );
      return 0;
    }
    if (isGoneError(status, data)) return 0;
    throw new Error(`Threads insights for ${ref.shortcode} returned ${status}: ${data?.error?.message ?? 'unknown error'}`);
  }
  const metric = data?.data?.find((item) => item.name === 'likes') ?? data?.data?.[0];
  return metric?.total_value?.value ?? metric?.values?.[0]?.value ?? 0;
}

/**
 * Collect interactions for one post's Threads copies — a post syndicated as
 * a chain has several refs ({ shortcode, username, url, mediaId }), whose
 * like counts are summed and whose overlapping conversations are deduped.
 * Returns { gone, entries, goneShortcodes } so the caller can prune deleted
 * media from the resolution cache.
 */
export async function collectThreadsInteractions(refs, config, rateLimiter) {
  // Chain members show up as "replies" in each other's conversations; they
  // are our own posts, not responses.
  const ownShortcodes = new Set(refs.map((ref) => ref.shortcode));
  const entries = [];
  const seenReplyIds = new Set();
  const goneShortcodes = [];
  let likeCount = 0;

  for (const ref of refs) {
    const replies = await fetchReplies(ref, config, rateLimiter);
    if (replies.gone) {
      goneShortcodes.push(ref.shortcode);
      continue;
    }
    if (replies.permission) {
      warnOnce(
        'threads-replies',
        '  ⚠️  Threads replies unavailable — token lacks threads_read_replies; re-authorize to backfeed them.'
      );
    }

    for (const reply of replies.items) {
      if (!reply?.id || seenReplyIds.has(reply.id)) continue;
      seenReplyIds.add(reply.id);
      if (reply.hide_status && !VISIBLE_HIDE_STATUS.has(reply.hide_status)) continue;
      const permalink = reply.permalink ? parseThreadsUrl(reply.permalink) : null;
      if (permalink && ownShortcodes.has(permalink.shortcode)) continue;
      entries.push(
        makeEntry({
          platform: 'threads',
          type: 'reply',
          nativeId: reply.id,
          author: {
            name: reply.username,
            ...(reply.username ? { url: `https://www.threads.com/@${reply.username}` } : {}),
          },
          content: plainTextToHtml(reply.text),
          url: reply.permalink,
          published: toIsoTimestamp(reply.timestamp),
        })
      );
    }

    likeCount += await fetchLikeCount(ref, config, rateLimiter);
  }

  if (goneShortcodes.length === refs.length) {
    return { gone: true, entries: [], goneShortcodes };
  }

  if (likeCount > 0) {
    const root = refs.find((ref) => !goneShortcodes.includes(ref.shortcode)) ?? refs[0];
    entries.push(
      makeEntry({
        platform: 'threads',
        type: 'like-count',
        nativeId: root.shortcode,
        author: { name: 'Threads' },
        url: root.url,
        count: likeCount,
      })
    );
  }

  return { gone: false, entries, goneShortcodes };
}
