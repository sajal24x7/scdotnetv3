type PagefindResultData = {
    url: string;
    content: string;
    filters: Record<string, string[]>;
    meta: Record<string, string>;
    excerpt: string;
};

type PagefindResult = {
    id: string;
    data: () => Promise<PagefindResultData>;
};

type PagefindInstance = {
    init: () => Promise<void>;
    search: (
        query: string | null,
        options?: { filters?: Record<string, string> }
    ) => Promise<{ results: PagefindResult[] }>;
};

const DEFAULT_STATE_TEMPLATE = `
    <div class="p-8 text-center text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>Start typing to search through posts...</p>
    </div>
`;

const MIN_CHARS_TEMPLATE = `
    <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        Type at least 2 characters to search...
    </div>
`;

const LOADING_TEMPLATE = `
    <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading search index...
    </div>
`;

const ERROR_TEMPLATE = `
    <div class="p-4 text-center text-red-500 dark:text-red-400">
        Search index not found. Run <code>npm run build</code> to enable search.
    </div>
`;

class SearchModalElement extends HTMLElement {
    private modalId: string = 'global-search';
    private triggers: HTMLElement[] = [];
    private previouslyFocused: HTMLElement | null = null;
    private isOpen = false;

    private closeButton: HTMLElement | null = null;
    private inputElement: HTMLInputElement | null = null;
    private resultsContainer: HTMLElement | null = null;
    private pagefind: PagefindInstance | null = null;
    private loadingPromise: Promise<PagefindInstance | null> | null = null;
    private isIndexLoaded = false;

    private handleTriggerClick = (event: Event) => {
        event.preventDefault();
        this.openModal();
    };

    private handleCloseClick = (event: Event) => {
        event.preventDefault();
        this.closeModal();
    };

    private handleInput = () => {
        if (!this.inputElement) return;
        void this.performSearch(this.inputElement.value);
    };

    private handleInputKeydown = (event: KeyboardEvent) => {
        if (event.key !== 'Enter' || !this.resultsContainer) return;
        const firstResult = this.resultsContainer.querySelector<HTMLAnchorElement>('a');
        if (firstResult) {
            event.preventDefault();
            window.location.href = firstResult.href;
        }
    };

    private handleBackdropClick = (event: Event) => {
        const target = event.target as HTMLElement | null;
        if (target === this || target?.dataset.searchOverlay === 'true') {
            this.closeModal();
        }
    };

    private handleGlobalKeydown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            this.openModal();
            return;
        }
        if (event.key === 'Escape' && this.isOpen) {
            event.preventDefault();
            this.closeModal();
        }
    };

    connectedCallback() {
        this.modalId = this.dataset.modalId || this.modalId;
        this.closeButton = this.querySelector('[data-search-close]');
        this.inputElement = this.querySelector('[data-search-input]');
        this.resultsContainer = this.querySelector('[data-search-results]');

        this.renderDefaultState();
        this.attachTriggerListeners();
        this.closeButton?.addEventListener('click', this.handleCloseClick);
        this.inputElement?.addEventListener('input', this.handleInput);
        this.inputElement?.addEventListener('keydown', this.handleInputKeydown);
        this.addEventListener('click', this.handleBackdropClick);
        window.addEventListener('keydown', this.handleGlobalKeydown);
    }

    disconnectedCallback() {
        this.detachTriggerListeners();
        this.closeButton?.removeEventListener('click', this.handleCloseClick);
        this.inputElement?.removeEventListener('input', this.handleInput);
        this.inputElement?.removeEventListener('keydown', this.handleInputKeydown);
        this.removeEventListener('click', this.handleBackdropClick);
        window.removeEventListener('keydown', this.handleGlobalKeydown);
    }

    private attachTriggerListeners() {
        this.triggers = Array.from(document.querySelectorAll<HTMLElement>(`[data-search-modal="${this.modalId}"]`));
        this.triggers.forEach((trigger) => {
            if (trigger.dataset.searchModalBound === 'true') return;
            trigger.addEventListener('click', this.handleTriggerClick);
            trigger.dataset.searchModalBound = 'true';
        });
    }

    private detachTriggerListeners() {
        this.triggers.forEach((trigger) => {
            trigger.removeEventListener('click', this.handleTriggerClick);
            delete trigger.dataset.searchModalBound;
        });
        this.triggers = [];
    }

    public open() { this.openModal(); }
    public close() { this.closeModal(); }

    private openModal() {
        if (this.isOpen) return;
        this.previouslyFocused = document.activeElement as HTMLElement | null;
        this.classList.remove('hidden');
        this.classList.add('flex');
        document.body.style.overflow = 'hidden';
        this.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        void this.ensureIndexLoaded();
        window.setTimeout(() => { this.inputElement?.focus(); }, 100);
    }

    private closeModal() {
        if (!this.isOpen) return;
        this.classList.add('hidden');
        this.classList.remove('flex');
        document.body.style.overflow = '';
        this.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        if (this.inputElement) this.inputElement.value = '';
        this.renderDefaultState();
        if (this.previouslyFocused) this.previouslyFocused.focus();
    }

    private renderDefaultState() {
        if (this.resultsContainer) this.resultsContainer.innerHTML = DEFAULT_STATE_TEMPLATE;
    }

    private renderMinCharsState() {
        if (this.resultsContainer) this.resultsContainer.innerHTML = MIN_CHARS_TEMPLATE;
    }

    private renderLoadingState() {
        if (this.resultsContainer) this.resultsContainer.innerHTML = LOADING_TEMPLATE;
    }

    private renderErrorState() {
        if (this.resultsContainer) this.resultsContainer.innerHTML = ERROR_TEMPLATE;
    }

    private renderNoResultsState(query: string) {
        if (!this.resultsContainer) return;
        this.resultsContainer.innerHTML = `
            <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <div class="mb-2">No results found for "<strong>${query}</strong>"</div>
                <div class="text-small space-y-1">
                    <div>💡 Try a different search term</div>
                    <div>🏷️ Use "tag:ai" for exact tag matches</div>
                </div>
            </div>
        `;
    }

    private async ensureIndexLoaded() {
        if (this.isIndexLoaded) return;
        if (!this.loadingPromise) {
            this.loadingPromise = this.loadPagefind();
        }
        const pf = await this.loadingPromise;
        if (pf) {
            this.pagefind = pf;
            this.isIndexLoaded = true;
        }
    }

    private async loadPagefind(): Promise<PagefindInstance | null> {
        try {
            // @ts-ignore — generated at build time, not resolvable by TS
            const pf = await import(/* @vite-ignore */ '/pagefind/pagefind.js') as PagefindInstance;
            await pf.init();
            return pf;
        } catch (error) {
            console.error('Pagefind failed to load', error);
            return null;
        } finally {
            this.loadingPromise = null;
        }
    }

    private async performSearch(rawQuery: string) {
        if (!this.resultsContainer) return;
        const query = rawQuery.trim();

        if (query.length === 0) {
            this.renderDefaultState();
            return;
        }

        if (query.length < 2 && !query.startsWith('tag:')) {
            this.renderMinCharsState();
            return;
        }

        if (!this.isIndexLoaded) {
            this.renderLoadingState();
            await this.ensureIndexLoaded();
        }

        if (!this.isIndexLoaded) {
            this.renderErrorState();
            return;
        }

        const isTagSearch = query.startsWith('tag:');
        const tagQuery = isTagSearch ? query.substring(4).toLowerCase().trim() : '';

        try {
            let searchResult: { results: PagefindResult[] };

            if (isTagSearch) {
                if (!tagQuery) {
                    this.renderMinCharsState();
                    return;
                }
                searchResult = await this.pagefind!.search(null, { filters: { tag: tagQuery } });
            } else {
                searchResult = await this.pagefind!.search(query);
            }

            if (searchResult.results.length === 0) {
                this.renderNoResultsState(query);
                return;
            }

            const limited = searchResult.results.slice(0, 10);
            const resultData = await Promise.all(limited.map((r) => r.data()));
            this.resultsContainer.innerHTML = resultData
                .map((data) => this.renderResultItem(data, isTagSearch, tagQuery))
                .join('');
        } catch (error) {
            console.error('Search failed', error);
            this.renderErrorState();
        }
    }

    private renderResultItem(data: PagefindResultData, isTagSearch: boolean, tagQuery: string) {
        const tags = data.filters?.tag ?? [];
        const category = data.meta?.category ?? '';
        const title = data.meta?.title ?? 'Untitled';
        const href = data.url;

        const tagBadges = tags.slice(0, 3).map((tag) => {
            const isActive = isTagSearch && tag === tagQuery;
            const classes = ['tag-chip', 'tag-chip-inline', isActive ? 'tag-chip-active' : ''].filter(Boolean).join(' ');
            return `<span class="${classes}">${tag.toUpperCase()}</span>`;
        }).join('');

        // data.excerpt is Pagefind-generated HTML with <mark> highlights — safe, from our own content
        return `
            <a href="${href}" class="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0 transition-colors group">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${title}</h3>
                        </div>
                        ${category ? `<p class="text-small text-gray-600 dark:text-gray-400 mb-2 capitalize">${category}</p>` : ''}
                        ${data.excerpt ? `<p class="text-small text-gray-500 dark:text-gray-500 mb-2 line-clamp-2 pagefind-excerpt">${data.excerpt}</p>` : ''}
                        ${tags.length > 0 ? `<div class="flex flex-wrap">${tagBadges}</div>` : ''}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </div>
            </a>
        `;
    }
}

if (!customElements.get('search-modal')) {
    customElements.define('search-modal', SearchModalElement);
}
