export type BookRating = 'not-for-me' | 'liked-it' | 'loved-it';

export const bookRatingLabelSuggestions: Record<BookRating, readonly string[]> = {
    'not-for-me': [
        'Not for me',
        'Didn\'t click',
        'Wouldn\'t rewatch',
        'Hard to recommend',
        'Pass on this'
    ],
    'liked-it': [
        'Liked it',
        'Solid pick',
        'Glad I read it',
        'Easy recommendation',
        'Worth your time',
        'A satisfying read',
        'Delightful ride',
        'Delivered the goods',
        'Would share with friends',
        'Kept me turning pages'
    ],
    'loved-it': [
        'Loved it',
        'Instant favorite',
        'Couldn\'t put it down',
        'Obsessed with it',
        'All-time contender'
    ]
};

export const defaultBookRatingLabels: Record<BookRating, string> = {
    'not-for-me': bookRatingLabelSuggestions['not-for-me'][0],
    'liked-it': bookRatingLabelSuggestions['liked-it'][0],
    'loved-it': bookRatingLabelSuggestions['loved-it'][0]
};
