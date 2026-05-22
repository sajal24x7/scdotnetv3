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

const form = document.getElementById('search-form') as HTMLFormElement | null;
const input = document.getElementById('search-input') as HTMLInputElement | null;
const status = document.getElementById('search-status') as HTMLDivElement | null;
const resultsEl = document.getElementById('search-results') as HTMLDivElement | null;

if (!form || !input || !status || !resultsEl) {
    throw new Error('Search page elements not found');
}

let pagefind: PagefindInstance | null = null;
let loadPromise: Promise<PagefindInstance | null> | null = null;

async function loadPagefind(): Promise<PagefindInstance | null> {
    if (!loadPromise) {
        loadPromise = (async () => {
            try {
                // @ts-ignore — generated at build time
                const pf = await import(/* @vite-ignore */ '/pagefind/pagefind.js') as PagefindInstance;
                await pf.init();
                return pf;
            } catch {
                return null;
            }
        })();
    }
    return loadPromise;
}

function setStatus(msg: string, hide = false): void {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('hidden', hide);
}

function renderResult(data: PagefindResultData, isTagSearch: boolean, tagQuery: string): string {
    const tags: string[] = data.filters?.tag ?? [];
    const category: string = data.meta?.category ?? '';
    const title: string = data.meta?.title ?? 'Untitled';
    const href: string = data.url;

    const tagBadges = tags.slice(0, 4).map((tag) => {
        const active = isTagSearch && tag === tagQuery;
        return `<span class="inline-block text-xs px-2 py-0.5 rounded-full mr-1 mb-1 ${
            active
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }">${tag.toUpperCase()}</span>`;
    }).join('');

    return `
        <a href="${href}" class="block py-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded transition-colors">
            <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${title}</h3>
                    ${category ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wide">${category}</p>` : ''}
                    ${data.excerpt ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1 pagefind-excerpt line-clamp-2">${data.excerpt}</p>` : ''}
                    ${tags.length > 0 ? `<div class="mt-2 flex flex-wrap">${tagBadges}</div>` : ''}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <path d="m9 18 6-6-6-6"/>
                </svg>
            </div>
        </a>
    `;
}

async function runSearch(query: string): Promise<void> {
    query = query.trim();

    if (!query) {
        setStatus('', true);
        resultsEl!.innerHTML = '';
        return;
    }

    if (query.length < 2 && !query.startsWith('tag:')) {
        setStatus('Type at least 2 characters to search.');
        resultsEl!.innerHTML = '';
        return;
    }

    setStatus('Searching…');
    resultsEl!.innerHTML = '';

    if (!pagefind) {
        pagefind = await loadPagefind();
    }

    if (!pagefind) {
        setStatus('Search index not available. Run npm run build to enable search.');
        return;
    }

    const isTagSearch = query.startsWith('tag:');
    const tagQuery = isTagSearch ? query.substring(4).toLowerCase().trim() : '';

    try {
        let searchResult: { results: PagefindResult[] };

        if (isTagSearch) {
            if (!tagQuery) {
                setStatus('Enter a tag after "tag:".');
                return;
            }
            searchResult = await pagefind.search(null, { filters: { tag: tagQuery } });
        } else {
            searchResult = await pagefind.search(query);
        }

        if (searchResult.results.length === 0) {
            setStatus(`No results for "${query}".`);
            return;
        }

        const count = searchResult.results.length;
        setStatus(`${count} result${count === 1 ? '' : 's'} for "${query}"`);

        const limited = searchResult.results.slice(0, 20);
        const data = await Promise.all(limited.map((r) => r.data()));
        resultsEl!.innerHTML = data.map((d) => renderResult(d, isTagSearch, tagQuery)).join('');
    } catch {
        setStatus('Search failed. Please try again.');
    }
}

function updateURL(query: string): void {
    const url = new URL(window.location.href);
    if (query) {
        url.searchParams.set('q', query);
    } else {
        url.searchParams.delete('q');
    }
    history.replaceState({}, '', url.toString());
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input!.value.trim();
    updateURL(q);
    void runSearch(q);
});

let debounceTimer: ReturnType<typeof setTimeout>;
input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const q = input!.value.trim();
        updateURL(q);
        void runSearch(q);
    }, 250);
});

// Auto-search if ?q= is present in URL
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') ?? '';
if (initialQuery) {
    input.value = initialQuery;
    void runSearch(initialQuery);
}

// Prefetch pagefind on idle
const idle = (window as typeof window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
}).requestIdleCallback;
if (typeof idle === 'function') {
    idle(() => { void loadPagefind(); }, { timeout: 2000 });
} else {
    setTimeout(() => { void loadPagefind(); }, 1500);
}
