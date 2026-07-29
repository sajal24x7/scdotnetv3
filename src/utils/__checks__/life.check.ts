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

## Month-only era
when: Aug 2015 - Jul 2017

Body.

## En dash era
when: Aug 2015 – Jul 2017

Body.

## ISO era, ongoing
when: 2019-03 - now

Body.

## Moment, US style
when: Feb 15, 2025

Body.

## Moment, day first
when: 22 Nov 1991

Body.

## Malformed, skipped
when: sometime in the nineties

Body.

## No when line, skipped

Body.
`;

const { entries } = parseLifeDoc(doc, TODAY);

console.log('parseLifeDoc');
check('drops entries without a parseable date', entries.length, 5);
check('sorts chronologically', entries.map((e) => e.id), [
    'moment-day-first',
    'month-only-era',
    'en-dash-era',
    'iso-era-ongoing',
    'moment-us-style'
]);

const byId = Object.fromEntries(entries.map((e) => [e.id, e]));

check('month-only era starts at the 1st', iso(byId['month-only-era'].start), '2015-08-01');
check('month-only era ends at month end', iso(byId['month-only-era'].end), '2017-07-31');
check('en dash parses like a hyphen', iso(byId['en-dash-era'].end), '2017-07-31');
check('"now" runs the era up to today', iso(byId['iso-era-ongoing'].end), '2026-07-29');
check('"now" marks the entry ongoing', byId['iso-era-ongoing'].ongoing, true);
check('"Feb 15, 2025" reads as a moment', iso(byId['moment-us-style'].start), '2025-02-15');
check('a moment has zero span', byId['moment-us-style'].isEra, false);
check('"22 Nov 1991" reads day-first', iso(byId['moment-day-first'].start), '1991-11-22');

console.log('buildLifeCalendar');
const calendar = buildLifeCalendar(entries, TODAY);

check('one row per year of life', calendar.rows.length, LIFE_YEARS);
check('52 weeks per row', calendar.rows[0].cells.length, 52);

// Birth falls in the very first cell of the very first row.
check('birth sits in row 0, week 0', calendar.rows[0].cells[0].entryIds.includes('moment-day-first'), true);
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
const eraWeeks = flat.filter((cell) => cell.entryIds.includes('month-only-era')).length;
check('a 24-month era spans ~104 weeks', eraWeeks >= 100 && eraWeeks <= 108, true);

check('birthday anchoring holds at age 50', iso(BIRTH) === '1991-11-22', true);
check('weeks lived is positive and sane', calendar.weeksLived > 1800 && calendar.weeksLived < 1815, true);
check('percent lived under 100', calendar.percentLived < 100, true);

if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log('\nAll life-timeline checks passed.');
