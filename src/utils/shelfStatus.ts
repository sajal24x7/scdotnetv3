// Single source of truth for how the unified `status` field (todo/started/paused/finished)
// reads on each shelf category — the underlying value is shared, but the display text stays
// category-specific (a book is "Reading", a show is "Watching").

export type ShelfStatus = 'todo' | 'started' | 'paused' | 'finished';
export type ShelfCategory = 'bookshelf' | 'filmshelf' | 'tvshelf' | 'gameshelf';

export const SHELF_STATUS_LABELS: Record<ShelfCategory, Record<ShelfStatus, string>> = {
  bookshelf: { todo: 'To Read', started: 'Currently Reading', paused: 'On Hold', finished: 'Read' },
  filmshelf: { todo: 'To Watch', started: 'Watching', paused: 'On Hold', finished: 'Watched' },
  tvshelf: { todo: 'To Watch', started: 'Watching', paused: 'On Hold', finished: 'Watched' },
  gameshelf: { todo: 'To Play', started: 'Playing', paused: 'On Hold', finished: 'Played' },
};

// Feed titles read as "<verb>: <title>" (e.g. "Reading: Dune"), lowercase for on-hold/todo.
export const SHELF_STATUS_FEED_VERBS: Record<ShelfCategory, Record<ShelfStatus, string>> = {
  bookshelf: { todo: 'To read', started: 'Reading', paused: 'On hold', finished: 'Finished' },
  filmshelf: { todo: 'To watch', started: 'Watching', paused: 'On hold', finished: 'Watched' },
  tvshelf: { todo: 'To watch', started: 'Watching', paused: 'On hold', finished: 'Watched' },
  gameshelf: { todo: 'To play', started: 'Playing', paused: 'On hold', finished: 'Played' },
};

export const SHELF_STATUS_CHIP_CLASS: Record<ShelfStatus, string> = {
  todo: 'book-card__chip--status-todo',
  started: 'book-card__chip--status-started',
  paused: 'book-card__chip--status-paused',
  finished: 'book-card__chip--status-finished',
};

// Lower number = more "current" — used to pick the representative status when a show/entry
// has several seasons or replays with different statuses.
export const SHELF_STATUS_PRIORITY: Record<ShelfStatus, number> = {
  started: 0,
  paused: 1,
  todo: 2,
  finished: 3,
};

export function getShelfStatusLabel(category: ShelfCategory, status: ShelfStatus | undefined): string | undefined {
  return status ? SHELF_STATUS_LABELS[category][status] : undefined;
}
