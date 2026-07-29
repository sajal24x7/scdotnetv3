// ──────────────────────────────────────────────────────────────
// Life timeline: parses src/data/life.md (one human-editable doc)
// and maps its month/year dates onto a 90-year × 52-week life
// calendar. Both the stream view and the calendar view on
// /sajal/ render from the structures produced here.
//
// Deliberately dependency-free: this module hands back raw markdown
// and lets the calling component render it, which keeps the date
// logic runnable on its own (see __checks__/life.check.ts).
// ──────────────────────────────────────────────────────────────

/** 22 November 1991, in UTC ms. */
export const BIRTH = Date.UTC(1991, 10, 22);
export const LIFE_YEARS = 90;
export const WEEKS_PER_ROW = 52;

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_WEEK = 7 * MS_DAY;

const MONTHS: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

export interface LifeEntry {
    id: string;
    title: string;
    /** The `when:` line exactly as written — shown as the date chip. */
    whenText: string;
    /** Start of the entry, UTC ms. */
    start: number;
    /** Inclusive end, UTC ms. Equals `start` for single-date moments. */
    end: number;
    isEra: boolean;
    ongoing: boolean;
    /** Raw markdown; the rendering component turns this into HTML. */
    body: string;
    year: number;
}

export interface LifeDoc {
    /** Raw markdown for the page intro. */
    intro: string;
    entries: LifeEntry[];
}

interface DateToken {
    index: number;
    ms: number;
    hasDay: boolean;
    year: number;
    month: number;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Pull every date out of a `when:` line. Accepts `2015-08`, `2015-08-22`,
 * `Aug 2015`, `November 1991`, `22 Nov 1991` and `Feb 15, 2025`.
 */
function parseDateTokens(text: string): DateToken[] {
    const tokens: DateToken[] = [];

    const isoRe = /\b(\d{4})-(\d{1,2})(?:-(\d{1,2}))?\b/g;
    for (const match of text.matchAll(isoRe)) {
        const month = Number(match[2]) - 1;
        if (month < 0 || month > 11) continue;
        const day = match[3] ? Number(match[3]) : 1;
        tokens.push({
            index: match.index ?? 0,
            ms: Date.UTC(Number(match[1]), month, day),
            hasDay: Boolean(match[3]),
            year: Number(match[1]),
            month
        });
    }

    const nameRe =
        /(?:\b(\d{1,2})(?:st|nd|rd|th)?\s+)?\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:(\d{1,2})(?:st|nd|rd|th)?\s*,?\s+)?(\d{4})\b/gi;
    for (const match of text.matchAll(nameRe)) {
        const month = MONTHS[match[2].toLowerCase().slice(0, 3)];
        const dayText = match[1] ?? match[3];
        const day = dayText ? Number(dayText) : 1;
        tokens.push({
            index: match.index ?? 0,
            ms: Date.UTC(Number(match[4]), month, day),
            hasDay: Boolean(dayText),
            year: Number(match[4]),
            month
        });
    }

    return tokens.sort((a, b) => a.index - b.index);
}

/** Day 0 of the next month is the last day of this one. */
function lastDayOfMonth(year: number, month: number): number {
    return Date.UTC(year, month + 1, 0);
}

/** Today at UTC midnight, so cell states don't wobble with the clock. */
export function todayUtc(): number {
    const now = new Date();
    return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Parse the life doc: the intro is everything above the first `##`, and
 * each `##` section below is one timeline entry carrying a `when:` line.
 * Sections without a parseable `when:` are skipped rather than thrown on,
 * so a half-written entry never breaks the build.
 */
export function parseLifeDoc(raw: string, today: number = todayUtc()): LifeDoc {
    const clean = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
    const sections = clean.split(/^##\s+/m);
    const intro = sections[0].trim();

    const entries: LifeEntry[] = [];
    const seenIds = new Set<string>();

    for (const section of sections.slice(1)) {
        const lines = section.split('\n');
        const title = lines[0].trim();
        if (!title) continue;

        const bodyLines: string[] = [];
        let whenText = '';
        for (const line of lines.slice(1)) {
            if (!whenText && /^when\s*:/i.test(line.trim())) {
                whenText = line.trim().replace(/^when\s*:\s*/i, '');
            } else {
                bodyLines.push(line);
            }
        }
        if (!whenText) continue;

        const tokens = parseDateTokens(whenText);
        if (tokens.length === 0) continue;

        const ongoing = /\bnow\b|\bpresent\b|\bongoing\b/i.test(whenText);
        const start = tokens[0].ms;
        let end = start;
        let isEra = false;

        if (tokens.length > 1) {
            const last = tokens[tokens.length - 1];
            // A month-precision end date covers the whole end month.
            end = last.hasDay ? last.ms : lastDayOfMonth(last.year, last.month);
            isEra = true;
        } else if (ongoing) {
            end = today;
            isEra = true;
        }
        if (end < start) end = start;

        let id = slugify(title) || `entry-${entries.length}`;
        while (seenIds.has(id)) id = `${id}-x`;
        seenIds.add(id);

        entries.push({
            id,
            title,
            whenText,
            start,
            end,
            isEra,
            ongoing,
            body: bodyLines.join('\n').trim(),
            year: tokens[0].year
        });
    }

    entries.sort((a, b) => a.start - b.start);
    return { intro, entries };
}

// ──────────────────────────────────────────────────────────────
// Calendar geometry
// ──────────────────────────────────────────────────────────────

export interface LifeCell {
    state: 'past' | 'current' | 'future';
    entryIds: string[];
    /** True when at least one single-date entry lands in this week. */
    hasMoment: boolean;
}

export interface LifeRow {
    age: number;
    cells: LifeCell[];
}

export interface LifeCalendar {
    rows: LifeRow[];
    weeksLived: number;
    totalWeeks: number;
    percentLived: number;
    currentAge: number;
}

/** The birthday that opens year `n` of life, UTC ms. */
function anniversary(n: number): number {
    return Date.UTC(1991 + n, 10, 22);
}

/**
 * Lay the life out as 90 birthday-anchored rows of 52 weeks. A calendar
 * year is 52 weeks plus a day or two, so the last cell of each row
 * absorbs the remainder — that keeps every row exactly one year wide and
 * stops birthdays from drifting across columns further down the grid.
 */
export function buildLifeCalendar(
    entries: LifeEntry[],
    today: number = todayUtc()
): LifeCalendar {
    const rows: LifeRow[] = [];

    for (let year = 0; year < LIFE_YEARS; year++) {
        const rowStart = anniversary(year);
        const rowEnd = anniversary(year + 1);
        const cells: LifeCell[] = [];

        for (let week = 0; week < WEEKS_PER_ROW; week++) {
            const cellStart = rowStart + week * MS_WEEK;
            const cellEnd = week === WEEKS_PER_ROW - 1 ? rowEnd : cellStart + MS_WEEK;

            const state: LifeCell['state'] =
                cellEnd <= today ? 'past' : cellStart > today ? 'future' : 'current';

            const entryIds: string[] = [];
            let hasMoment = false;
            for (const entry of entries) {
                // Interval overlap: [start, end] against [cellStart, cellEnd)
                if (entry.start < cellEnd && entry.end >= cellStart) {
                    entryIds.push(entry.id);
                    if (!entry.isEra) hasMoment = true;
                }
            }

            cells.push({ state, entryIds, hasMoment });
        }

        rows.push({ age: year, cells });
    }

    const lifeEnd = anniversary(LIFE_YEARS);
    const weeksLived = Math.max(0, Math.floor((today - BIRTH) / MS_WEEK));
    const totalWeeks = Math.floor((lifeEnd - BIRTH) / MS_WEEK);
    const percentLived = Math.min(100, Math.max(0, ((today - BIRTH) / (lifeEnd - BIRTH)) * 100));

    let currentAge = 0;
    while (currentAge < LIFE_YEARS && anniversary(currentAge + 1) <= today) currentAge++;

    return { rows, weeksLived, totalWeeks, percentLived, currentAge };
}
