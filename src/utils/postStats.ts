import { getAllPosts } from './content';
import type { Post } from './content';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const MS_IN_WEEK = 7 * MS_IN_DAY;

export interface PostActivitySummary {
    totalPosts: number;
    latestPostDate: Date | null;
    streakWeeks: number;
    weeklyPostCounts: Record<string, number>;
}

let summaryPromise: Promise<PostActivitySummary> | null = null;

/**
 * Get the cached post activity summary.
 * Falls back to calculating from all posts when the cache is empty.
 */
export async function getPostActivitySummary(): Promise<PostActivitySummary> {
    if (!summaryPromise) {
        summaryPromise = getAllPosts().then(posts => calculatePostActivitySummary(posts));
    }

    return summaryPromise;
}

/**
 * Calculate post activity metrics (total posts, streak, weekly counts) from a list of posts.
 */
export function calculatePostActivitySummary(posts: Post[] | undefined | null): PostActivitySummary {
    if (!posts || posts.length === 0) {
        return emptySummary();
    }

    const validDates = posts
        .map(post => normaliseDate(post?.data?.pubDate))
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime());

    if (validDates.length === 0) {
        return emptySummary();
    }

    const weeklyPostCounts: Record<string, number> = {};
    const weekTimestamps = new Set<number>();

    for (const pubDate of validDates) {
        const weekStart = getWeekStart(pubDate);
        const weekTimestamp = weekStart.getTime();
        const weekKey = buildWeekKey(weekStart);

        weeklyPostCounts[weekKey] = (weeklyPostCounts[weekKey] ?? 0) + 1;
        weekTimestamps.add(weekTimestamp);
    }

    const latestPostDate = validDates[0];
    const streakWeeks = calculateStreak(latestPostDate, weekTimestamps);

    return {
        totalPosts: validDates.length,
        latestPostDate,
        streakWeeks,
        weeklyPostCounts
    };
}

function calculateStreak(latestPostDate: Date, weekTimestamps: Set<number>): number {
    if (weekTimestamps.size === 0) {
        return 0;
    }

    let streak = 0;
    let currentWeekStart = getWeekStart(latestPostDate).getTime();

    while (weekTimestamps.has(currentWeekStart)) {
        streak++;
        currentWeekStart -= MS_IN_WEEK;
    }

    return streak;
}

function getWeekStart(date: Date): Date {
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayOfWeek = utcDate.getUTCDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // shift so weeks start on Monday
    utcDate.setUTCDate(utcDate.getUTCDate() + diff);
    return utcDate;
}

function buildWeekKey(weekStart: Date): string {
    const year = weekStart.getUTCFullYear();
    const month = String(weekStart.getUTCMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normaliseDate(value: unknown): Date | null {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    const parsed = new Date(value as any);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function emptySummary(): PostActivitySummary {
    return {
        totalPosts: 0,
        latestPostDate: null,
        streakWeeks: 0,
        weeklyPostCounts: {}
    };
}
