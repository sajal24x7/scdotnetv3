const moduleHref = new URL("./search-modal-island.js", import.meta.url).href;
let loadPromise = null;
let moduleLoaded = false;
let triggerSelector = "";
let modalElement = null;
let shortcutListenerAttached = false;
let observer = null;
const processedTriggers = /* @__PURE__ */ new WeakSet();
let isBootstrapped = false;
function cleanupAfterLoad() {
  if (shortcutListenerAttached) {
    document.removeEventListener("keydown", handleShortcut, true);
    shortcutListenerAttached = false;
  }
  if (!triggerSelector) {
    return;
  }
  const triggers = document.querySelectorAll(triggerSelector);
  triggers.forEach((trigger) => {
    trigger.removeEventListener("click", handleTriggerClick, true);
    trigger.removeEventListener("pointerenter", prefetch);
    trigger.removeEventListener("focus", prefetch);
  });
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
async function loadModalModule() {
  if (!loadPromise) {
    loadPromise = import(moduleHref).then(() => {
      moduleLoaded = true;
      cleanupAfterLoad();
    }).catch((error) => {
      console.error("Search modal module failed to load", error);
      moduleLoaded = false;
      loadPromise = null;
      throw error;
    });
  }
  await loadPromise;
}
async function openModal() {
  try {
    await loadModalModule();
    if (!modalElement) {
      modalElement = document.querySelector("search-modal");
    }
    const modal = modalElement;
    if (modal && typeof modal.open === "function") {
      modal.open();
    }
  } catch (error) {
    console.error("Unable to open search modal", error);
  }
}
function handleTriggerClick(event) {
  if (moduleLoaded) {
    const target = event.currentTarget;
    if (target) {
      target.removeEventListener("click", handleTriggerClick, true);
    }
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  void openModal();
}
function handleShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    if (moduleLoaded) {
      document.removeEventListener("keydown", handleShortcut, true);
      shortcutListenerAttached = false;
      return;
    }
    event.preventDefault();
    void openModal();
  }
}
function prefetch() {
  if (!moduleLoaded) {
    void loadModalModule();
  }
}
function scheduleIdleLoad() {
  const idle = window.requestIdleCallback;
  if (typeof idle === "function") {
    idle(() => {
      prefetch();
    }, { timeout: 2e3 });
    return;
  }
  window.setTimeout(() => {
    prefetch();
  }, 1500);
}
function observeTriggers(modalId) {
  triggerSelector = `[data-search-modal="${modalId}"]`;
  const triggers = document.querySelectorAll(triggerSelector);
  triggers.forEach((trigger) => {
    if (processedTriggers.has(trigger)) {
      return;
    }
    processedTriggers.add(trigger);
    trigger.addEventListener("pointerenter", prefetch, { once: true });
    trigger.addEventListener("focus", prefetch, { once: true });
    trigger.addEventListener("click", handleTriggerClick, true);
  });
}
function init() {
  modalElement = document.querySelector("search-modal");
  if (!modalElement) {
    return;
  }
  const modalId = modalElement.dataset.modalId || "global-search";
  observeTriggers(modalId);
  document.addEventListener("keydown", handleShortcut, true);
  shortcutListenerAttached = true;
  scheduleIdleLoad();
  observer = new MutationObserver(() => {
    if (!moduleLoaded) {
      observeTriggers(modalId);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
function initializeSearchModalLoader() {
  if (typeof document === "undefined" || isBootstrapped) {
    return;
  }
  isBootstrapped = true;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
    return;
  }
  init();
}
export {
  initializeSearchModalLoader as default
};
