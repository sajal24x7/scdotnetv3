/**
 * Error Handler Utility for POSSE Syndication
 *
 * Provides consistent error handling and logging across the syndication system.
 */

/**
 * Custom error classes for different types of syndication errors
 */
export class SyndicationError extends Error {
  constructor(message, platform = null, originalError = null) {
    super(message);
    this.name = 'SyndicationError';
    this.platform = platform;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export class RateLimitError extends SyndicationError {
  constructor(platform, resetTime = null) {
    super(`Rate limit exceeded for ${platform}`, platform);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
  }
}

export class AuthenticationError extends SyndicationError {
  constructor(platform, message = 'Authentication failed') {
    super(`${message} for ${platform}`, platform);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends SyndicationError {
  constructor(platform, originalError) {
    super(`Network error for ${platform}: ${originalError.message}`, platform, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Determine the type of error and create appropriate error instance
 */
export function classifyError(error, platform) {
  // Network/connection errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new NetworkError(platform, error);
  }

  // Rate limit errors
  if (error.message.includes('rate limit') ||
      error.message.includes('429') ||
      error.message.includes('Too Many Requests')) {
    return new RateLimitError(platform);
  }

  // Authentication errors
  if (error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('authentication') ||
      error.message.includes('token')) {
    return new AuthenticationError(platform, error.message);
  }

  // Generic syndication error
  return new SyndicationError(error.message, platform, error);
}

/**
 * Log errors with appropriate formatting
 */
export function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';

  if (error instanceof SyndicationError) {
    console.error(`${timestamp}${contextStr} ${error.name} (${error.platform}): ${error.message}`);

    if (error instanceof RateLimitError && error.resetTime) {
      console.error(`  Rate limit resets at: ${error.resetTime}`);
    }

    if (error.originalError) {
      console.error(`  Original error: ${error.originalError.message}`);
    }
  } else {
    console.error(`${timestamp}${contextStr} Error: ${error.message}`);
  }

  // In development, also log stack trace
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000, platform = 'unknown') {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = classifyError(error, platform);

      // Don't retry authentication errors
      if (lastError instanceof AuthenticationError) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        logError(lastError, `Final attempt (${attempt}/${maxRetries})`);
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logError(lastError, `Attempt ${attempt}/${maxRetries}, retrying in ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe async function wrapper that handles errors gracefully
 */
export async function safeAsync(fn, fallback = null, context = '') {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}

/**
 * Validate environment variables for a platform
 */
export function validatePlatformConfig(platform) {
  const requiredVars = {
    mastodon: ['MASTODON_ACCESS_TOKEN', 'MASTODON_INSTANCE'],
    bluesky: ['BLUESKY_HANDLE', 'BLUESKY_APP_PASSWORD'],
    threads: ['THREADS_ACCESS_TOKEN', 'THREADS_USER_ID']
  };

  const required = requiredVars[platform];
  if (!required) {
    throw new SyndicationError(`Unknown platform: ${platform}`);
  }

  const missing = required.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new AuthenticationError(
      platform,
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Create a standardized error report
 */
export function createErrorReport(errors) {
  const report = {
    timestamp: new Date().toISOString(),
    totalErrors: errors.length,
    errorsByType: {},
    errorsByPlatform: {}
  };

  errors.forEach(error => {
    // Count by type
    const type = error.name || 'Unknown';
    report.errorsByType[type] = (report.errorsByType[type] || 0) + 1;

    // Count by platform
    if (error.platform) {
      report.errorsByPlatform[error.platform] = (report.errorsByPlatform[error.platform] || 0) + 1;
    }
  });

  return report;
}