/**
 * Defines the `<relative-time>` custom element used across the site (stream,
 * garden cards, and the homepage unified feed) to render timestamps as a
 * live "x minutes ago" label that refreshes in the browser every minute.
 *
 * Import this module from any island that renders `<relative-time>` markup;
 * Astro dedupes the bundle and the `customElements.get` guard makes repeat
 * definitions a no-op.
 */
class RelativeTime extends HTMLElement {
    static observedAttributes = ['datetime'];

    private _intervalId: ReturnType<typeof setInterval> | null = null;
    private readonly _updateInterval = 60000; // Update every minute

    connectedCallback(): void {
        this.render();
        this.startAutoUpdate();
    }

    disconnectedCallback(): void {
        this.stopAutoUpdate();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        if (name === 'datetime' && oldValue !== newValue) {
            this.render();
        }
    }

    startAutoUpdate(): void {
        this.stopAutoUpdate();
        this._intervalId = setInterval(() => {
            this.render();
        }, this._updateInterval);
    }

    stopAutoUpdate(): void {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }

    getRelativeTime(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffSeconds < 60) {
            return diffSeconds <= 1 ? 'Just now' : `${diffSeconds} seconds ago`;
        } else if (diffMinutes < 60) {
            return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays < 30) {
            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        } else if (diffMonths < 12) {
            return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
        } else {
            return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
        }
    }

    render(): void {
        const datetime = this.getAttribute('datetime');
        if (!datetime) {
            this.textContent = '';
            return;
        }

        try {
            const date = new Date(datetime);
            if (isNaN(date.getTime())) {
                this.textContent = 'Invalid date';
                return;
            }

            const relativeTime = this.getRelativeTime(date);
            this.textContent = relativeTime.charAt(0).toUpperCase() + relativeTime.slice(1);
        } catch (error) {
            console.error('Error rendering relative time:', error);
            this.textContent = 'Invalid date';
        }
    }
}

if (!customElements.get('relative-time')) {
    customElements.define('relative-time', RelativeTime);
}
