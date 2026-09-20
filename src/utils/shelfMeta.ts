import { getBookCoverImage } from './bookCovers';
import { getFilmCoverImage } from './filmCovers';
import { getGameCoverImage } from './gameCovers';
import { getTVCoverImage } from './tvCovers';
import { bookRatingDisplay, type BookRating, type RatingIconSpec } from './bookRatings';

/**
 * Shelf detail-page metadata.
 *
 * Books, films, TV shows and games all render the same cover + byline + chip
 * header, differing only in which frontmatter fields feed which chip. Keeping
 * that difference in one config table (instead of four near-identical blocks of
 * markup) means a new shelf type is a single entry here.
 */

export const SHELF_CATEGORIES = ['bookshelf', 'filmshelf', 'tvshelf', 'gameshelf'] as const;

export type ShelfCategory = (typeof SHELF_CATEGORIES)[number];

export function isShelfCategory(category: string): category is ShelfCategory {
    return (SHELF_CATEGORIES as readonly string[]).includes(category);
}

export type ShelfChip =
    | {
        kind: 'genre' | 'format';
        /** Small uppercase label rendered before the value ("Genre", "Format", …). */
        sectionLabel: string;
        value: string;
    }
    | {
        kind: 'timeline';
        sectionLabel: string;
        value: string;
    }
    | {
        kind: 'rating';
        sectionLabel: string;
        rating: BookRating;
        ariaLabel: string;
        iconSpecs: readonly RatingIconSpec[];
    };

export interface ShelfMeta {
    byline: string | null;
    chips: ShelfChip[];
}

type ShelfData = Record<string, any>;

const parseDate = (value: Date | string | undefined | null): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatYMD = (value: Date | string | undefined | null): string | null => {
    const date = parseDate(value);
    return date ? date.toISOString().slice(0, 10) : null;
};

export const formatAuthors = (author?: string | string[] | null): string | null => {
    if (!author) return null;
    if (typeof author === 'string') return author;
    if (author.length === 0) return null;
    if (author.length === 1) return author[0];
    if (author.length === 2) return `${author[0]} and ${author[1]}`;
    return `${author.slice(0, -1).join(', ')}, and ${author[author.length - 1]}`;
};

const formatLabelMap: Record<string, string> = {
    audio: 'AUDIOBOOK',
    audiobook: 'AUDIOBOOK',
    ebook: 'EBOOK',
    digital: 'EBOOK',
    paper: 'PAPERBACK',
    paperback: 'PAPERBACK',
    hardcover: 'HARDCOVER'
};

const bookFormatLabel = (format?: string): string | null => {
    if (!format) return null;
    const normalized = format.toLowerCase();
    return formatLabelMap[normalized] ?? normalized.toUpperCase();
};

/** Read timeline for books: "started – finished", open-ended on either side. */
const readTimeline = (started?: Date | string, finished?: Date | string): string | null => {
    const startedDate = formatYMD(started);
    const finishedDate = formatYMD(finished);
    if (startedDate && finishedDate) return `${startedDate} – ${finishedDate}`;
    if (startedDate) return `${startedDate} –`;
    if (finishedDate) return `– ${finishedDate}`;
    return null;
};

const ratingChip = (rating: unknown, sectionLabel = 'Rated'): ShelfChip | null => {
    if (!rating) return null;
    const display = bookRatingDisplay[rating as BookRating];
    if (!display) return null;
    return {
        kind: 'rating',
        sectionLabel,
        rating: rating as BookRating,
        ariaLabel: display.label.replace(/^Rating:\s*/i, 'Rated '),
        iconSpecs: display.iconSpecs
    };
};

const genreChip = (genre: unknown): ShelfChip | null =>
    genre ? { kind: 'genre', sectionLabel: 'Genre', value: String(genre).toUpperCase() } : null;

const formatChip = (sectionLabel: string, value: unknown, uppercase = true): ShelfChip | null =>
    value
        ? { kind: 'format', sectionLabel, value: uppercase ? String(value).toUpperCase() : String(value) }
        : null;

const timelineChip = (sectionLabel: string, value: unknown): ShelfChip | null =>
    value ? { kind: 'timeline', sectionLabel, value: String(value) } : null;

interface ShelfConfig {
    coverImage: (cover: string) => unknown;
    byline: (data: ShelfData) => string | null;
    chips: (data: ShelfData) => (ShelfChip | null)[];
}

const SHELF_CONFIGS: Record<ShelfCategory, ShelfConfig> = {
    bookshelf: {
        coverImage: getBookCoverImage,
        byline: (data) => {
            const authors = formatAuthors(data.author);
            return authors ? `by ${authors}` : null;
        },
        chips: (data) => [
            genreChip(data.genre),
            formatChip('Format', bookFormatLabel(data.format), false),
            ratingChip(data.rating),
            timelineChip('Read', readTimeline(data.started, data.finished))
        ]
    },
    filmshelf: {
        coverImage: getFilmCoverImage,
        byline: (data) => {
            const directors = formatAuthors(data.director);
            return directors ? `Directed by ${directors}` : null;
        },
        chips: (data) => [
            genreChip(data.genre),
            timelineChip('Year', data.year),
            ratingChip(data.rating),
            timelineChip('Watched', formatYMD(data.finished))
        ]
    },
    gameshelf: {
        coverImage: getGameCoverImage,
        byline: (data) => (data.developer ? `by ${data.developer}` : null),
        chips: (data) => [
            genreChip(data.genre),
            formatChip('Platform', data.platform),
            timelineChip('Year', data.year),
            ratingChip(data.rating)
        ]
    },
    tvshelf: {
        coverImage: getTVCoverImage,
        byline: (data) => {
            const creators = formatAuthors(data.creator);
            return creators ? `Created by ${creators}` : null;
        },
        chips: (data) => [
            genreChip(data.genre),
            timelineChip('Year', data.year),
            formatChip('Season', data.season, false),
            ratingChip(data.rating)
        ]
    }
};

export function getShelfMeta(category: ShelfCategory, data: ShelfData): ShelfMeta {
    const config = SHELF_CONFIGS[category];
    return {
        byline: config.byline(data),
        chips: config.chips(data).filter((chip): chip is ShelfChip => chip !== null)
    };
}

export function getShelfCoverImage(category: ShelfCategory, cover?: string) {
    if (!cover) return null;
    return SHELF_CONFIGS[category].coverImage(cover) ?? null;
}
