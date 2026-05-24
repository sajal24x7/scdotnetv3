const moduleHref = new URL('./search-page-island.js', import.meta.url).href;
let loadPromise = null;
let isBootstrapped = false;

async function loadIsland() {
  if (!loadPromise) {
    loadPromise = import(moduleHref).catch((err) => {
      console.error('search-page-island failed to load', err);
      loadPromise = null;
    });
  }
  await loadPromise;
}

function init() {
  void loadIsland();
}

export default function initializeSearchPage() {
  if (typeof document === 'undefined' || isBootstrapped) return;
  isBootstrapped = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
