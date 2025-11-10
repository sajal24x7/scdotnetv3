import { render, cancel } from 'timeago.js';

const RELATIVE_TIME_SELECTOR = 'time[data-relative-time]';
const REAPPLY_EVENTS = ['astro:after-swap'];

declare global {
    interface Window {
        __relativeTimeIslandLoaded?: boolean;
    }
}

function queryRelativeTimeElements(): HTMLTimeElement[] {
    return Array.from(document.querySelectorAll<HTMLTimeElement>(RELATIVE_TIME_SELECTOR));
}

function applyRelativeTimes() {
    const elements = queryRelativeTimeElements();
    if (elements.length === 0) {
        return;
    }

    elements.forEach((element) => {
        cancel(element);
    });

    render(elements, undefined, { minInterval: 30 });
}

function setupMutationObserver(): MutationObserver | undefined {
    if (typeof MutationObserver === 'undefined') {
        return undefined;
    }

    const observer = new MutationObserver(() => {
        applyRelativeTimes();
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener(
            'DOMContentLoaded',
            () => {
                if (document.body) {
                    observer.observe(document.body, { childList: true, subtree: true });
                }
            },
            { once: true }
        );
    }

    return observer;
}

function init() {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.__relativeTimeIslandLoaded) {
        return;
    }

    window.__relativeTimeIslandLoaded = true;

    const run = () => {
        applyRelativeTimes();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }

    const observer = setupMutationObserver();

    REAPPLY_EVENTS.forEach((eventName) => {
        document.addEventListener(eventName, run);
    });

    window.addEventListener('beforeunload', () => {
        if (observer) {
            observer.disconnect();
        }

        queryRelativeTimeElements().forEach((element) => {
            cancel(element);
        });
    });
}

init();

export {};
