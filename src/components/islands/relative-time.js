/**
 * RelativeTime Web Component
 * Displays timestamps in relative format (e.g., "2 days ago") with auto-updates
 * Usage: <relative-time datetime="2025-12-20T10:00:00.000Z"></relative-time>
 */

class RelativeTime extends HTMLElement {
  static observedAttributes = ['datetime'];

  constructor() {
    super();
    this._intervalId = null;
    this._updateInterval = 60000; // Update every minute
  }

  connectedCallback() {
    this.render();
    this.startAutoUpdate();
  }

  disconnectedCallback() {
    this.stopAutoUpdate();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'datetime' && oldValue !== newValue) {
      this.render();
    }
  }

  startAutoUpdate() {
    this.stopAutoUpdate();
    this._intervalId = setInterval(() => {
      this.render();
    }, this._updateInterval);
  }

  stopAutoUpdate() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
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

  render() {
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

      // Capitalize first letter
      const displayTime = relativeTime.charAt(0).toUpperCase() + relativeTime.slice(1);

      this.textContent = displayTime;
    } catch (error) {
      console.error('Error rendering relative time:', error);
      this.textContent = 'Invalid date';
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('relative-time')) {
  customElements.define('relative-time', RelativeTime);
}

export default RelativeTime;
