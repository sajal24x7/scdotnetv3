/**
 * Checks for the haiku season, line and numbering helpers.
 *
 *   npx astro check          # type-checks this file with the rest of src
 *   node --experimental-strip-types src/utils/__checks__/haiku.check.ts
 *
 * The interesting question this answers: does the season follow the site
 * timezone rather than the build's UTC clock, and does a winter that spans
 * New Year stay one group?
 */

import { getSeason, haikuLines, numberHaiku } from '../haiku.ts';

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

const TZ = 'Europe/Helsinki';

check('mid autumn', getSeason('2026-10-11T08:00:00Z', TZ).label, 'Mid autumn');
check('autumn group', getSeason('2026-10-11T08:00:00Z', TZ).groupLabel, 'Autumn 2026');

// 22:30 UTC on 30 Nov is already 1 Dec in Helsinki: winter, not autumn
check('site timezone decides', getSeason('2026-11-30T22:30:00Z', TZ).label, 'Early winter');

// December and the following February share one winter group
const december = getSeason('2026-12-15T12:00:00Z', TZ);
const february = getSeason('2027-02-15T12:00:00Z', TZ);
check('winter label', december.groupLabel, 'Winter 2026–27');
check('winter spans new year', december.groupId === february.groupId, true);
check('late winter', february.label, 'Late winter');

check('early spring', getSeason('2027-03-01T12:00:00Z', TZ).label, 'Early spring');
check('late summer', getSeason('2027-08-31T12:00:00Z', TZ).label, 'Late summer');

check(
    'lines',
    haikuLines('an old silent pond  \n\n*a frog* jumps into the pond\\\nsplash! [[silence]] again\n'),
    ['an old silent pond', 'a frog jumps into the pond', 'splash! silence again']
);
check('empty body', haikuLines(undefined), []);

const numbers = numberHaiku([
    { id: 'c', data: { created: '2026-10-13' } },
    { id: 'a', data: { created: '2026-10-11' } },
    { id: 'b', data: { created: '2026-10-12' } }
]);
check('numbered oldest first', [numbers.get('a'), numbers.get('b'), numbers.get('c')], [1, 2, 3]);

if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log('\nAll haiku checks passed');
