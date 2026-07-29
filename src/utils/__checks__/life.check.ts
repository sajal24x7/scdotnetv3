/**
 * Checks for the life-timeline parser and calendar mapper.
 *
 *   npx astro check          # type-checks this file with the rest of src
 *   node --experimental-strip-types src/utils/__checks__/life.check.ts
 *
 * The interesting question this answers: is "month / year" enough precision
 * to place an entry on a week grid? It is — a month resolves to a first-of-
 * month start and an end-of-month end, which lands on the right weeks.
 */

// Explicit .ts extension so this runs under `node --experimental-strip-types`
// as-is; the tsconfig sets allowImportingTsExtensions, so it type-checks too.
import { BIRTH, LIFE_YEARS, buildLifeCalendar, parseLifeDoc } from '../life.ts';

let failures = 0;

function check(label: string, actual: unknown, expected: unknown): void {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a === b) {
        console.log(`  ok   ${label}`);
    } else {
        failures++;
        console.error(`  FAIL ${label}\n         expected ${b}\n         actual   ${a}`);
    }
}

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// A fixed "today" keeps these assertions stable over time.
const TODAY = Date.UTC(2026, 6, 29);

const doc = `
Intro paragraph.

## Aug 2015 - Jul 2017

Month-only era.

## Aug 2015 – Jul 2017

En dash era.

## 2019-03 - now

ISO era, ongoing.

## Feb 15, 2025

Moment, US style.

## 22 November, 1991

Moment, day first with a comma.

## Sometime in the nineties

Undated, so skipped.
`;

const { entries } = parseLifeDoc(doc, TODAY);

console.log('parseLifeDoc');
check('drops headings without a parseable date', entries.length, 5);
check('sorts chronologically', entries.map((e) => e.whenText), [
    '22 November, 1991',
    'Aug 2015 - Jul 2017',
    'Aug 2015 – Jul 2017',
    '2019-03 - now',
    'Feb 15, 2025'
]);

const at = (n: number) => entries[n];

check('month-only era starts at the 1st', iso(at(1).start), '2015-08-01');
check('month-only era ends at month end', iso(at(1).end), '2017-07-31');
check('en dash parses like a hyphen', iso(at(2).end), '2017-07-31');
check('"now" runs the era up to today', iso(at(3).end), '2026-07-29');
check('"now" marks the entry ongoing', at(3).ongoing, true);
check('"Feb 15, 2025" reads as a moment', iso(at(4).start), '2025-02-15');
check('a moment has zero span', at(4).isEra, false);
check('"22 November, 1991" reads day-first', iso(at(0).start), '1991-11-22');
check('the heading is kept verbatim', at(0).whenText, '22 November, 1991');
check('first line under the heading is the title', at(0).title, 'Moment, day first with a comma.');
check('ids come from the heading', at(0).id, '22-november-1991');

// Title on the first line, detail on everything after it.
const split = parseLifeDoc(
    [
        '## 22 November, 1991',
        'Born in Bihar, India.',
        'There is an origin story about my father.',
        '',
        'And a second paragraph.'
    ].join('\n'),
    TODAY
).entries[0];
check('title is the first line', split.title, 'Born in Bihar, India.');
check('detail is everything after it', split.body, 'There is an origin story about my father.\n\nAnd a second paragraph.');

// A title-only entry is complete on its own.
const titleOnly = parseLifeDoc('## December 2014\nJoined TCS Delhi.', TODAY).entries[0];
check('an entry may be title-only', [titleOnly.title, titleOnly.body], ['Joined TCS Delhi.', '']);

// A blank line between heading and title should not swallow the title.
const spaced = parseLifeDoc('## Aug 2015\n\nTitle here.\n\nDetail here.', TODAY).entries[0];
check('a blank line before the title is ignored', [spaced.title, spaced.body], ['Title here.', 'Detail here.']);

// Titles may carry markdown, which the tooltip flattens.
const linked = parseLifeDoc('## Aug 2015\nPublished [the book](/books/).', TODAY).entries[0];
check('a title may hold a link', linked.title, 'Published [the book](/books/).');

// A comma after the month is the natural way to write a date by hand.
for (const [written, expected] of [
    ['22 November, 1991', '1991-11-22'],
    ['22 November 1991', '1991-11-22'],
    ['15 February, 2025', '2025-02-15'],
    ['November 1991', '1991-11-01'],
    ['Nov. 1991', '1991-11-01']
] as const) {
    const parsed = parseLifeDoc(`## ${written}\nBody.`, TODAY).entries[0];
    check(`"${written}" parses`, parsed && iso(parsed.start), expected);
}

// Detail below the title keeps its paragraphs and lists.
const multiline = parseLifeDoc(
    ['## Aug 2015', 'Title.', '', 'First paragraph.', '', '- a list item'].join('\n'),
    TODAY
).entries[0];
check('detail keeps paragraphs and lists', multiline.body, 'First paragraph.\n\n- a list item');

// A date mentioned in the detail must not affect the entry's timing.
const strayDate = parseLifeDoc('## Aug 2015\nTitle.\nI moved in Jan 2020 to a new place.', TODAY).entries[0];
check('a date in the body is ignored', [iso(strayDate.start), strayDate.isEra], ['2015-08-01', false]);

// Two entries in the same month must not collide on id.
const dupes = parseLifeDoc('## Aug 2015\nOne.\n\n## Aug 2015\nTwo.', TODAY).entries;
check('duplicate headings get distinct ids', dupes.map((e) => e.id), ['aug-2015', 'aug-2015-2']);

// A bare heading with no text at all should still place on the calendar.
const bare = parseLifeDoc('## Aug 2015', TODAY).entries[0];
check('a bare heading still counts', [bare.title, bare.body, iso(bare.start)], ['', '', '2015-08-01']);

console.log('buildLifeCalendar');
const calendar = buildLifeCalendar(entries, TODAY);

check('one row per year of life', calendar.rows.length, LIFE_YEARS);
check('52 weeks per row', calendar.rows[0].cells.length, 52);

// Birth falls in the very first cell of the very first row.
check('birth sits in row 0, week 0', calendar.rows[0].cells[0].entryIds.includes(at(0).id), true);
check('birth week reads as a moment', calendar.rows[0].cells[0].hasMoment, true);

// Exactly one current week, and it is the past/future seam.
const currentCells = calendar.rows.flatMap((row, r) =>
    row.cells.map((cell, w) => ({ ...cell, r, w })).filter((cell) => cell.state === 'current')
);
check('exactly one current week', currentCells.length, 1);

const flat = calendar.rows.flatMap((row) => row.cells);
const firstFuture = flat.findIndex((cell) => cell.state === 'future');
const lastPast = flat.map((cell) => cell.state).lastIndexOf('past');
check('past runs strictly before future', lastPast < firstFuture, true);

// A two-year era should cover roughly 104 weeks, not a single one.
const eraWeeks = flat.filter((cell) => cell.entryIds.includes(at(1).id)).length;
check('a 24-month era spans ~104 weeks', eraWeeks >= 100 && eraWeeks <= 108, true);

check('birthday anchoring holds at age 50', iso(BIRTH) === '1991-11-22', true);
check('weeks lived is positive and sane', calendar.weeksLived > 1800 && calendar.weeksLived < 1815, true);
check('percent lived under 100', calendar.percentLived < 100, true);

if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log('\nAll life-timeline checks passed.');
