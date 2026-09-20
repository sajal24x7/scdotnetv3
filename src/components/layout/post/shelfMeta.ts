import { getBookCoverImage } from '../../../utils/bookCovers';
import { getFilmCoverImage } from '../../../utils/filmCovers';
import { getGameCoverImage } from '../../../utils/gameCovers';
import { getTVCoverImage } from '../../../utils/tvCovers';
import type { BookRating } from '../../../utils/bookRatings';
import { formatYMD, formatNames } from './postFields';

export type ShelfChip =
    // Blue chip, value shown uppercase as authored (genre).
    | { kind: 'genre'; label: string; value: string }
    // Neutral chip (book format, game platform, TV season).
    | { kind: 'format'; label: string; value: string | number }
    // Pill chip for dates and years; the value keeps its own span.
    | { kind: 'timeline'; label: string; value: string | number }
    // Colour-coded rating with its like/love/nope icon.
    | { kind: 'rating'; label: string; rating: BookRating };

export type ShelfChipSpec = ShelfChip | null;

type ShelfData = Record<string, any>;

interface ShelfConfig {
    cover: (filename: any) => any;
    credits: (data: ShelfData) => string | null;
    chips: (data: ShelfData) => ShelfChipSpec[];
}

const upper = (value: unknown) => (value ? String(value).toUpperCase() : '');

const bookFormatLabels: Record<string, string> = {
    audio: 'AUDIOBOOK',
    audiobook: 'AUDIOBOOK',
    ebook: 'EBOOK',
    digital: 'EBOOK',
    paper: 'PAPERBACK',
    paperback: 'PAPERBACK',
    hardcover: 'HARDCOVER'
};

function bookFormatLabel(format?: string): string {
    if (!format) return '';
    const normalized = format.toLowerCase();
    return bookFormatLabels[normalized] ?? normalized.toUpperCase();
}

// Books show the span they were read across; a missing end keeps the dash open.
function readTimeline(data: ShelfData): string {
    const started = formatYMD(data.started);
    const finished = formatYMD(data.finished);
    if (started && finished) return `${started} – ${finished}`;
    if (started) return `${started} –`;
    if (finished) return `– ${finished}`;
    return '';
}

const ratingChip = (data: ShelfData): ShelfChipSpec =>
    data.rating ? { kind: 'rating', label: 'Rated', rating: data.rating as BookRating } : null;

// Each shelf type differs only in where its credits and chips come from.
const SHELF_CONFIG: Record<string, ShelfConfig> = {
    bookshelf: {
        cover: getBookCoverImage,
        credits: (data) => {
            const authors = formatNames(data.author);
            return authors ? `by ${authors}` : null;
        },
        chips: (data) => [
            { kind: 'genre', label: 'Genre', value: upper(data.genre) },
            { kind: 'format', label: 'Format', value: bookFormatLabel(data.format) },
            ratingChip(data),
            { kind: 'timeline', label: 'Read', value: readTimeline(data) }
        ]
    },
    filmshelf: {
        cover: getFilmCoverImage,
        credits: (data) => {
            const directors = formatNames(data.director);
            return directors ? `Directed by ${directors}` : null;
        },
        chips: (data) => [
            { kind: 'genre', label: 'Genre', value: upper(data.genre) },
            { kind: 'timeline', label: 'Year', value: data.year ?? '' },
            ratingChip(data),
            { kind: 'timeline', label: 'Watched', value: formatYMD(data.finished) ?? '' }
        ]
    },
    gameshelf: {
        cover: getGameCoverImage,
        credits: (data) => (data.developer ? `by ${data.developer}` : null),
        chips: (data) => [
            { kind: 'genre', label: 'Genre', value: upper(data.genre) },
            { kind: 'format', label: 'Platform', value: upper(data.platform) },
            { kind: 'timeline', label: 'Year', value: data.year ?? '' },
            ratingChip(data)
        ]
    },
    // Fallback page for a single TV entry; the primary show page is
    // src/pages/tvshelf/[show]/index.astro.
    tvshelf: {
        cover: getTVCoverImage,
        credits: (data) => {
            const creators = formatNames(data.creator);
            return creators ? `Created by ${creators}` : null;
        },
        chips: (data) => [
            { kind: 'genre', label: 'Genre', value: upper(data.genre) },
            { kind: 'timeline', label: 'Year', value: data.year ?? '' },
            { kind: 'format', label: 'Season', value: data.season ?? '' },
            ratingChip(data)
        ]
    }
};

export interface ShelfMeta {
    coverImage: any;
    credits: string | null;
    chips: ShelfChipSpec[];
}

export function buildShelfMeta(category: string, data: ShelfData): ShelfMeta {
    const config = SHELF_CONFIG[category];
    if (!config) {
        return { coverImage: null, credits: null, chips: [] };
    }

    return {
        coverImage: data.cover ? config.cover(data.cover) : null,
        credits: config.credits(data),
        chips: config.chips(data)
    };
}
