const registeredButtons = new WeakSet();
let listenersInitialized = false;

async function shareLink(button) {
    const shareTitle = button.dataset.shareTitle || document.title;
    const shareUrl = button.dataset.shareUrl || window.location.href;
    const fallbackMessage = button.dataset.copiedMessage || 'Link copied to clipboard!';

    if (navigator.share) {
        try {
            await navigator.share({
                title: shareTitle,
                url: shareUrl
            });
            return;
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }

    if (navigator.clipboard && shareUrl) {
        try {
            await navigator.clipboard.writeText(shareUrl);
            if (fallbackMessage) {
                alert(fallbackMessage);
            }
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    } else {
        console.warn('Share and clipboard APIs are unavailable in this browser.');
    }
}

function bindShareButton(button) {
    if (!(button instanceof HTMLButtonElement)) {
        return;
    }

    if (registeredButtons.has(button)) {
        return;
    }

    registeredButtons.add(button);

    button.addEventListener('click', () => {
        void shareLink(button);
    });
}

function scanForShareButtons(root = document) {
    const buttons = root.querySelectorAll('button[data-share-button]');
    buttons.forEach(bindShareButton);
}

function ensureGlobalListeners() {
    if (listenersInitialized) {
        return;
    }

    listenersInitialized = true;

    document.addEventListener('astro:after-swap', () => {
        scanForShareButtons();
    });

    if ('MutationObserver' in window) {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof Element)) {
                        return;
                    }

                    if (node.matches('button[data-share-button]')) {
                        bindShareButton(node);
                    }

                    node.querySelectorAll('button[data-share-button]').forEach(bindShareButton);
                });
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
}

function initShareButtons() {
    ensureGlobalListeners();
    scanForShareButtons();
}

initShareButtons();
