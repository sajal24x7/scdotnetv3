0) Objective
	•	New BookshelfCard mirrors the latest mock: cover on the left, series above title, author line, then a compact meta row with status/format chips, dates, and Netflix-style rating.
	•	Cards share the same markup in the bookshelf index and Garden views; all backgrounds stay transparent so they blend with section grids.
	•	The bookshelf page groups entries by reading year with a sticky left rail that displays the year and the number of finished books in that year.

1) Data model
	•	title (string; required)
	•	author (string; required for the meta row)
	•	series (string, optional; appears above the title when present)
	•	format (string; normalized at render time to AUDIOBOOK / EBOOK / PAPER / HARDCOVER)
	•	bookStatus (enum: reading | read | finished | on-hold | to-read; read aliases finished)
	•	readingProgress (number 0–100, optional; only used when status=reading)
	•	startedReading (Date|string, optional)
	•	finishedReading (Date|string, optional)
	•	bookRating (enum: love | like | nope; omitted when undefined or while reading)
	•	bookCover (image filename from /src/images/bookshelf, optional)
	•	pubDate (Date|string; fallback for year grouping when other dates are missing)

2) Card layout
	•	Surface stays transparent with no extra border; spacing handled by parent grid.
	•	Left column: fixed cover (aspect 2:3) with 72px width on mobile, 84px ≥720px. Placeholder icon shows if no art.
	•	Right column:
		◦	Series (optional) at the top in the same size as the author line.
		◦	Title set larger than body copy; links inherit global hover styles.
		◦	Author on its own line with reduced size for hierarchy.
		◦	Meta row now has two stacked lines: the first holds status/format chips, the second shows a timeline chip (book icon + date span) and the Netflix rating.
		◦	Progress bar (4px high) appears only for reading status with defined progress.

3) Chips & rating
	•	Status chip fills:
		◦	reading → lavender (#ede9fe) with deep purple text (#5b21b6)
		◦	finished/read → mint (#dcfce7) with dark green text (#166534)
		◦	on-hold → peach (#fef3c7) with brown text (#b45309)
		◦	to-read → sky (#dbeafe) with blue text (#1d4ed8)
	•	Format chip uses neutral gray fill (#e5e7eb light / #374151 dark) with contrasting text.
	•	Chips share 0.65rem uppercase text, 0.55rem horizontal padding, and 4px radius (no borders); the timeline chip uses a neutral fill (#f3f4f6 light / #1f2937 dark), retains the open-book icon, and drops text-transform for readable date strings.
	•	Rating glyphs reuse the thumbs icons: love = 👍👍, like = 👍, nope = 👎 (muted red). When no rating, render an em dash and “Rating: Not set” aria-label.

4) Meta row content
	•	Only include populated values; omit entire segments when data is missing.
	•	Timeline chip formats as `{startedDate} – {finishedDate}` (trailing dash when the book is still in progress); data falls back to finished → started → pubDate.
	•	Dot separators are no longer used; spacing relies on flex gaps between chips.
	•	Progress bar uses sticky colors (#166534 light / #34d399 dark) with a muted gray track.

5) Bookshelf page behavior
	•	Remove the legacy “Currently Reading” section; everything lives in the main list.
	•	Derive the grouping year from finishedReading → startedReading → pubDate.
	•	Sort order inside each year:
		1. reading (progress desc, then started date desc)
		2. finished/read (finished date desc fallback pubDate)
		3. on-hold, to-read (started date desc fallback pubDate)
		4. default fallback on pubDate desc
	•	Years render in descending order. The left rail shows `{year}` and `{finishedCount} book(s)` and stays sticky while its year’s cards scroll.
	•	Right column stacks cards full width; spacing matches the clamp rhythm used in other grids.

6) Accessibility
	•	Cover alt text: “Cover of {title}”.
	•	Progress bar exposes role="progressbar" with aria-valuenow.
	•	Rating wrapper announces “Rating: Love/Like/Dislike/Not set”.
	•	Sticky year rail collapses to static on narrow viewports (<48rem) to avoid awkward scroll behavior.

7) Migration & follow-up
	1.	Update frontmatter whenever needed so `bookStatus` and `readingProgress` reflect reality; cards expect the new enum values.
	2.	Populate `finishedReading` for completed books so year grouping and counts stay accurate.
	3.	Once content settles, consider surfacing per-year filters or navigation anchors in the sticky rail (out of scope for this pass).
