/**
 * Instagram backfeed collector.
 *
 * Reads comments and like counts for syndicated Instagram posts via the
 * "Instagram API with Instagram Login" (graph.instagram.com) — the same
 * INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID credentials
 * scripts/lib/platforms/instagram.js publishes with.
 *
 * Platform limits shape what lands in the index (see
 * planning/webmention-interactions-plan.md, Phase 2):
 * - Reading comments needs instagram_business_manage_comments; the
 *   publish-only token may lack it, in which case the collector warns once
 *   and ships like counts only until a re-auth adds the scope.
 * - Likes are counts only (`like_count` on the media object) — Instagram
 *   never exposes who liked, so the total becomes a `like-count` entry
 *   rendered as a count chip.
 * - Comments have no individual permalinks, so entries link to the post.
 */

import { makeEntry, plainTextToHtml, toIsoTimestamp, warnOnce } from './shared.js';
import { graphFetch, graphFetchAll, isGoneError, resolveMediaIds } from './meta.js';

const API = 'https://graph.instagram.com/v23.0';

/** Credentials from the environment, or null when Instagram isn't configured. */
export function instagramConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  return accessToken && userId ? { accessToken, userId } : null;
}

/**
 * Parse an Instagram permalink like https://www.instagram.com/p/DameQ6ODoIl/
 * (also /reel/ and /tv/). Returns { shortcode } or null.
 */
export function parseInstagramUrl(url) {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)instagram\.com$/.test(parsed.hostname)) return null;
    const match = parsed.pathname.match(/^\/(?:p|reel|tv)\/([^/]+)\/?$/);
    if (!match) return null;
    return { shortcode: match[1] };
  } catch {
    return null;
  }
}

/** Resolve permalink shortcodes → Instagram media ids (see meta.js). */
export function resolveInstagramMediaIds({ config, wanted, cache, rateLimiter }) {
  return resolveMediaIds({
    listUrl: `${API}/${config.userId}/media?fields=id,permalink&limit=100`,
    accessToken: config.accessToken,
    wanted,
    cache,
    parsePermalink: parseInstagramUrl,
    rateLimiter,
  });
}

function commentToEntry(comment, ref) {
  return makeEntry({
    platform: 'instagram',
    type: 'reply',
    nativeId: comment.id,
    author: {
      name: comment.username,
      ...(comment.username ? { url: `https://www.instagram.com/${comment.username}/` } : {}),
    },
    content: plainTextToHtml(comment.text),
    url: ref.url, // comments have no permalink of their own
    published: toIsoTimestamp(comment.timestamp),
  });
}

/**
 * Collect interactions for one post's Instagram copies (usually a single
 * ref: { shortcode, url, mediaId }). Returns { gone, entries,
 * goneShortcodes } so the caller can prune deleted media from the
 * resolution cache.
 */
export async function collectInstagramInteractions(refs, config, rateLimiter) {
  const entries = [];
  const goneShortcodes = [];
  let likeCount = 0;

  for (const ref of refs) {
    const media = await graphFetch(`${API}/${ref.mediaId}?fields=like_count`, config.accessToken, rateLimiter);
    if (!media.ok) {
      if (isGoneError(media.status, media.data)) {
        goneShortcodes.push(ref.shortcode);
        continue;
      }
      throw new Error(
        `Instagram media ${ref.shortcode} returned ${media.status}: ${media.data?.error?.message ?? 'unknown error'}`
      );
    }
    likeCount += media.data?.like_count ?? 0;

    const comments = await graphFetchAll(
      `${API}/${ref.mediaId}/comments?fields=id,text,username,timestamp,hidden,replies{id,text,username,timestamp,hidden}&limit=50`,
      config.accessToken,
      rateLimiter
    );
    if (comments.permission) {
      warnOnce(
        'instagram-comments',
        '  ⚠️  Instagram comments unavailable — token lacks instagram_business_manage_comments; shipping like counts only.'
      );
      continue;
    }
    for (const comment of comments.items) {
      if (!comment?.id || comment.hidden) continue;
      entries.push(commentToEntry(comment, ref));
      for (const nested of comment.replies?.data ?? []) {
        if (!nested?.id || nested.hidden) continue;
        entries.push(commentToEntry(nested, ref));
      }
    }
  }

  if (goneShortcodes.length === refs.length) {
    return { gone: true, entries: [], goneShortcodes };
  }

  if (likeCount > 0) {
    const root = refs.find((ref) => !goneShortcodes.includes(ref.shortcode)) ?? refs[0];
    entries.push(
      makeEntry({
        platform: 'instagram',
        type: 'like-count',
        nativeId: root.shortcode,
        author: { name: 'Instagram' },
        url: root.url,
        count: likeCount,
      })
    );
  }

  return { gone: false, entries, goneShortcodes };
}
