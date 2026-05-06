var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const SITE_DOMAIN = "sajalchoudhary.net";
const DEFAULT_STATE_TEMPLATE = `
    <div class="p-8 text-center text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p>Start typing to search via DuckDuckGo...</p>
    </div>
`;
const MIN_CHARS_TEMPLATE = `
    <div class="p-4 text-center text-gray-500 dark:text-gray-400">
        Type at least 2 characters to search...
    </div>
`;
function buildDuckDuckGoUrl(query, siteOnly) {
  const q = siteOnly ? `site:${SITE_DOMAIN} ${query}` : query;
  return `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
}
function renderSearchOptions(query) {
  const siteUrl = buildDuckDuckGoUrl(query, true);
  return `
        <a href="${siteUrl}" target="_blank" rel="noopener noreferrer"
           class="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500 flex-shrink-0">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Search this site for "<span class="italic">${query}</span>"
                </div>
                <div class="text-small text-gray-500 dark:text-gray-400">via DuckDuckGo &mdash; ${SITE_DOMAIN}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
        </a>
    `;
}
class SearchModalElement extends HTMLElement {
  constructor() {
    super(...arguments);
    __publicField(this, "modalId", "global-search");
    __publicField(this, "triggers", []);
    __publicField(this, "previouslyFocused", null);
    __publicField(this, "isOpen", false);
    __publicField(this, "closeButton", null);
    __publicField(this, "inputElement", null);
    __publicField(this, "resultsContainer", null);
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
      this.performSearch(this.inputElement.value);
    });
    __publicField(this, "handleInputKeydown", (event) => {
      if (event.key !== "Enter" || !this.inputElement) {
        return;
      }
      const query = this.inputElement.value.trim();
      if (query.length >= 2) {
        event.preventDefault();
        window.open(buildDuckDuckGoUrl(query, true), "_blank", "noopener,noreferrer");
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
  performSearch(rawQuery) {
    if (!this.resultsContainer) {
      return;
    }
    const query = rawQuery.trim();
    if (query.length === 0) {
      this.renderDefaultState();
      return;
    }
    if (query.length < 2) {
      this.renderMinCharsState();
      return;
    }
    this.resultsContainer.innerHTML = renderSearchOptions(query);
  }
}
if (!customElements.get("search-modal")) {
  customElements.define("search-modal", SearchModalElement);
}
