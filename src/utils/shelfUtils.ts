/**
 * Shared utilities for the shelf system (books, film, TV, games).
 */

/** Slugify a string for use in URLs and grouping keys. */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip accents
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/** Normalize a title for rewatch grouping (lowercase, strip punctuation). */
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export interface WatchableEntry {
    title: string;
    date?: Date | string | null;
}

/**
 * Given a list of entries (film/TV/game/book), compute the watch/play number
 * for each entry based on how many times the same title appears.
 *
 * Entries with watchNumber > 1 are rewatches/replays.
 * No frontmatter changes needed — this is computed at build time.
 *
 * @returns A Map from entry index to watchNumber (1-based)
 */
export function computeWatchNumbers<T extends WatchableEntry>(
    entries: T[]
): Map<number, number> {
    // Group entry indices by normalized title
    const groups = new Map<string, number[]>();

    entries.forEach((entry, i) => {
        const key = normalizeTitle(entry.title);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(i);
    });

    const result = new Map<number, number>();

    groups.forEach((indices) => {
        if (indices.length === 1) {
            result.set(indices[0], 1);
            return;
        }

        // Sort indices by date ascending to assign watch numbers chronologically
        const sorted = [...indices].sort((a, b) => {
            const dateA = toTime(entries[a].date);
            const dateB = toTime(entries[b].date);
            return dateA - dateB;
        });

        sorted.forEach((idx, position) => {
            result.set(idx, position + 1);
        });
    });

    return result;
}

function toTime(value: Date | string | null | undefined): number {
    if (!value) return 0;
    const d = value instanceof Date ? value : new Date(value);
    const t = d.getTime();
    return Number.isNaN(t) ? 0 : t;
}

/** Parse a date value safely, returning null if invalid. */
export function parseDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a date as YYYY-MM-DD. */
export function formatYMD(value: Date | string | null | undefined): string | null {
    const d = parseDate(value);
    return d ? d.toISOString().slice(0, 10) : null;
}
