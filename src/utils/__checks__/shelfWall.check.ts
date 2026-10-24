/**
 * Checks for the cover-wall shelf helpers.
 *
 *   npx astro check          # type-checks this file with the rest of src
 *   node --experimental-strip-types src/utils/__checks__/shelfWall.check.ts
 */

import { groupTvShows, hasShelfNotes, repeatLabel, tvSeasonPills } from '../shelfWall.ts';

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

console.log('hasShelfNotes');
check('empty body', hasShelfNotes(''), false);
check('season log line', hasShelfNotes('Finished watching Season 2 on 2020-08-02.'), false);
check('film log line', hasShelfNotes('Finished watching on 2026-07-24.'), false);
check('started line', hasShelfNotes('Started reading on 2026-01-02'), false);
check('real notes', hasShelfNotes('I had thought this would be a limited series.'), true);

console.log('repeatLabel');
check('2nd', repeatLabel(2, 'watch'), '2nd watch');
check('3rd', repeatLabel(3, 'read'), '3rd read');
check('11th', repeatLabel(11, 'watch'), '11th watch');

console.log('groupTvShows');
const entry = (id: string, showTitle: string, season: number | undefined, finished: string, status = 'finished', body = '') =>
    ({ id, body, data: { showTitle, season, status, finished } });
const shows = groupTvShows([
    entry('queens-gambit-stub', "The Queen's Gambit", undefined, '2026-01-01', 'todo'),
    entry('friends/s2', 'Friends', 2, '2020-08-02'),
    entry('friends/s1', 'Friends', 1, '2020-03-15'),
    entry('friends/s1-2026', 'Friends', 1, '2026-02-10', 'finished', 'Still funny.'),
    entry('glory', 'Glory', undefined, '2026-06-01'),
    entry('glory-2026', 'Glory', undefined, '2026-09-01'),
]);
const friends = shows.find((s) => s.showTitle === 'Friends')!;
check('todo stub left out', shows.map((s) => s.showTitle), ['Friends', 'Glory']);
check('slug from first entry', friends.showSlug, 'friends');
check('watches oldest first', friends.watches.map((w) => w.post.id), ['friends/s1', 'friends/s2', 'friends/s1-2026']);
check('rewatch numbered', friends.watches.map((w) => w.watchNumber), [1, 1, 2]);
check('rewatch season slug', friends.latest.seasonSlug, 's1-2026');
check('notes detected', friends.latest.notes, true);
check('limited series has no season slug', shows[1].latest.seasonSlug, null);
check('season paths', friends.watches.map((w) => w.path), ['/tvshelf/friends/s1/', '/tvshelf/friends/s2/', '/tvshelf/friends/s1-2026/']);
check('limited series paths', shows[1].watches.map((w) => w.path), ['/tvshelf/glory/', '/tvshelf/glory/glory-2026/']);
check('limited rewatch numbered', shows[1].watches.map((w) => w.watchNumber), [1, 2]);
check('season with id but no season segment', groupTvShows([entry('glory', 'Glory', 1, '2026-06-01')])[0].latest.path, '/tvshelf/glory/s1/');

console.log('tvSeasonPills');
const pills = tvSeasonPills(friends);
check('one pill per season, in order', pills.map((p) => p.season), [1, 2]);
check('pill links latest watch', pills[0].latest.path, '/tvshelf/friends/s1-2026/');
check('pill keeps every watch', pills[0].watches.length, 2);
check('limited series has no pills', tvSeasonPills(shows[1]).length, 0);

if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log('\nAll checks passed');
