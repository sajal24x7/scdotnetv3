/**
 * Haiku helpers: the season a haiku was written in, its lines, and its place
 * in the daily practice.
 *
 * Seasons are meteorological and northern-hemisphere (Mar–May spring, Jun–Aug
 * summer, Sep–Nov autumn, Dec–Feb winter), read in the site timezone so a
 * haiku written late on 30 November in Helsinki stays an autumn haiku even
 * though the build runs in UTC. Each season splits into early / mid / late by
 * month, which gives every haiku a kigo-like marker without extra frontmatter.
 */

// Explicit .ts extension so the check script runs under
// `node --experimental-strip-types` as-is.
import { SITE_TIMEZONE } from './dateFormat.ts';

export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonPhase = 'early' | 'mid' | 'late';

export interface Season {
    key: SeasonKey;
    phase: SeasonPhase;
    // "Late autumn"
    label: string;
    // "Autumn 2026", or "Winter 2026–27" for a winter that spans New Year
    groupLabel: string;
    // Stable id for grouping, e.g. "2026-autumn" (winter uses its December year)
    groupId: string;
}

const SEASON_NAMES: Record<SeasonKey, string> = {
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter'
};

// Month (1–12) → season and phase
const MONTHS: Record<number, [SeasonKey, SeasonPhase]> = {
    12: ['winter', 'early'],
    1: ['winter', 'mid'],
    2: ['winter', 'late'],
    3: ['spring', 'early'],
    4: ['spring', 'mid'],
    5: ['spring', 'late'],
    6: ['summer', 'early'],
    7: ['summer', 'mid'],
    8: ['summer', 'late'],
    9: ['autumn', 'early'],
    10: ['autumn', 'mid'],
    11: ['autumn', 'late']
};

function localYearMonth(date: Date, timeZone: string): { year: number; month: number } {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric' })
        .formatToParts(date);
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    return { year, month };
}

export function getSeason(date: Date | string, timeZone: string = SITE_TIMEZONE): Season {
    const { year, month } = localYearMonth(typeof date === 'string' ? new Date(date) : date, timeZone);
    const [key, phase] = MONTHS[month];
    const name = SEASON_NAMES[key];
    const label = `${phase.charAt(0).toUpperCase()}${phase.slice(1)} ${name.toLowerCase()}`;

    if (key === 'winter') {
        // A winter belongs to the year its December falls in
        const startYear = month === 12 ? year : year - 1;
        const endYear = String(startYear + 1).slice(-2);
        return { key, phase, label, groupLabel: `${name} ${startYear}–${endYear}`, groupId: `${startYear}-winter` };
    }

    return { key, phase, label, groupLabel: `${name} ${year}`, groupId: `${year}-${key}` };
}

/**
 * The haiku's lines, with blank lines and light markdown (emphasis, links,
 * trailing hard-break spaces or backslashes) stripped. Haiku are plain verse,
 * so this is all the page needs to render them line by line.
 */
export function haikuLines(body: string | undefined | null): string[] {
    return (body || '')
        .split('\n')
        .map((line) =>
            line
                .replace(/\\$/, '')
                .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
                .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
                .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, '$1')
                .replace(/(\*\*|__|\*|_|`)/g, '')
                .trim()
        )
        .filter(Boolean);
}

/**
 * Number each haiku by its place in the practice (oldest = 1). Keyed by post
 * id so a list in any order can look its numbers up.
 */
export function numberHaiku<T extends { id: string; data: { created?: Date | string } }>(
    posts: readonly T[]
): Map<string, number> {
    const time = (post: T) => (post.data.created ? new Date(post.data.created).getTime() : 0);
    const ordered = [...posts].sort((a, b) => time(a) - time(b));
    return new Map(ordered.map((post, index) => [post.id, index + 1]));
}
