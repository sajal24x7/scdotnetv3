export const FEATURED_POST_SLUGS = [
    're-designing-my-home-screen-and-the-way-i-use-my-phone',
    'when-someone-has-been-dead-for-a-while',
    'mixed-format-books',
    'write-more',
    'a-couple-of-rasagullas',
    'the-goal-with-yoga'
] as const;

export type FeaturedPostSlug = typeof FEATURED_POST_SLUGS[number];
