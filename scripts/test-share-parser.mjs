#!/usr/bin/env node
// Tests for the share-sheet parser behind /write's "Share to queue"
// (public/write/share.js). Each case is something a phone actually sends, so a
// change that breaks one service shows up here rather than on the phone.
//
// Run: node scripts/test-share-parser.mjs

import { parseShare } from '../public/write/share.js';

const cases = [
    {
        name: 'Prime Video film share (iOS)',
        input: { text: 'Hey I’m watching Vibe. Check it out now on Prime Video! https://app.primevideo.com/detail?gti=amzn1.dv.gti.4d9ee8a2-c0b6-4c02-b4c1-11ed1b959e46&territory=IN&ref_=share_ios_movie&r=web' },
        expect: { ok: true, category: 'filmshelf', title: 'Vibe', creator: '' },
    },
    {
        name: 'Prime Video show share',
        input: { text: "Hey I'm watching Panchayat. Check it out now on Prime Video! https://app.primevideo.com/detail?gti=amzn1.dv.gti.x&ref_=share_ios_tv&r=web" },
        expect: { ok: true, category: 'tvshelf', title: 'Panchayat' },
    },
    {
        name: 'Netflix share: title read, category left to pick',
        input: { text: 'Check out "Stranger Things" on Netflix https://www.netflix.com/title/80057281' },
        expect: { ok: true, category: '', title: 'Stranger Things' },
    },
    {
        name: 'Netflix share without quotes',
        input: { text: 'Watch Kaala Paani on Netflix: https://www.netflix.com/title/81475130' },
        expect: { ok: true, category: '', title: 'Kaala Paani' },
    },
    {
        name: 'Amazon book: title and author from text',
        input: { text: 'The Left Hand of Darkness by Ursula K. Le Guin https://amzn.in/d/03YugBK3' },
        expect: { ok: true, category: 'bookshelf', title: 'The Left Hand of Darkness', creator: 'Ursula K. Le Guin' },
    },
    {
        name: 'Amazon book: store-title format',
        input: { text: 'Piranesi : Susanna Clarke : Amazon.in: Books https://www.amazon.in/dp/1526622424' },
        expect: { ok: true, category: 'bookshelf', title: 'Piranesi', creator: 'Susanna Clarke' },
    },
    {
        name: 'Amazon book: boilerplate prefix',
        input: { text: 'Check out this product on Amazon: Tomorrow, and Tomorrow, and Tomorrow https://amzn.in/d/abc' },
        expect: { ok: true, category: 'bookshelf', title: 'Tomorrow, and Tomorrow, and Tomorrow' },
    },
    {
        name: 'Amazon full URL with no text uses the path slug',
        input: { url: 'https://www.amazon.in/Piranesi-Susanna-Clarke/dp/1526622424/ref=sr_1_1' },
        expect: { ok: true, category: 'bookshelf', title: 'Piranesi Susanna Clarke' },
    },
    {
        name: 'Bare short link fails with a message',
        input: { text: 'https://amzn.in/d/03YugBK3' },
        expect: { ok: false, category: 'bookshelf', title: '' },
    },
    {
        name: 'Goodreads URL slug',
        input: { url: 'https://www.goodreads.com/book/show/18007564-the-martian' },
        expect: { ok: true, category: 'bookshelf', title: 'The Martian' },
    },
    {
        name: 'Letterboxd keeps "by" in film titles',
        input: { text: 'Stand by Me https://letterboxd.com/film/stand-by-me/' },
        expect: { ok: true, category: 'filmshelf', title: 'Stand by Me' },
    },
    {
        name: 'Steam app URL',
        input: { url: 'https://store.steampowered.com/app/1145360/Hades/' },
        expect: { ok: true, category: 'gameshelf', title: 'Hades' },
    },
    {
        name: 'IMDb series tag sets TV',
        input: { text: 'Severance (TV Series 2022– ) - IMDb https://www.imdb.com/title/tt11280740/' },
        expect: { ok: true, category: 'tvshelf', title: 'Severance' },
    },
    {
        name: 'IMDb year tag sets film',
        input: { text: 'Dune (2021) - IMDb https://m.imdb.com/title/tt1160419/' },
        expect: { ok: true, category: 'filmshelf', title: 'Dune' },
    },
    {
        name: 'Apple TV show URL',
        input: { url: 'https://tv.apple.com/in/show/slow-horses/umc.cmc.2szz3fdt71tl1ulnbp8utgq5o' },
        expect: { ok: true, category: 'tvshelf', title: 'Slow Horses' },
    },
    {
        name: 'Android share target splits title and url',
        input: { title: 'Vibe', text: 'Hey I’m watching Vibe. Check it out now on Prime Video!', url: 'https://app.primevideo.com/detail?gti=x&ref_=share_android_movie' },
        expect: { ok: true, category: 'filmshelf', title: 'Vibe' },
    },
];

let failed = 0;
for (const { name, input, expect } of cases) {
    const got = parseShare(input);
    const wrong = Object.entries(expect).filter(([k, v]) => got[k] !== v);
    if (wrong.length) {
        failed++;
        console.error(`✗ ${name}`);
        for (const [k, v] of wrong) console.error(`    ${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(got[k])}`);
    } else {
        console.log(`✓ ${name}`);
    }
}

if (failed) {
    console.error(`\n${failed} of ${cases.length} share cases failed.`);
    process.exit(1);
}
console.log(`\nAll ${cases.length} share cases pass.`);
