import { getAllPosts } from './content';
import type { Post } from './content';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

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
    const weekKeys = new Set<string>();

    for (const pubDate of validDates) {
        const weekKey = buildWeekKey(pubDate);
        weeklyPostCounts[weekKey] = (weeklyPostCounts[weekKey] ?? 0) + 1;
        weekKeys.add(weekKey);
    }

    const latestPostDate = validDates[0];
    const streakWeeks = calculateStreak(weekKeys);

    return {
        totalPosts: validDates.length,
        latestPostDate,
        streakWeeks,
        weeklyPostCounts
    };
}

function calculateStreak(weekKeys: Set<string>): number {
    if (weekKeys.size === 0) {
        return 0;
    }

    let streak = 0;
    const now = new Date();
    let year = now.getFullYear();
    let week = getWeekIndex(now);

    while (true) {
        const key = `${year}-${week}`;
        if (!weekKeys.has(key)) {
            break;
        }

        streak++;
        week--;

        if (week < 0) {
            year--;
            const weeksInYear = getWeeksInYear(year);
            week = weeksInYear > 0 ? weeksInYear - 1 : 0;
        }
    }

    return streak;
}

function getWeekIndex(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((date.getTime() - startOfYear.getTime()) / MS_IN_DAY);
    return Math.floor(daysSinceStart / 7);
}

function getWeeksInYear(year: number): number {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const days = Math.floor((end.getTime() - start.getTime()) / MS_IN_DAY);
    return Math.floor(days / 7);
}

function buildWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekIndex = getWeekIndex(date);
    return `${year}-${weekIndex}`;
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
