// Turns what a phone's share sheet sends (a link, plus whatever text the app
// attaches) into a shelf queue entry: { category, title, creator }.
//
// Everything comes from the URL and the shared text. Nothing is fetched: if
// neither says what the thing is, the result says so and the composer shows a
// short message instead of guessing. See docs/content/micro-composer.md §
// "Share to queue".
//
// Run the checks: node scripts/test-share-parser.mjs

const URL_RE = /https?:\/\/[^\s<>"']+/i;

// Words that mean "this is a film" or "this is a show" in share refs and
// URL paths across the services that put them there.
const FILM_WORD = /^(movie|movies|film|films)$/i;
const TV_WORD = /^(tv|show|shows|series|tvshow|tv-show|tv-shows|season)$/i;

function cleanSpaces(s) {
    return s.replace(/\s+/g, ' ').trim();
}

// "the-left-hand-of-darkness" → "The Left Hand Of Darkness". Only used when
// the slug is all there is; shared text is always preferred.
function titleFromSlug(slug) {
    const words = decodeURIComponent(slug)
        .replace(/[-_+]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseUrl(raw) {
    if (!raw) return null;
    try {
        return new URL(raw.replace(/[).,!?]+$/, ''));
    } catch {
        return null;
    }
}

function categoryFromWord(word) {
    if (FILM_WORD.test(word)) return 'filmshelf';
    if (TV_WORD.test(word)) return 'tvshelf';
    return '';
}

// What the link alone tells us: the service, the category when the URL
// encodes it, and a fallback title from the path when there is one.
function readUrl(url) {
    const out = { service: '', category: '', slugTitle: '' };
    if (!url) return out;
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);

    if (/(^|\.)primevideo\.com$/.test(host) || (/amazon\./.test(host) && parts[0] === 'gp' && parts[1] === 'video')) {
        out.service = 'primevideo';
        // ref_=share_ios_movie / share_android_tv / …
        const ref = url.searchParams.get('ref_') || url.searchParams.get('ref') || '';
        const m = ref.match(/share_[a-z]+_([a-z]+)/i);
        if (m) out.category = categoryFromWord(m[1]);
        return out;
    }
    if (/(^|\.)netflix\.com$/.test(host)) {
        out.service = 'netflix';
        return out;
    }
    if (/(^|\.)amazon\.[a-z.]+$/.test(host) || /(^|\.)amzn\.[a-z.]+$/.test(host) || host === 'a.co') {
        out.service = 'amazon';
        out.category = 'bookshelf';
        // amazon.in/The-Title-Author/dp/B0…: the first segment is the slug.
        const dp = parts.indexOf('dp');
        if (dp > 0) out.slugTitle = titleFromSlug(parts[dp - 1]);
        return out;
    }
    if (/(^|\.)goodreads\.com$/.test(host)) {
        out.service = 'goodreads';
        out.category = 'bookshelf';
        // /book/show/12345-the-title or /book/show/12345.The_Title
        if (parts[0] === 'book' && parts[1] === 'show' && parts[2]) {
            const slug = parts[2].replace(/^\d+[-.]?/, '');
            if (slug) out.slugTitle = titleFromSlug(slug);
        }
        return out;
    }
    if (/(^|\.)openlibrary\.org$/.test(host)) {
        out.service = 'openlibrary';
        out.category = 'bookshelf';
        if ((parts[0] === 'works' || parts[0] === 'books') && parts[2]) out.slugTitle = titleFromSlug(parts[2]);
        return out;
    }
    if (/(^|\.)letterboxd\.com$/.test(host) || host === 'boxd.it') {
        out.service = 'letterboxd';
        out.category = 'filmshelf';
        const i = parts.indexOf('film');
        if (i !== -1 && parts[i + 1]) out.slugTitle = titleFromSlug(parts[i + 1]);
        return out;
    }
    if (/(^|\.)steampowered\.com$/.test(host) || host === 's.team') {
        out.service = 'steam';
        out.category = 'gameshelf';
        // /app/1145360/Hades/
        if (parts[0] === 'app' && parts[2]) out.slugTitle = titleFromSlug(parts[2]);
        return out;
    }
    if (host === 'tv.apple.com') {
        out.service = 'appletv';
        // /in/movie/<slug>/<id> or /in/show/<slug>/<id>
        const i = parts.findIndex((p) => categoryFromWord(p));
        if (i !== -1) {
            out.category = categoryFromWord(parts[i]);
            if (parts[i + 1] && !/^umc\./.test(parts[i + 1])) out.slugTitle = titleFromSlug(parts[i + 1]);
        }
        return out;
    }
    if (/(^|\.)hotstar\.com$/.test(host) || /(^|\.)jiocinema\.com$/.test(host)) {
        out.service = 'hotstar';
        // /in/movies/<slug>/<id> or /in/shows/<slug>/<id>
        const i = parts.findIndex((p) => categoryFromWord(p));
        if (i !== -1) {
            out.category = categoryFromWord(parts[i]);
            if (parts[i + 1]) out.slugTitle = titleFromSlug(parts[i + 1]);
        }
        return out;
    }
    if (/(^|\.)imdb\.com$/.test(host)) {
        out.service = 'imdb';
        return out;
    }
    return out;
}

// Phrases share sheets wrap around the title. Order matters: the longer,
// service-specific ones go first.
const BOILERPLATE = [
    /^hey,?\s+i['’]?m\s+watching\s+/i,
    /^i['’]?m\s+watching\s+/i,
    /\.?\s*check\s+it\s+out\s+(now\s+)?on\s+[\w+ ]+!?$/i,
    /^check\s+out\s+this\s+(product|book|item|deal)\s+on\s+amazon\s*[:\-–]?\s*/i,
    /^check\s+out\s+/i,
    /^watch\s+/i,
    /^i\s+(just\s+)?(want\s+to\s+read|added|shelved)\s+/i,
    /\s+on\s+(netflix|prime\s+video|amazon|goodreads|letterboxd|steam|imdb|apple\s+tv\+?|jiohotstar|hotstar|disney\+)\s*[!.:]*$/i,
];

// Trailing store suffixes Amazon and IMDb put on page titles.
const SUFFIXES = [
    /\s*[:|\-–]\s*amazon\.[a-z.]+\s*:.*$/i,
    /\s*[:|\-–]\s*amazon\.[a-z.]+$/i,
    /\s*[|\-–]\s*imdb$/i,
    /\s*[|\-–]\s*netflix(\s+official\s+site)?$/i,
    /\s*[|\-–]\s*letterboxd$/i,
    /\s*on\s+steam$/i,
];

// Strips the URL and the wrapper text, leaving the thing's name (and maybe
// its creator and an IMDb-style "(TV Series 2022– )" tag).
function cleanText(text) {
    let s = (text || '').replace(new RegExp(URL_RE.source, 'gi'), ' ');
    s = cleanSpaces(s);
    // A quoted title wins outright: “Stranger Things” / "Stranger Things".
    const quoted = s.match(/[“"‘]([^”"’]{1,150})[”"’]/);
    if (quoted) return { body: cleanSpaces(quoted[1]) };
    for (let pass = 0; pass < 2; pass++) {
        for (const re of BOILERPLATE) s = s.replace(re, '');
        for (const re of SUFFIXES) s = s.replace(re, '');
        s = cleanSpaces(s.replace(/^[\s:\-–|]+|[\s:\-–|!]+$/g, ''));
    }
    return { body: s };
}

// Books only: "Title by Author" and Amazon's "Title : Author" carry the
// author. Films and shows are left whole, so "Stand by Me" stays intact.
function splitCreator(body, category) {
    let title = body;
    let creator = '';
    if (category !== 'bookshelf') return { title: cleanSpaces(title), creator };
    const by = body.match(/^(.+?)\s+by\s+(.+)$/i);
    if (by) {
        title = by[1];
        creator = by[2];
    } else if (/ : /.test(body)) {
        const [t, a] = body.split(' : ');
        title = t;
        creator = a || '';
    }
    return { title: cleanSpaces(title), creator: cleanSpaces(creator.replace(/\s*\(.*\)$/, '')) };
}

// IMDb share titles: "Severance (TV Series 2022– )", "Dune (2021)".
function readImdbTag(body) {
    const m = body.match(/^(.+?)\s*\((TV (Mini[ -])?Series|TV Movie)?\s*\d{4}[^)]*\)\s*$/i);
    if (!m) return null;
    const tag = (m[2] || '').toLowerCase();
    return { title: m[1], category: tag.includes('series') ? 'tvshelf' : 'filmshelf' };
}

/**
 * @param {{ text?: string, url?: string, title?: string }} shared
 *   What the share sheet sent. Android's share target fills all three; the
 *   iPhone Shortcut and the paste box send one blob as `text`.
 * @returns {{ ok: boolean, category: string, title: string, creator: string,
 *   url: string, message: string }}
 *   `category` is '' when the share doesn't say. `ok` is false only when no
 *   title could be read at all.
 */
export function parseShare(shared = {}) {
    // Android sends a separate `title`, which is often just the app's name;
    // the text is the better source, so `title` is only the fallback.
    const text = shared.text || '';
    const rawUrl = shared.url || (text.match(URL_RE) || (shared.title || '').match(URL_RE) || [''])[0];
    const url = parseUrl(rawUrl);
    const info = readUrl(url);

    let { body } = cleanText(text);
    if (!body && shared.title) body = cleanText(shared.title).body;
    let category = info.category;

    const imdb = readImdbTag(body);
    if (imdb) {
        body = imdb.title;
        if (!category) category = imdb.category;
    }

    let { title, creator } = splitCreator(body, category);
    // Text that is nothing but sentence-length chatter isn't a title.
    if (title.length > 150) title = '';
    if (!title) title = info.slugTitle;

    const result = { ok: Boolean(title), category, title, creator, url: url ? url.href : '', message: '' };
    if (!title) {
        result.message = 'Couldn’t read a title from that. Type it in below.';
    } else if (!category) {
        result.message = 'Couldn’t tell what kind of thing this is. Pick Book, Film, TV or Game.';
    }
    return result;
}
