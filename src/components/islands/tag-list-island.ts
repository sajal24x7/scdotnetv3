class TagListElement extends HTMLElement {
    private handleClick = (event: Event) => {
        const target = event.target as HTMLElement | null;
        if (!target) {
            return;
        }

        const action = target.dataset.action || target.closest('[data-action]')?.getAttribute('data-action');
        if (!action) {
            return;
        }

        const actionElement = target.closest<HTMLElement>('[data-action]');
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

    private showHiddenTags(hiddenId: string, trigger: HTMLElement) {
        const hiddenContainer = this.querySelector<HTMLElement>(`#${CSS.escape(hiddenId)}`);
        if (!hiddenContainer) {
            return;
        }

        hiddenContainer.hidden = false;
        trigger.classList.add('hidden');
        trigger.setAttribute('aria-expanded', 'true');

        const focusable = hiddenContainer.querySelector<HTMLElement>('[data-action="show-less"]');
        if (focusable) {
            focusable.focus();
        }
    }

    private hideHiddenTags(hiddenId: string) {
        const hiddenContainer = this.querySelector<HTMLElement>(`#${CSS.escape(hiddenId)}`);
        if (!hiddenContainer) {
            return;
        }

        hiddenContainer.hidden = true;

        const showMoreButton = this.querySelector<HTMLElement>(`[data-action="show-more"][data-hidden-id="${CSS.escape(hiddenId)}"]`);
        if (showMoreButton) {
            showMoreButton.classList.remove('hidden');
            showMoreButton.setAttribute('aria-expanded', 'false');
            showMoreButton.focus();
        }
    }
}

if (!customElements.get('tag-list')) {
    customElements.define('tag-list', TagListElement);
}
