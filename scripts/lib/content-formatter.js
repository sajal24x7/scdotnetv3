/**
 * Content Formatter for POSSE Syndication
 *
 * Formats content appropriately for each social media platform,
 * respecting character limits and platform conventions.
 */

// Platform configuration
const PLATFORM_CONFIG = {
  mastodon: {
    maxLength: 500,
    includeHashtags: true,
    includeLink: true,
    linkText: 'Read more'
  },
  bluesky: {
    maxLength: 300,
    includeHashtags: true,
    includeLink: true,
    linkText: 'Read more'
  },
  threads: {
    maxLength: 500,
    includeHashtags: true,
    includeLink: true,
    linkText: 'Link in bio or visit'
  }
};

/**
 * Extract the first paragraph or description from post content
 */
function extractExcerpt(post, maxLength = 200) {
  // Try description first
  if (post.data.description) {
    return post.data.description;
  }

  // For micro posts, use the body content directly
  if (post.data.category === 'micro' && post.body) {
    // Strip markdown and get first paragraph
    const plainText = post.body
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/[#*_`]/g, '') // Remove markdown formatting
      .replace(/\n\s*\n/g, '\n') // Normalize line breaks
      .trim();

    const firstParagraph = plainText.split('\n')[0];
    return firstParagraph.length > maxLength
      ? firstParagraph.substring(0, maxLength - 3) + '...'
      : firstParagraph;
  }

  // For blog posts, try to extract first paragraph from body
  if (post.body) {
    const plainText = post.body
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/[#*_`]/g, '') // Remove markdown formatting
      .trim();

    const firstParagraph = plainText.split('\n\n')[0] || plainText.split('\n')[0];
    return firstParagraph.length > maxLength
      ? firstParagraph.substring(0, maxLength - 3) + '...'
      : firstParagraph;
  }

  // Fallback to title
  return post.data.title || 'New post';
}

/**
 * Generate hashtags from post tags
 */
function generateHashtags(post, maxTags = 3) {
  if (!post.data.tags || post.data.tags.length === 0) {
    return '';
  }

  return post.data.tags
    .slice(0, maxTags) // Limit number of tags
    .map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`) // Clean and format
    .join(' ');
}

/**
 * Create the canonical URL for a post
 */
function getPostUrl(post) {
  return `https://sajalchoudhary.net/${post.data.category}/${post.slug}/`;
}

/**
 * Create a short URL for social media (without https://)
 */
function getShortUrl(post) {
  return `sajalchoudhary.net/${post.data.category}/${post.slug}/`;
}

/**
 * Format content for a specific platform
 */
export function formatContentForPlatform(post, platform) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  let content = '';
  const postUrl = getPostUrl(post);
  const shortUrl = getShortUrl(post);

  // Calculate space needed for link and hashtags
  const hashtagsText = config.includeHashtags ? generateHashtags(post, 3) : '';
  const linkText = config.includeLink
    ? (platform === 'threads'
        ? `\n\n${config.linkText}: ${shortUrl}`
        : `\n\n📖 ${config.linkText}: ${postUrl}`) // Use full URL for Mastodon/Bluesky
    : '';

  const reservedSpace = linkText.length + (hashtagsText ? hashtagsText.length + 2 : 0); // +2 for \n\n
  const availableContentSpace = config.maxLength - reservedSpace;

  // For micro posts, handle differently
  if (post.data.category === 'micro') {
    // Use the full content for micro posts, but respect available space
    content = extractExcerpt(post, availableContentSpace);
  } else {
    // For blog posts, create an engaging preview
    const title = post.data.title || '';
    const titleSpace = title ? title.length + 2 : 0; // +2 for \n\n
    const excerptSpace = availableContentSpace - titleSpace;

    if (title && excerptSpace > 50) { // Only add title if we have room for meaningful excerpt
      const excerpt = extractExcerpt(post, excerptSpace);
      content = `${title}\n\n${excerpt}`;
    } else {
      // No title or not enough space, just use excerpt
      content = extractExcerpt(post, availableContentSpace);
    }
  }

  // Add link if configured
  if (config.includeLink) {
    content += linkText;
  }

  // Add hashtags if configured (space already calculated)
  if (config.includeHashtags && hashtagsText) {
    content += `\n\n${hashtagsText}`;
  }

  // Final length check and truncation
  if (content.length > config.maxLength) {
    content = content.substring(0, config.maxLength - 3) + '...';
  }

  return {
    text: content.trim(),
    url: postUrl,
    title: post.data.title,
    category: post.data.category,
    tags: post.data.tags || [],
    image: post.data.image ? `https://sajalchoudhary.net${post.data.image}` : null,
    originalPost: post
  };
}

/**
 * Preview formatted content for all platforms (useful for testing)
 */
export function previewAllPlatforms(post) {
  const previews = {};

  for (const platform of Object.keys(PLATFORM_CONFIG)) {
    try {
      previews[platform] = formatContentForPlatform(post, platform);
    } catch (error) {
      previews[platform] = { error: error.message };
    }
  }

  return previews;
}