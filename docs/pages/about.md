# About Page & Life Timeline

The about page (`/sajal/`) has two parts: a context section pairing intro copy with a portrait, and a timeline that renders the same set of life events two ways — a chronological **stream** and a Tim Urban–style **life calendar** of 90 years × 52 weeks.

Both views, and the intro copy, come from one file: **`src/data/life.md`**. That is the only file to edit when revisiting the timeline.

| File | Role |
| --- | --- |
| `src/data/life.md` | The single editable source: intro copy plus one `##` section per event. |
| `src/utils/life.ts` | Parses the doc and maps month/year dates onto week cells. Dependency-free. |
| `src/components/LifeTimeline.astro` | Renders both views, the view toggle, tooltips, and the click-through. |
| `src/pages/sajal.astro` | Composes the context section and the timeline. |
| `src/utils/__checks__/life.check.ts` | Checks for the date parser and the week mapping. |

## Editing the timeline

Everything above the first `##` heading is the intro shown beside the portrait. Every `##` below it is one timeline entry:

```markdown
## Title of the thing
when: Aug 2015 - now

A paragraph or two in plain markdown. Links, lists, emphasis all work.
```

Entries may be written in any order — they are sorted by date at build time. A section with no `when:` line, or one whose date cannot be parsed, is skipped rather than throwing, so a half-written entry never breaks the build.

### Dates

Month and year is enough precision; a day is optional.

| Written as | Read as |
| --- | --- |
| `Aug 2015`, `August 2015`, `2015-08` | The month — starts on the 1st |
| `22 Nov 1991`, `Feb 15, 2025`, `2025-02-15` | That exact day |
| `Aug 2015 - Jul 2017` | An **era** — every week from 1 Aug 2015 to 31 Jul 2017 |
| `Aug 2015 - now` | An era still running; the end tracks today on each build |
| `Feb 15, 2025` | A **moment** — one week |

Hyphens and en dashes both separate a range. `now`, `present`, and `ongoing` all mark an era as open-ended.

**Why month precision is enough.** A month resolves to a first-of-month start and an end-of-month end. Since a week cell is marked whenever an entry's date interval overlaps it, a month lands on the four or five weeks it actually spans — no week-number arithmetic required when writing.

## How the calendar is built

`buildLifeCalendar()` lays the life out as 90 rows of 52 cells, **anchored to birthdays rather than calendar years**. Row *n* runs from the birthday opening year *n* to the next one.

A real year is 52 weeks plus a day or two. Rather than let that remainder accumulate and drift birthdays across columns further down the grid, the last cell of each row absorbs it — so every row is exactly one year wide and column 0 is always the birthday week.

Each cell carries three things:

- **state** — `past`, `current`, or `future`, from comparing the cell against today at UTC midnight.
- **entryIds** — every entry whose interval overlaps the cell.
- **hasMoment** — whether any of those entries is a single date rather than an era.

### Visual language

The calendar is deliberately binary — time spent against time remaining — with entries layered on top:

| Cell | Treatment |
| --- | --- |
| Lived | Solid ink at 55% |
| Remaining | Ink at 8% |
| Current week | Accent fill plus a halo ring, gently pulsing |
| Week holding an era | Accent at 40% |
| Week holding a moment | Accent at 80% |

The current week is the only cell with a ring. Without it, it would be indistinguishable from a moment entry, since both are accent-filled.

## Interaction

- **Toggle** — the two icon buttons mirror the photos page toolbar (`src/components/PhotoGrid.astro`); the calendar leads on load.
- **Hover or focus** a marked week for a tooltip with the entry title and date. It clamps to the grid's edges and flips below the cell when it would clip off the top.
- **Click** a marked week to switch to the stream view, scroll to that entry, and flash it.

Marked weeks are `<button>` elements so they are keyboard reachable and carry the entry title as their accessible name; unmarked weeks are inert `<span>`s. A visually hidden paragraph above the grid describes the whole calendar for screen readers.

Tooltip markup is injected at runtime, so its inner rules use `:global()` — Astro's scoped styles would not match generated elements. Cells reference entries by id through a small JSON lookup rather than repeating text on every cell, since a single era can cover hundreds of them.

## Verifying changes

```bash
node --experimental-strip-types src/utils/__checks__/life.check.ts
```

Covers each accepted date format, era-versus-moment classification, chronological sorting, the skipping of malformed entries, birthday anchoring, and the invariant that exactly one week is `current` and it sits on the past/future seam.
