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

const GARDEN_POST_CATEGORIES = new Set(['garden', 'evergreen', 'til', 'bookshelf', 'story', 'poem']);
const NON_LINK_CATEGORIES = new Set([...GARDEN_POST_CATEGORIES, 'nordletter']);

/**
 * Extract link from markdown link format
 */
function extractLinkFromMarkdown(text) {
  const linkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return linkMatch ? { text: linkMatch[1], url: linkMatch[2] } : null;
}

/**
 * Extract quote from blockquote format
 */
function extractQuote(text) {
  const lines = text.split('\n');
  const quoteLines = [];
  let inQuote = false;

  for (const line of lines) {
    if (line.trim().startsWith('>')) {
      inQuote = true;
      quoteLines.push(line.replace(/^>\s*/, '').trim());
    } else if (inQuote && line.trim() === '') {
      // Empty line within quote - continue
      continue;
    } else if (inQuote) {
      // End of quote
      break;
    }
  }

  return quoteLines.join(' ').trim();
}

/**
 * Extract thoughts (content after the quote)
 */
function extractThoughts(text) {
  const lines = text.split('\n');
  const thoughtLines = [];
  let afterQuote = false;

  for (const line of lines) {
    if (afterQuote) {
      if (line.trim()) {
        thoughtLines.push(line.trim());
      }
    } else if (!line.trim().startsWith('>') && !line.includes('[') && !line.includes('](') && line.trim()) {
      afterQuote = true;
      thoughtLines.push(line.trim());
    }
  }

  return thoughtLines.join(' ').trim();
}

/**
 * Truncate text to complete sentences only
 */
function truncateToCompleteSentences(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last sentence boundary before maxLength
  const truncated = text.substring(0, maxLength);
  const sentenceEnders = /[.!?]/g;
  let lastSentenceEnd = -1;
  let match;

  while ((match = sentenceEnders.exec(truncated)) !== null) {
    lastSentenceEnd = match.index;
  }

  if (lastSentenceEnd > 0) {
    return text.substring(0, lastSentenceEnd + 1);
  }

  // If no sentence boundary found, return empty to avoid fragments
  return '';
}

/**
 * Format micro post content according to specified structure
 */
function formatMicroPost(post, availableLength, needsWebsiteLink = false) {
  const body = post.body || '';

  // Extract components
  const link = extractLinkFromMarkdown(body);
  const quote = extractQuote(body);
  const thoughts = extractThoughts(body);

  // If no link detected, display everything and handle overflow with website link back
  if (!link) {
    let content = '';

    if (quote) {
      content += `"${quote}"\n\n`;
    }

    if (thoughts) {
      content += thoughts;
    }

    return content.trim();
  }

  // If quote is under 100 chars, try to include full quote + thoughts + original link
  if (quote && quote.length <= 100) {
    const linkLength = link.url.length + 2; // +2 for \n\n
    const quoteLength = quote.length + 4; // +4 for quotes and \n\n
    const availableForThoughts = availableLength - linkLength - quoteLength;

    if (thoughts && (linkLength + quoteLength + thoughts.length) <= availableLength) {
      // Everything fits
      let content = link.url + '\n\n';
      content += `"${quote}"\n\n`;
      content += thoughts;
      return content.trim();
    } else if (thoughts && availableForThoughts > 20) {
      // Truncate thoughts to complete sentences
      const truncatedThoughts = truncateToCompleteSentences(thoughts, availableForThoughts);
      if (truncatedThoughts) {
        let content = link.url + '\n\n';
        content += `"${quote}"\n\n`;
        content += truncatedThoughts;
        return content.trim();
      }
    }
  }

  // For longer quotes: show title + thoughts + website link back
  // This indicates we need a website link, so we'll handle this in the main function
  return 'NEEDS_WEBSITE_LINK';
}

/**
 * Extract the first paragraph or description from post content
 */
function extractExcerpt(post, maxLength = 200) {
  // Try description first
  if (post.data.description) {
    return post.data.description;
  }

  // For micro posts, use the special formatting
  if (post.data.category === 'micro' && post.body) {
    return formatMicroPost(post, maxLength);
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

function formatNonLinkPost(post, config, hashtagsText) {
    const maxContentLength = config.maxLength - (hashtagsText ? hashtagsText.length + 2 : 0);
    if (maxContentLength <= 0) {
        const fallback = (post.data.title || post.data.description || 'New post').trim() || 'New post';
        let content = fallback;
        if (hashtagsText) {
            content += `\n\n${hashtagsText}`;
        }
        return content.length > config.maxLength
            ? `${content.substring(0, config.maxLength - 3)}...`
            : content.trim();
    }

    const title = (post.data.title || '').trim();
    let content = '';
    let truncatedTitle = title;

    if (title) {
        truncatedTitle = title.length > maxContentLength
            ? `${title.substring(0, maxContentLength - 3)}...`
            : title;
        content = truncatedTitle;
    }

    const newlineSpace = content ? 2 : 0;
    const excerptSpace = maxContentLength - content.length - newlineSpace;

    if (excerptSpace > 0) {
        const excerpt = extractExcerpt(post, excerptSpace);
        const cleanExcerpt = excerpt.trim();
        if (cleanExcerpt) {
            const normalizedExcerpt = cleanExcerpt.toLowerCase();
            const normalizedTitle = title.toLowerCase();
            const normalizedTruncated = truncatedTitle.toLowerCase();

            if (normalizedExcerpt !== normalizedTitle && normalizedExcerpt !== normalizedTruncated) {
                content = content ? `${content}\n\n${cleanExcerpt}` : cleanExcerpt;
            }
        }
    }

    if (!content) {
        const fallback = extractExcerpt(post, maxContentLength) || title || 'New post';
        content = fallback.length > maxContentLength
            ? `${fallback.substring(0, maxContentLength - 3)}...`
            : fallback;
    }

    if (hashtagsText) {
        content += `\n\n${hashtagsText}`;
    }

    return content.trim();
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
 * Check if micro post content fits within platform limits without needing a link back
 */
function checkMicroPostFitsWithoutLink(post, platform) {
  const config = PLATFORM_CONFIG[platform];
  const hashtagsText = config.includeHashtags ? generateHashtags(post, 3) : '';
  const hashtagsSpace = hashtagsText ? hashtagsText.length + 2 : 0; // +2 for \n\n

  // For micro posts, we don't want to include link back unless necessary
  const availableSpace = config.maxLength - hashtagsSpace;
  const formattedContent = formatMicroPost(post, availableSpace);

  // Check if we have a link detected in the post
  const body = post.body || '';
  const link = extractLinkFromMarkdown(body);

  // If no link detected, we only need a link back if content is too long
  if (!link) {
    return formattedContent.length + hashtagsSpace <= config.maxLength;
  }

  // If link detected, we already have the logic in formatMicroPost
  // Just check if it fits
  return formattedContent.length + hashtagsSpace <= config.maxLength;
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
  const hashtagsText = config.includeHashtags ? generateHashtags(post, 3) : '';
  const category = (post.data.category || '').toLowerCase();

  if (NON_LINK_CATEGORIES.has(category)) {
    content = formatNonLinkPost(post, config, hashtagsText);
  } else if (category === 'micro') {
    // Check if content fits without needing a link back
    const fitsWithoutLink = checkMicroPostFitsWithoutLink(post, platform);

    if (fitsWithoutLink) {
      // Format micro post without link back
      const hashtagsSpace = hashtagsText ? hashtagsText.length + 2 : 0;
      const availableSpace = config.maxLength - hashtagsSpace;
      const formattedContent = formatMicroPost(post, availableSpace);

      if (formattedContent === 'NEEDS_WEBSITE_LINK') {
        // Handle quote >100 chars case: title + thoughts + website link
        const linkText = platform === 'threads'
          ? `\n\n${config.linkText}: ${shortUrl}`
          : `\n\n📖 ${config.linkText}: ${postUrl}`;

        const reservedSpace = linkText.length + (hashtagsText ? hashtagsText.length + 2 : 0);
        const availableContentSpace = config.maxLength - reservedSpace;

        // Format: title + thoughts
        const title = post.data.title || '';
        const thoughts = extractThoughts(post.body || '');

        if (title && thoughts) {
          const titleSpace = title.length + 2; // +2 for \n\n
          const availableForThoughts = availableContentSpace - titleSpace;
          const truncatedThoughts = truncateToCompleteSentences(thoughts, availableForThoughts);

          if (truncatedThoughts) {
            content = `${title}\n\n${truncatedThoughts}`;
          } else {
            // If thoughts can't fit as complete sentences, just use title
            content = title;
          }
        } else if (thoughts) {
          const truncatedThoughts = truncateToCompleteSentences(thoughts, availableContentSpace);
          content = truncatedThoughts || thoughts.substring(0, availableContentSpace - 3) + '...';
        } else {
          content = title || 'New post';
        }

        content += linkText;

        // Add hashtags if configured
        if (config.includeHashtags && hashtagsText) {
          content += `\n\n${hashtagsText}`;
        }
      } else {
        content = formattedContent;

        // Add hashtags if configured
        if (config.includeHashtags && hashtagsText) {
          content += `\n\n${hashtagsText}`;
        }
      }
    } else {
      // Content is too long, need to include link back and truncate
      const linkText = platform === 'threads'
        ? `\n\n${config.linkText}: ${shortUrl}`
        : `\n\n📖 ${config.linkText}: ${postUrl}`;

      const reservedSpace = linkText.length + (hashtagsText ? hashtagsText.length + 2 : 0);
      const availableContentSpace = config.maxLength - reservedSpace;

      const formattedContent = formatMicroPost(post, availableContentSpace);

      if (formattedContent === 'NEEDS_WEBSITE_LINK') {
        // Handle quote >100 chars case: title + thoughts + website link
        const title = post.data.title || '';
        const thoughts = extractThoughts(post.body || '');

        if (title && thoughts) {
          const titleSpace = title.length + 2; // +2 for \n\n
          const availableForThoughts = availableContentSpace - titleSpace;
          const truncatedThoughts = truncateToCompleteSentences(thoughts, availableForThoughts);

          if (truncatedThoughts) {
            content = `${title}\n\n${truncatedThoughts}`;
          } else {
            // If thoughts can't fit as complete sentences, just use title
            content = title;
          }
        } else if (thoughts) {
          const truncatedThoughts = truncateToCompleteSentences(thoughts, availableContentSpace);
          content = truncatedThoughts || thoughts.substring(0, availableContentSpace - 3) + '...';
        } else {
          content = title || 'New post';
        }
      } else {
        content = formattedContent;
      }

      content += linkText;

      // Add hashtags if configured
      if (config.includeHashtags && hashtagsText) {
        content += `\n\n${hashtagsText}`;
      }
    }
  } else {
    // For long-form posts, include link back to the site
    const linkText = config.includeLink
      ? (platform === 'threads'
          ? `\n\n${config.linkText}: ${shortUrl}`
          : `\n\n📖 ${config.linkText}: ${postUrl}`)
      : '';

    const reservedSpace = linkText.length + (hashtagsText ? hashtagsText.length + 2 : 0);
    const availableContentSpace = config.maxLength - reservedSpace;

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

    if (config.includeLink) {
      content += linkText;
    }

    if (config.includeHashtags && hashtagsText) {
      content += `\n\n${hashtagsText}`;
    }
  }

  // Final length check and truncation (safety net)
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