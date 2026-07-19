/**
 * Rate Limiter Utility for POSSE Syndication
 *
 * Implements rate limiting to prevent hitting API limits on social platforms.
 */

/**
 * Thrown instead of sleeping when a rate-limit wait would run past the
 * caller's deadline (see RateLimiter#setDeadline) — e.g. an hourly Meta API
 * cap can demand a ~1 hour wait, far longer than a CI job's own timeout.
 * Callers treat this like any other fetch failure: skip the platform for
 * this post/run and let a later run pick it up once the window has reset.
 */
export class RateLimitBudgetExceededError extends Error {}

export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
    this.deadline = null;
  }

  /** Stop waiting out rate limits past this timestamp (ms epoch); throw instead. */
  setDeadline(deadline) {
    this.deadline = deadline;
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
        if (this.deadline && now + waitTime > this.deadline) {
          throw new RateLimitBudgetExceededError(
            `Rate limit wait of ${Math.ceil(waitTime / 1000)}s would exceed the run's time budget`
          );
        }
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