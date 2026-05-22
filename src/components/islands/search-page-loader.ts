const moduleHref = new URL('./search-page-island.js', import.meta.url).href;

let loadPromise: Promise<unknown> | null = null;

async function loadIsland(): Promise<void> {
    if (!loadPromise) {
        loadPromise = import(moduleHref).catch((err) => {
            console.error('search-page-island failed to load', err);
            loadPromise = null;
        });
    }
    await loadPromise;
}

export default function initializeSearchPage(): void {
    if (typeof document === 'undefined') return;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => void loadIsland(), { once: true });
    } else {
        void loadIsland();
    }
}
