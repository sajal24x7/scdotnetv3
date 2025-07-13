/**
 * Hover Preview System
 * Inspired by Obsidian's hover preview functionality
 * Shows a preview of linked content when hovering over internal links
 * Shows URL and external link icon for external links
 */

class HoverPreview {
  constructor() {
    this.previewElement = null;
    this.activeLink = null;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.cache = new Map();
    this.isInitialized = false;
    
    // Configuration
    this.config = {
      showDelay: 150,  // Reduced from 300ms
      hideDelay: 100,
      maxContentLength: 400,  // Reduced from 800
      enablePrefetch: false,  // Disabled for better performance
      prefetchDelay: 1000
    };
    
    this.init();
  }
  
  init() {
    if (this.isInitialized) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
    
    this.isInitialized = true;
  }
  
  setupEventListeners() {
    // Create preview element
    this.createPreviewElement();
    
    // Get content containers where hover previews should work
    const contentSelectors = [
      '.prose',
      '.post-content',
      '.content',
      '.entry-content',
      '.article-content',
      'article.prose',
      '.prose-content'
    ];
    
    let contentContainers = [];
    contentSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      contentContainers.push(...elements);
    });
    
    // If no specific content containers found, fall back to document body
    if (contentContainers.length === 0) {
      contentContainers = [document.body];
    }
    
    // Add event listeners to each content container
    contentContainers.forEach(container => {
      container.addEventListener('mouseover', (e) => this.handleMouseOver(e));
      container.addEventListener('mouseout', (e) => this.handleMouseOut(e));
      container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    });
    
    // Handle clicks to close preview
    document.addEventListener('click', (e) => {
      if (!this.previewElement.contains(e.target)) {
        this.hidePreview();
      }
    });
    
    // Handle scroll to hide preview
    window.addEventListener('scroll', () => this.hidePreview());
    
    // Handle resize to hide preview
    window.addEventListener('resize', () => this.hidePreview());
  }
  
  createPreviewElement() {
    this.previewElement = document.createElement('div');
    this.previewElement.className = 'hover-preview';
    this.previewElement.innerHTML = `
      <div class="hover-preview-header">
        <h3 class="hover-preview-title"></h3>
        <p class="hover-preview-meta"></p>
      </div>
      <div class="hover-preview-content"></div>
    `;
    
    // Prevent preview from hiding when hovering over it
    this.previewElement.addEventListener('mouseover', () => {
      this.clearHideTimeout();
    });
    
    this.previewElement.addEventListener('mouseout', () => {
      this.scheduleHide();
    });
    
    document.body.appendChild(this.previewElement);
  }
  
  handleMouseOver(e) {
    const link = e.target.closest('a');
    if (!link || (!this.isInternalLink(link) && !this.isExternalLink(link))) return;
    
    // Check if link is within a content area
    const contentSelectors = [
      '.prose',
      '.post-content',
      '.content',
      '.entry-content',
      '.article-content',
      'article.prose',
      '.prose-content'
    ];
    
    const isInContentArea = contentSelectors.some(selector => {
      const container = link.closest(selector);
      return container !== null;
    });
    
    if (!isInContentArea) return;
    
    this.activeLink = link;
    this.clearHideTimeout();
    
    // Schedule preview show
    this.showTimeout = setTimeout(() => {
      this.showPreview(link);
    }, this.config.showDelay);
  }
  
  handleMouseOut(e) {
    const link = e.target.closest('a');
    if (!link || link !== this.activeLink) return;
    
    this.clearShowTimeout();
    this.scheduleHide();
  }
  
  handleMouseMove(e) {
    if (!this.previewElement || !this.previewElement.classList.contains('visible')) return;
    
    this.positionPreview(this.activeLink);
  }
  
  isInternalLink(link) {
    const href = link.getAttribute('href');
    if (!href) return false;
    
    // Check if it's an internal link (starts with /, __GHOST_URL__, or is relative)
    return href.startsWith('/') || 
           href.includes('__GHOST_URL__') || 
           (!href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel'));
  }
  
  isExternalLink(link) {
    const href = link.getAttribute('href');
    if (!href) return false;
    
    // Check if it's an external link (starts with http/https but not same domain)
    return (href.startsWith('http://') || href.startsWith('https://')) && 
           !href.includes(window.location.hostname);
  }
  
  async showPreview(link) {
    if (!link) return;
    
    // Handle external links differently
    if (this.isExternalLink(link)) {
      this.showExternalPreview(link);
      return;
    }
    
    const href = this.normalizeUrl(link.getAttribute('href'));
    const title = link.textContent.trim() || link.getAttribute('title') || 'Loading...';
    
    // Show loading state immediately
    this.previewElement.className = 'hover-preview internal-link';
    this.previewElement.innerHTML = `
      <div class="hover-preview-header">
        <h3 class="hover-preview-title">${title}</h3>
      </div>
      <div class="hover-preview-content">
        <div class="hover-preview-loading">Loading preview...</div>
      </div>
    `;
    this.previewElement.classList.add('visible');
    this.positionPreview(link);
    
    try {
      const content = await this.fetchContent(href);
      if (content && this.activeLink === link) {
        this.displayContent(content);
      }
    } catch (error) {
      console.warn('Failed to load preview:', error);
      if (this.activeLink === link) {
        this.previewElement.innerHTML = `
          <div class="hover-preview-header">
            <h3 class="hover-preview-title">${title}</h3>
          </div>
          <div class="hover-preview-content">
            <div class="hover-preview-error">Failed to load preview</div>
          </div>
        `;
      }
    }
  }
  
  showExternalPreview(link) {
    const href = link.getAttribute('href');
    
    // Show the full URL for external links
    let displayUrl = href;
    
    // Clean up the URL display slightly
    try {
      const url = new URL(href);
      displayUrl = href;
    } catch (e) {
      // Fallback if URL parsing fails
      displayUrl = href;
    }
    
    // External link icon SVG
    const externalIcon = `
      <svg class="hover-preview-external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15,3 21,3 21,9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    `;
    
    // Create external preview content
    const externalPreviewContent = `
      <div class="hover-preview-external">
        ${externalIcon}
        <div class="hover-preview-external-url">${displayUrl}</div>
      </div>
    `;
    
    // Set up the preview element for external links
    this.previewElement.className = 'hover-preview external-link';
    this.previewElement.innerHTML = externalPreviewContent;
    this.previewElement.classList.add('visible');
    this.positionPreview(link);
  }
  
  normalizeUrl(href) {
    // Handle __GHOST_URL__ placeholders
    if (href.includes('__GHOST_URL__')) {
      href = href.replace('__GHOST_URL__', '');
    }
    
    // Ensure it starts with /
    if (!href.startsWith('/')) {
      href = '/' + href;
    }
    
    return href;
  }
  
  async fetchContent(url) {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const html = await response.text();
      const content = this.parseContent(html, url);
      
      // Cache the result
      this.cache.set(url, content);
      
      return content;
    } catch (error) {
      console.warn('Error fetching content:', error);
      return null;
    }
  }
  
  parseContent(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract title from various sources
    let title = doc.querySelector('h1')?.textContent?.trim() ||
                doc.querySelector('title')?.textContent?.trim() ||
                doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                'Untitled';
    
    // Extract meta information
    const publishDate = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                       doc.querySelector('time')?.getAttribute('datetime') ||
                       doc.querySelector('.date')?.textContent?.trim();
    
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                       doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    
    // Extract main content
    let content = '';
    const contentSelectors = [
      'main',
      'article',
      '.post-content',
      '.content',
      '.entry-content',
      '.post-body',
      '.article-content'
    ];
    
    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = doc.querySelector(selector);
      if (contentElement) break;
    }
    
    if (!contentElement) {
      // Fallback to body but remove header, nav, footer, aside
      contentElement = doc.body;
      if (contentElement) {
        const elementsToRemove = contentElement.querySelectorAll('header, nav, footer, aside, .header, .nav, .footer, .sidebar');
        elementsToRemove.forEach(el => el.remove());
      }
    }
    
    if (contentElement) {
      // Clean up the content
      const clone = contentElement.cloneNode(true);
      
      // Remove unwanted elements
      const unwantedSelectors = [
        'script', 'style', 'noscript', 'iframe', 'video', 'audio',
        '.social-share', '.comments', '.author-bio', '.related-posts',
        '.navigation', '.pagination', '.breadcrumbs', '.tags'
      ];
      
      unwantedSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      });
      
      // Get text content and truncate if needed
      const textContent = clone.textContent.trim();
      if (textContent.length > this.config.maxContentLength) {
        content = textContent.substring(0, this.config.maxContentLength) + '...';
      } else {
        content = textContent;
      }
      
      // Try to preserve some HTML structure for better formatting
      const htmlContent = clone.innerHTML;
      if (htmlContent.length < this.config.maxContentLength * 1.5) {
        content = htmlContent;
      }
    }
    
    return {
      title,
      content: content || 'No content available'
    };
  }
  
  displayContent(contentData) {
    // Ensure we have the correct structure for internal links
    this.previewElement.className = 'hover-preview internal-link';
    
    // Clean preview without metadata
    this.previewElement.innerHTML = `
      <div class="hover-preview-header">
        <h3 class="hover-preview-title">${contentData.title || 'Untitled'}</h3>
      </div>
      <div class="hover-preview-content">${contentData.content || 'No preview available'}</div>
    `;
  }
  
  positionPreview(link) {
    if (!this.previewElement || !this.activeLink) return;
    
    const linkRect = this.activeLink.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Set initial position to calculate dimensions
    this.previewElement.style.left = '0px';
    this.previewElement.style.top = '0px';
    this.previewElement.style.visibility = 'hidden';
    this.previewElement.style.opacity = '1';
    
    // Force layout to get accurate dimensions
    const previewRect = this.previewElement.getBoundingClientRect();
    
    // Calculate position (show above the link like a tooltip)
    let left = linkRect.left + linkRect.width / 2 - previewRect.width / 2;
    let top = linkRect.top - previewRect.height - 10;
    
    // Adjust if preview goes off screen horizontally
    if (left < 10) left = 10;
    if (left + previewRect.width > viewportWidth - 10) {
      left = viewportWidth - previewRect.width - 10;
    }
    
    // If preview goes above viewport, show it below the link
    if (top < 10) {
      top = linkRect.bottom + 10;
    }
    
    // Final positioning
    this.previewElement.style.left = left + 'px';
    this.previewElement.style.top = top + 'px';
    this.previewElement.style.visibility = 'visible';
    this.previewElement.style.opacity = '0'; // Reset for transition
  }
  
  hidePreview() {
    if (this.previewElement) {
      this.previewElement.classList.remove('visible');
      // Reset to default preview class
      this.previewElement.className = 'hover-preview';
    }
    this.activeLink = null;
    this.clearTimeouts();
  }
  
  scheduleHide() {
    this.hideTimeout = setTimeout(() => {
      this.hidePreview();
    }, this.config.hideDelay);
  }
  
  clearShowTimeout() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }
  
  clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
  
  clearTimeouts() {
    this.clearShowTimeout();
    this.clearHideTimeout();
  }
}

// Initialize the hover preview system
window.addEventListener('load', () => {
  new HoverPreview();
});

// Export for potential external use
window.HoverPreview = HoverPreview;