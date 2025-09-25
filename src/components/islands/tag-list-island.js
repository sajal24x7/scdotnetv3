class TagListElement extends HTMLElement {
    handleClick = (event) => {
        const target = event.target;
        if (!target) {
            return;
        }

        const action = target.dataset.action || target.closest('[data-action]')?.getAttribute('data-action');
        if (!action) {
            return;
        }

        const actionElement = target.closest('[data-action]');
        if (!actionElement) {
            return;
        }

        const hiddenId = actionElement.dataset.hiddenId;
        if (!hiddenId) {
            return;
        }

        if (action === 'show-more') {
            event.preventDefault();
            this.showHiddenTags(hiddenId, actionElement);
        }

        if (action === 'show-less') {
            event.preventDefault();
            this.hideHiddenTags(hiddenId);
        }
    };

    connectedCallback() {
        this.addEventListener('click', this.handleClick);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.handleClick);
    }

    showHiddenTags(hiddenId, trigger) {
        const hiddenContainer = this.querySelector(`#${CSS.escape(hiddenId)}`);
        if (!hiddenContainer) {
            return;
        }

        hiddenContainer.hidden = false;
        trigger.hidden = true;
        trigger.style.display = 'none';
        trigger.setAttribute('aria-hidden', 'true');

        const focusable = hiddenContainer.querySelector('[data-action="show-less"]');
        if (focusable) {
            focusable.focus();
        }
    }

    hideHiddenTags(hiddenId) {
        const hiddenContainer = this.querySelector(`#${CSS.escape(hiddenId)}`);
        if (!hiddenContainer) {
            return;
        }

        hiddenContainer.hidden = true;

        const showMoreButton = this.querySelector(`[data-action="show-more"][data-hidden-id="${CSS.escape(hiddenId)}"]`);
        if (showMoreButton) {
            showMoreButton.hidden = false;
            showMoreButton.style.removeProperty('display');
            showMoreButton.removeAttribute('aria-hidden');
            showMoreButton.focus();
        }
    }
}

if (!customElements.get('tag-list')) {
    customElements.define('tag-list', TagListElement);
}

export {};
