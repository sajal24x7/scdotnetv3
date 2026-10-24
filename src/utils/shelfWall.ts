/**
 * Helpers for the cover-wall shelf pages (/bookshelf, /filmshelf, /tvshelf)
 * and the TV season pages.
 *
 * Kept free of `astro:*` imports so the pure functions run under
 * `node --experimental-strip-types` in src/utils/__checks__/shelfWall.check.ts.
 */

import { computeWatchNumbers } from './shelfUtils.ts';

// The one-line log `/write` and the import scripts put in an entry's body when
// there is nothing else to say ("Finished watching Season 2 on 2020-08-02.").
const LOG_LINE = /^(finished|started)\s+(watching|reading|playing)(\s+season\s+\d+)?(\s+on\s+[\d-]+)?\.?$/i;

/** True when a shelf entry's body holds real notes, not just the auto log line. */
export function hasShelfNotes(body: string | undefined | null): boolean {
    const text = (body ?? '').trim();
    return text.length > 0 && !LOG_LINE.test(text.replace(/\s+/g, ' '));
}

/** Most recent activity date for a shelf entry: finished, then started, then created. */
export function activityDate(data: { finished?: Date | string | null; started?: Date | string | null; created?: Date | string | null }): Date {
    for (const value of [data.finished, data.started, data.created]) {
        if (!value) continue;
        const d = value instanceof Date ? value : new Date(value);
        if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date(0);
}

/** Ordinal label for a repeat: "2nd watch", "3rd read". */
export function repeatLabel(watchNumber: number, verb: 'watch' | 'read' | 'play'): string {
    const n = watchNumber;
    const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
    return `${n}${suffix} ${verb}`;
}

/** The fields of a tvshelf entry the grouping needs. */
export interface TvEntryLike {
    id: string;
    body?: string;
    data: {
        title?: string;
        showTitle?: string;
        season?: number;
        status?: string;
        finished?: Date | string | null;
        started?: Date | string | null;
        created?: Date | string | null;
    };
}

export interface TvWatch<T extends TvEntryLike> {
    post: T;
    season: number | null;
    /** URL segment of the season page, e.g. "s1" or "s1-2026"; null for a limited series. */
    seasonSlug: string | null;
    /** This watch's page, e.g. "/tvshelf/friends/s1/"; a limited series' first watch is "/tvshelf/glory/". */
    path: string;
    /** 1 for the first watch of this season, 2+ for rewatches. */
    watchNumber: number;
    date: Date;
    notes: boolean;
}

export interface TvShow<T extends TvEntryLike> {
    showTitle: string;
    showSlug: string;
    /** Every logged watch (todo stubs left out), oldest first. */
    watches: TvWatch<T>[];
    latest: TvWatch<T>;
}

const showKey = (post: TvEntryLike) => post.data.showTitle ?? post.data.title ?? 'Unknown';

/**
 * Group tvshelf entries into shows.
 *
 * The show slug is taken from the first entry of each show in `posts` order.
 * Every page and link builds its URL from the returned `path`, so they always
 * match. Todo stubs are left out of the returned watches.
 */
export function groupTvShows<T extends TvEntryLike>(posts: readonly T[]): TvShow<T>[] {
    const slugs = new Map<string, string>();
    for (const post of posts) {
        const key = showKey(post);
        if (!slugs.has(key)) slugs.set(key, post.id.split('/')[0]);
    }

    const logged = posts.filter((post) => post.data.status !== 'todo');
    // A rewatch is a second entry for the same show and season.
    const numbers = computeWatchNumbers(logged.map((post) => ({
        title: `${showKey(post)} season ${post.data.season ?? 'limited'}`,
        date: post.data.finished ?? post.data.started ?? post.data.created,
    })));

    const shows = new Map<string, TvWatch<T>[]>();
    logged.forEach((post, i) => {
        const key = showKey(post);
        const season = post.data.season ?? null;
        const watch: TvWatch<T> = {
            post,
            season,
            seasonSlug: season === null ? null : (post.id.split('/')[1] || `s${season}`),
            path: '',
            watchNumber: numbers.get(i) ?? 1,
            date: activityDate(post.data),
            notes: hasShelfNotes(post.body),
        };
        if (!shows.has(key)) shows.set(key, []);
        shows.get(key)!.push(watch);
    });

    return Array.from(shows.entries()).map(([showTitle, watches]) => {
        watches.sort((a, b) => a.date.getTime() - b.date.getTime());
        const showSlug = slugs.get(showTitle) ?? showTitle;
        for (const watch of watches) watch.path = watchPath(showSlug, watch);
        return {
            showTitle,
            showSlug,
            watches,
            latest: watches[watches.length - 1],
        };
    });
}

// A season lives at /tvshelf/<show>/<season slug>/. A limited series (no season)
// lives at the show URL itself, unless its id says otherwise ("glory-2026" for a
// rewatch logged by /write), which becomes /tvshelf/glory/glory-2026/.
function watchPath<T extends TvEntryLike>(showSlug: string, watch: TvWatch<T>): string {
    if (watch.seasonSlug) return `/tvshelf/${showSlug}/${watch.seasonSlug}/`;
    const last = watch.post.id.split('/').pop() ?? '';
    return last && last !== showSlug ? `/tvshelf/${showSlug}/${last}/` : `/tvshelf/${showSlug}/`;
}

export interface TvSeasonPill<T extends TvEntryLike> {
    season: number;
    /** Every watch of this season, oldest first. */
    watches: TvWatch<T>[];
    latest: TvWatch<T>;
}

/** One pill per season number, in season order; limited-series watches are left out. */
export function tvSeasonPills<T extends TvEntryLike>(show: TvShow<T>): TvSeasonPill<T>[] {
    const bySeason = new Map<number, TvWatch<T>[]>();
    for (const watch of show.watches) {
        if (watch.season === null) continue;
        if (!bySeason.has(watch.season)) bySeason.set(watch.season, []);
        bySeason.get(watch.season)!.push(watch);
    }
    return Array.from(bySeason.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([season, watches]) => ({ season, watches, latest: watches[watches.length - 1] }));
}
