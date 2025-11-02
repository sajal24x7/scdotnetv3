var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
        Unable to load search index. Please try again later.
    </div>
`;
function highlightTag(tag, query, isTagSearch) {
  const normalizedQuery = query.toLowerCase();
  const isHighlighted = isTagSearch || tag.toLowerCase().includes(normalizedQuery);
  const classes = ["tag-chip", "tag-chip-inline"];
  if (isHighlighted) {
    classes.push("tag-chip-active");
  }
  return `<span class="${classes.join(" ")}">${tag.toUpperCase()}</span>`;
}
class SearchModalElement extends HTMLElement {
  constructor() {
    super(...arguments);
    __publicField(this, "modalId", "global-search");
    __publicField(this, "triggers", []);
    __publicField(this, "posts", []);
    __publicField(this, "previouslyFocused", null);
    __publicField(this, "isOpen", false);
    __publicField(this, "closeButton", null);
    __publicField(this, "inputElement", null);
    __publicField(this, "resultsContainer", null);
    __publicField(this, "indexUrl", "/search-index.json");
    __publicField(this, "loadingPromise", null);
    __publicField(this, "isIndexLoaded", false);
    __publicField(this, "handleTriggerClick", (event) => {
      event.preventDefault();
      this.openModal();
    });
    __publicField(this, "handleCloseClick", (event) => {
      event.preventDefault();
      this.closeModal();
    });
    __publicField(this, "handleInput", () => {
      if (!this.inputElement) {
        return;
      }
      void this.performSearch(this.inputElement.value);
    });
    __publicField(this, "handleInputKeydown", (event) => {
      if (event.key !== "Enter" || !this.resultsContainer) {
        return;
      }
      const firstResult = this.resultsContainer.querySelector("a");
      if (firstResult) {
        event.preventDefault();
        window.location.href = firstResult.href;
      }
    });
    __publicField(this, "handleBackdropClick", (event) => {
      const target = event.target;
      if (target === this || target?.dataset.searchOverlay === "true") {
        this.closeModal();
      }
    });
    __publicField(this, "handleGlobalKeydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        this.openModal();
        return;
      }
      if (event.key === "Escape" && this.isOpen) {
        event.preventDefault();
        this.closeModal();
      }
    });
  }
  connectedCallback() {
    this.modalId = this.dataset.modalId || this.modalId;
    this.closeButton = this.querySelector("[data-search-close]");
    this.inputElement = this.querySelector("[data-search-input]");
    this.resultsContainer = this.querySelector("[data-search-results]");
    this.indexUrl = this.dataset.searchIndexUrl || this.indexUrl;
    this.renderDefaultState();
    this.attachTriggerListeners();
    this.closeButton?.addEventListener("click", this.handleCloseClick);
    this.inputElement?.addEventListener("input", this.handleInput);
    this.inputElement?.addEventListener("keydown", this.handleInputKeydown);
    this.addEventListener("click", this.handleBackdropClick);
    window.addEventListener("keydown", this.handleGlobalKeydown);
  }
  disconnectedCallback() {
    this.detachTriggerListeners();
    this.closeButton?.removeEventListener("click", this.handleCloseClick);
    this.inputElement?.removeEventListener("input", this.handleInput);
    this.inputElement?.removeEventListener("keydown", this.handleInputKeydown);
    this.removeEventListener("click", this.handleBackdropClick);
    window.removeEventListener("keydown", this.handleGlobalKeydown);
  }
  attachTriggerListeners() {
    this.triggers = Array.from(document.querySelectorAll(`[data-search-modal="${this.modalId}"]`));
    this.triggers.forEach((trigger) => {
      if (trigger.dataset.searchModalBound === "true") {
        return;
      }
      trigger.addEventListener("click", this.handleTriggerClick);
      trigger.dataset.searchModalBound = "true";
    });
  }
  detachTriggerListeners() {
    this.triggers.forEach((trigger) => {
      trigger.removeEventListener("click", this.handleTriggerClick);
      delete trigger.dataset.searchModalBound;
    });
    this.triggers = [];
  }
  open() {
    this.openModal();
  }
  close() {
    this.closeModal();
  }
  openModal() {
    if (this.isOpen) {
      return;
    }
    this.previouslyFocused = document.activeElement;
    this.classList.remove("hidden");
    this.classList.add("flex");
    document.body.style.overflow = "hidden";
    this.setAttribute("aria-hidden", "false");
    this.isOpen = true;
    void this.ensureIndexLoaded();
    window.setTimeout(() => {
      this.inputElement?.focus();
    }, 100);
  }
  closeModal() {
    if (!this.isOpen) {
      return;
    }
    this.classList.add("hidden");
    this.classList.remove("flex");
    document.body.style.overflow = "";
    this.setAttribute("aria-hidden", "true");
    this.isOpen = false;
    if (this.inputElement) {
      this.inputElement.value = "";
    }
    this.renderDefaultState();
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }
  renderDefaultState() {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = DEFAULT_STATE_TEMPLATE;
    }
  }
  renderMinCharsState() {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = MIN_CHARS_TEMPLATE;
    }
  }
  renderLoadingState() {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = LOADING_TEMPLATE;
    }
  }
  renderErrorState() {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = ERROR_TEMPLATE;
    }
  }
  renderNoResultsState(query) {
    if (!this.resultsContainer) {
      return;
    }
    this.resultsContainer.innerHTML = `
            <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <div class="mb-2">No results found for "<strong>${query}</strong>"</div>
                <div class="text-small space-y-1">
                    <div>\u{1F4A1} Try searching for "AI", "productivity", or "coding"</div>
                    <div>\u{1F3F7}\uFE0F Use "tag:ai" for exact tag matches</div>
                </div>
            </div>
        `;
  }
  async ensureIndexLoaded() {
    if (this.isIndexLoaded) {
      return;
    }
    if (!this.loadingPromise) {
      this.loadingPromise = this.loadIndex();
    }
    const posts = await this.loadingPromise;
    if (Array.isArray(posts)) {
      this.posts = posts;
      this.isIndexLoaded = true;
    }
  }
  async loadIndex() {
    try {
      const response = await fetch(this.indexUrl, {
        headers: {
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map((entry) => ({
        slug: entry.slug,
        data: {
          title: entry.data?.title,
          description: entry.data?.description,
          category: entry.data?.category,
          tags: entry.data?.tags ?? []
        }
      }));
    } catch (error) {
      console.error("Search index fetch failed", error);
      return null;
    } finally {
      this.loadingPromise = null;
    }
  }
  async performSearch(rawQuery) {
    if (!this.resultsContainer) {
      return;
    }
    const query = rawQuery.toLowerCase().trim();
    if (query.length === 0) {
      this.renderDefaultState();
      return;
    }
    if (query.length < 2 && !query.startsWith("tag:")) {
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
    const isTagSearch = query.startsWith("tag:");
    const tagQuery = isTagSearch ? query.substring(4) : "";
    let results = [];
    if (isTagSearch) {
      results = this.posts.filter((post) => {
        const tags = post.data.tags || [];
        return tags.some((tag) => tag.toLowerCase() === tagQuery);
      });
    } else {
      results = this.computeRankedResults(query);
    }
    if (results.length === 0) {
      this.renderNoResultsState(query);
      return;
    }
    const limitedResults = results.slice(0, 10);
    this.resultsContainer.innerHTML = limitedResults.map((post) => this.renderResultItem(post, query, isTagSearch)).join("");
  }
  computeRankedResults(query) {
    const results = [];
    this.posts.forEach((post) => {
      const title = (post.data.title || "").toLowerCase();
      const category = (post.data.category || "").toLowerCase();
      const description = (post.data.description || "").toLowerCase();
      const tags = (post.data.tags || []).map((tag) => tag.toLowerCase());
      let relevanceScore = 0;
      let hasMatch = false;
      if (tags.some((tag) => tag.includes(query))) {
        relevanceScore += 100;
        hasMatch = true;
      }
      if (title.includes(query)) {
        relevanceScore += 50;
        hasMatch = true;
      }
      if (category.includes(query)) {
        relevanceScore += 25;
        hasMatch = true;
      }
      if (description.includes(query)) {
        relevanceScore += 10;
        hasMatch = true;
      }
      if (hasMatch) {
        results.push({ ...post, relevanceScore });
      }
    });
    return results.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }
  renderResultItem(post, query, isTagSearch) {
    const tags = post.data.tags || [];
    const tagBadges = tags.slice(0, 3).map((tag) => highlightTag(tag, query, isTagSearch)).join("");
    const relevanceScore = post.relevanceScore ?? 0;
    const relevanceIndicator = relevanceScore >= 100 ? "\u{1F3F7}\uFE0F" : relevanceScore >= 50 ? "\u{1F4DD}" : relevanceScore >= 25 ? "\u{1F4C1}" : "\u{1F4AC}";
    const title = post.data.title || "Untitled";
    const category = post.data.category || "";
    const description = post.data.description || "";
    const href = category ? `/${category}/${post.slug}/` : `/${post.slug}/`;
    return `
            <a href="${href}" class="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0 transition-colors group">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-small">${relevanceIndicator}</span>
                            <h3 class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${title}</h3>
                        </div>
                        <p class="text-small text-gray-600 dark:text-gray-400 mb-2 capitalize">${category}</p>
                        ${description ? `<p class="text-small text-gray-500 dark:text-gray-500 mb-2 line-clamp-2">${description}</p>` : ""}
                        ${tags.length > 0 ? `<div class="flex flex-wrap">${tagBadges}</div>` : ""}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </div>
            </a>
        `;
  }
}
if (!customElements.get("search-modal")) {
  customElements.define("search-modal", SearchModalElement);
}
