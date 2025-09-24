const moduleHref = new URL('./search-modal-island.ts', import.meta.url).href;

type SearchModalElement = HTMLElement & {
    open?: () => void;
    close?: () => void;
};

let loadPromise: Promise<unknown> | null = null;
let moduleLoaded = false;
let triggerSelector = '';
let modalElement: SearchModalElement | null = null;
let shortcutListenerAttached = false;
let observer: MutationObserver | null = null;
const processedTriggers = new WeakSet<HTMLElement>();

function cleanupAfterLoad(): void {
    if (shortcutListenerAttached) {
        document.removeEventListener('keydown', handleShortcut, true);
        shortcutListenerAttached = false;
    }

    if (!triggerSelector) {
        return;
    }

    const triggers = document.querySelectorAll<HTMLElement>(triggerSelector);
    triggers.forEach((trigger) => {
        trigger.removeEventListener('click', handleTriggerClick, true);
        trigger.removeEventListener('pointerenter', prefetch);
        trigger.removeEventListener('focus', prefetch);
    });

    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

async function loadModalModule(): Promise<void> {
    if (!loadPromise) {
        loadPromise = import(moduleHref)
            .then(() => {
                moduleLoaded = true;
                cleanupAfterLoad();
            })
            .catch((error) => {
                console.error('Search modal module failed to load', error);
                moduleLoaded = false;
                loadPromise = null;
                throw error;
            });
    }

    await loadPromise;
}

async function openModal(): Promise<void> {
    try {
        await loadModalModule();

        if (!modalElement) {
            modalElement = document.querySelector<SearchModalElement>('search-modal');
        }

        const modal = modalElement;
        if (modal && typeof modal.open === 'function') {
            modal.open();
        }
    } catch (error) {
        console.error('Unable to open search modal', error);
    }
}

function handleTriggerClick(event: Event): void {
    if (moduleLoaded) {
        const target = event.currentTarget as HTMLElement | null;
        if (target) {
            target.removeEventListener('click', handleTriggerClick, true);
        }
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    void openModal();
}

function handleShortcut(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (moduleLoaded) {
            document.removeEventListener('keydown', handleShortcut, true);
            shortcutListenerAttached = false;
            return;
        }

        event.preventDefault();
        void openModal();
    }
}

function prefetch(): void {
    if (!moduleLoaded) {
        void loadModalModule();
    }
}

function scheduleIdleLoad(): void {
    const idle = (window as typeof window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => void;
    }).requestIdleCallback;

    if (typeof idle === 'function') {
        idle(() => {
            prefetch();
        }, { timeout: 2000 });
        return;
    }

    window.setTimeout(() => {
        prefetch();
    }, 1500);
}

function observeTriggers(modalId: string): void {
    triggerSelector = `[data-search-modal="${modalId}"]`;
    const triggers = document.querySelectorAll<HTMLElement>(triggerSelector);

    triggers.forEach((trigger) => {
        if (processedTriggers.has(trigger)) {
            return;
        }

        processedTriggers.add(trigger);
        trigger.addEventListener('pointerenter', prefetch, { once: true });
        trigger.addEventListener('focus', prefetch, { once: true });
        trigger.addEventListener('click', handleTriggerClick, true);
    });
}

function init(): void {
    modalElement = document.querySelector<SearchModalElement>('search-modal');
    if (!modalElement) {
        return;
    }

    const modalId = modalElement.dataset.modalId || 'global-search';

    observeTriggers(modalId);
    document.addEventListener('keydown', handleShortcut, true);
    shortcutListenerAttached = true;
    scheduleIdleLoad();

    observer = new MutationObserver(() => {
        if (!moduleLoaded) {
            observeTriggers(modalId);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
