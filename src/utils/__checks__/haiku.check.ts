/**
 * Checks for haiku numbering.
 *
 *   npx astro check          # type-checks this file with the rest of src
 *   node --experimental-strip-types src/utils/__checks__/haiku.check.ts
 */

import { numberHaiku } from '../haiku.ts';

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

const numbers = numberHaiku([
    { id: 'c', data: { created: '2026-10-13' } },
    { id: 'a', data: { created: '2026-10-11' } },
    { id: 'b', data: { created: new Date('2026-10-12') } }
]);
check('numbered oldest first', [numbers.get('a'), numbers.get('b'), numbers.get('c')], [1, 2, 3]);

// A new haiku goes to the end; earlier numbers never shift
const withNew = numberHaiku([
    { id: 'a', data: { created: '2026-10-11' } },
    { id: 'b', data: { created: '2026-10-12' } },
    { id: 'd', data: { created: '2026-10-14' } }
]);
check('new haiku gets the next number', [withNew.get('a'), withNew.get('b'), withNew.get('d')], [1, 2, 3]);
check('empty list', numberHaiku([]).size, 0);

if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
}
console.log('\nAll haiku checks passed');
