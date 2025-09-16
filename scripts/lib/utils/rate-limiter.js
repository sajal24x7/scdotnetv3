/**
 * Rate Limiter Utility for POSSE Syndication
 *
 * Implements rate limiting to prevent hitting API limits on social platforms.
 */

export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if we can make a request, and wait if necessary
   */
  async checkLimit() {
    const now = Date.now();

    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // If we're at the limit, wait until we can make a request
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest) + 1000; // Add 1 second buffer

      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkLimit(); // Recursive call to check again
      }
    }

    // Record this request
    this.requests.push(now);
  }

  /**
   * Get current rate limit status
   */
  getStatus() {
    const now = Date.now();
    const recentRequests = this.requests.filter(time => now - time < this.windowMs);

    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      remainingRequests: this.maxRequests - recentRequests.length,
      windowResetsIn: recentRequests.length > 0 ?
        Math.max(0, this.windowMs - (now - Math.min(...recentRequests))) : 0
    };
  }

  /**
   * Reset the rate limiter (useful for testing)
   */
  reset() {
    this.requests = [];
  }
}