export type BookRating = 'like' | 'love' | 'nope';

export type ThumbDirection = 'up' | 'down';

export type RatingIconSpec =
    | {
        type: 'thumb';
        direction: ThumbDirection;
        size: number;
    }
    | {
        type: 'heart';
        size: number;
    };

export interface BookRatingDisplay {
    label: string;
    iconSpecs: readonly RatingIconSpec[];
}

export const defaultBookRating: BookRating = 'like';

export const bookRatingOrder: readonly BookRating[] = ['love', 'like', 'nope'];

export const thumbIconPaths: Record<ThumbDirection, readonly string[]> = {
    up: [
        'M8 11.5V4.25c0-1.036.84-1.875 1.875-1.875.62 0 1.222.191 1.725.551l1.29.92c.44.315.705.821.705 1.361V10h5.167c1.172 0 1.97 1.174 1.579 2.29l-2.062 5.934a2.25 2.25 0 0 1-2.125 1.526H9.75A1.75 1.75 0 0 1 8 18v-6.5z',
        'M8 11.5H5.75A2.75 2.75 0 0 0 3 14.25v0A2.75 2.75 0 0 0 5.75 17H8'
    ],
    down: [
        'M16 12.5v7.25c0 1.036-.84 1.875-1.875 1.875-.62 0-1.222-.191-1.725-.551l-1.29-.92a1.75 1.75 0 0 1-.705-1.361V14H5.238c-1.172 0-1.97-1.174-1.579-2.29l2.062-5.934A2.25 2.25 0 0 1 7.846 4.25H14.25c.966 0 1.75.784 1.75 1.75v6.5z',
        'M16 12.5h2.25A2.75 2.75 0 0 0 21 9.75v0A2.75 2.75 0 0 0 18.25 7H16'
    ]
};

export const heartIconPaths: readonly string[] = [
    'M21 8.25c0 2.485-1.355 4.736-3.515 6.42-1.64 1.29-3.68 2.364-5.485 3.08-1.805-.716-3.845-1.79-5.485-3.08C4.355 12.986 3 10.735 3 8.25 3 5.427 5.273 3 8.05 3c1.511 0 2.936.706 3.9 1.874C12.964 3.706 14.389 3 15.9 3 18.727 3 21 5.427 21 8.25z'
];

export const bookRatingDisplay: Record<BookRating, BookRatingDisplay> = {
    like: {
        label: 'Rating: Like',
        iconSpecs: [
            { type: 'thumb', direction: 'up', size: 18 }
        ]
    },
    love: {
        label: 'Rating: Love',
        iconSpecs: [
            { type: 'heart', size: 20 }
        ]
    },
    nope: {
        label: 'Rating: Dislike',
        iconSpecs: [
            { type: 'thumb', direction: 'down', size: 18 }
        ]
    }
};

export const bookRatingLabels: Record<BookRating, string> = {
    like: bookRatingDisplay.like.label,
    love: bookRatingDisplay.love.label,
    nope: bookRatingDisplay.nope.label
};
