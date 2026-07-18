/**
 * Generic click-to-filter engine shared by the shelf pages (filmshelf, tvshelf,
 * gameshelf, and the combined shelf page). Cards already render buttons like
 * `data-filter-type="genre" data-filter-value="Sci-Fi"` (see BookshelfCard,
 * FilmCard, GameCard, TVCard) — this module wires those clicks up to hide/show
 * the matching `[data-shelf-item]` elements and renders the active-filter
 * badges into the page's ShelfFilterResults container.
 *
 * The bookshelf page predates this module and keeps its own bespoke script;
 * this engine mirrors its UX (click a chip to filter, click a badge to remove
 * it, "Clear all" once more than one filter is active) for every other page.
 */

export interface ShelfFilterTypeConfig {
    /** Matches the `data-filter-type` value on card buttons. */
    type: string;
    /** Data attribute read off `[data-shelf-item]` elements. Defaults to `data-{type}`. */
    attr?: string;
    /** Raw value -> display label (e.g. rating/status/format codes). */
    labels?: Record<string, string>;
    /** Extra modifier class appended to that filter type's badge, e.g. by rating value. */
    badgeClass?: (value: string) => string | undefined;
}

export interface ShelfFilterConfig {
    /** Selector for the filterable item wrapper, e.g. '[data-shelf-item]'. */
    itemSelector: string;
    filterTypes: ShelfFilterTypeConfig[];
    countNoun: { singular: string; plural: string };
    resultsId?: string;
    summaryId?: string;
    activeContainerId?: string;
    /** Selector for the year sections that should hide when empty. Defaults to '[data-year]'. */
    yearSelector?: string;
}

const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            default: return '&#39;';
        }
    });

export function initShelfFilters(config: ShelfFilterConfig): void {
    const {
        itemSelector,
        filterTypes,
        countNoun,
        resultsId = 'shelf-filter-results',
        summaryId = 'shelf-filter-summary',
        activeContainerId = 'shelf-filter-active',
        yearSelector = '[data-year]',
    } = config;

    const typeConfigMap = new Map(filterTypes.map((t) => [t.type, t]));
    const selected = new Map<string, string>();

    const resultsDisplay = document.getElementById(resultsId);
    const filterSummary = document.getElementById(summaryId);
    const activeFiltersContainer = document.getElementById(activeContainerId);

    const attrFor = (type: string): string => typeConfigMap.get(type)?.attr ?? `data-${type}`;

    const labelFor = (type: string, value: string): string => {
        const cfg = typeConfigMap.get(type);
        return cfg?.labels?.[value] ?? value;
    };

    const nounFor = (count: number): string => (count === 1 ? countNoun.singular : countNoun.plural);

    function updateFilterDisplay(visibleCount: number): void {
        if (!activeFiltersContainer) return;

        if (selected.size === 0) {
            resultsDisplay?.setAttribute('hidden', '');
            if (filterSummary) filterSummary.textContent = '';
            activeFiltersContainer.innerHTML = '';
            return;
        }

        resultsDisplay?.removeAttribute('hidden');

        if (filterSummary) {
            filterSummary.textContent = `Showing ${visibleCount} ${nounFor(visibleCount)}`;
        }

        const badges: string[] = [];
        for (const { type } of filterTypes) {
            const value = selected.get(type);
            if (value === undefined) continue;
            const label = labelFor(type, value);
            const extraClass = typeConfigMap.get(type)?.badgeClass?.(value) ?? '';
            badges.push(`
                <button type="button" class="shelf-filter-badge ${extraClass}" data-remove-shelf-filter="${type}">
                    ${escapeHtml(label)} <span class="shelf-filter-badge__remove" aria-label="Remove ${escapeHtml(type)} filter">&times;</span>
                </button>
            `);
        }

        if (selected.size > 1) {
            badges.push(`
                <button type="button" class="shelf-filter-badge shelf-filter-badge--clear-all" data-remove-shelf-filter="all">
                    Clear all
                </button>
            `);
        }

        activeFiltersContainer.innerHTML = badges.join('');
    }

    function applyFilters(): void {
        const items = document.querySelectorAll<HTMLElement>(itemSelector);
        const yearCounts: Record<string, number> = {};
        let visibleCount = 0;

        items.forEach((item) => {
            const isVisible = Array.from(selected.entries()).every(([type, value]) => {
                const raw = item.getAttribute(attrFor(type)) || '';
                return raw.split(',').map((v) => v.trim()).filter(Boolean).includes(value);
            });

            if (isVisible) {
                item.removeAttribute('data-filtered');
                visibleCount++;
                const yearSection = item.closest<HTMLElement>(yearSelector);
                if (yearSection) {
                    const year = yearSection.getAttribute('data-year') || '';
                    yearCounts[year] = (yearCounts[year] || 0) + 1;
                }
            } else {
                item.setAttribute('data-filtered', 'hidden');
            }
        });

        const yearSections = document.querySelectorAll<HTMLElement>(yearSelector);
        yearSections.forEach((section) => {
            const year = section.getAttribute('data-year') || '';
            const count = yearCounts[year] || 0;
            const countEl = section.querySelector<HTMLElement>(`[data-year-count="${year}"]`);

            if (countEl && countEl.dataset.originalText === undefined) {
                countEl.dataset.originalText = countEl.textContent ?? '';
            }

            if (count === 0) {
                section.setAttribute('data-filtered', 'hidden');
            } else {
                section.removeAttribute('data-filtered');
            }

            if (countEl) {
                countEl.textContent = selected.size > 0
                    ? `Showing ${count} ${nounFor(count)}`
                    : (countEl.dataset.originalText ?? countEl.textContent ?? '');
            }
        });

        updateFilterDisplay(visibleCount);
    }

    function clearTagListActiveState(): void {
        const tagList = document.querySelector<HTMLElement & { clearActiveTag?: () => void }>('tag-list');
        tagList?.clearActiveTag?.();
    }

    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        const removeButton = target.closest<HTMLElement>('[data-remove-shelf-filter]');
        if (removeButton) {
            event.preventDefault();
            const key = removeButton.getAttribute('data-remove-shelf-filter');
            if (key === 'all') {
                selected.clear();
                clearTagListActiveState();
            } else if (key) {
                selected.delete(key);
                if (key === 'tag') clearTagListActiveState();
            }
            applyFilters();
            return;
        }

        const filterTrigger = target.closest<HTMLElement>('[data-filter-type]');
        if (filterTrigger) {
            const type = filterTrigger.getAttribute('data-filter-type');
            if (!type || !typeConfigMap.has(type)) return;

            event.preventDefault();
            const value = filterTrigger.getAttribute('data-filter-value') || '';

            if (selected.get(type) === value) {
                selected.delete(type);
            } else {
                selected.set(type, value);
            }

            applyFilters();
        }
    });

    if (typeConfigMap.has('tag')) {
        document.addEventListener('tagfilter', (event) => {
            const tag = (event as CustomEvent<{ tag?: string }>).detail?.tag || '';
            if (tag) {
                selected.set('tag', tag);
            } else {
                selected.delete('tag');
            }
            applyFilters();
        });
    }
}
