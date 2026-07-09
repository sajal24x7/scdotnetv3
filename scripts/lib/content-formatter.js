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
    linkText: 'Read more'
  }
};

// Categories that intentionally omit the canonical link in syndicated posts.
// Keep empty so Nordletter issues include a link back to the full edition.
const NON_LINK_CATEGORIES = new Set();

/**
 * Resolve an image reference to an absolute URL
 */
function resolveImageUrl(src) {
  if (/^https?:\/\//.test(src)) {
    return src;
  }
  return `https://sajalchoudhary.net${src.startsWith('/') ? '' : '/'}${src}`;
}

/**
 * Extract markdown images (![alt](url)) from text
 */
function extractImages(text) {
  const images = [];
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;

  while ((match = imageRegex.exec(text || '')) !== null) {
    images.push({
      alt: match[1].trim(),
      url: resolveImageUrl(match[2].trim())
    });
  }

  return images;
}

/**
 * Remove markdown image syntax from text
 */
function stripImages(text) {
  return (text || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '');
}

/**
 * Convert a micro post body to plain text suitable for social platforms:
 * images removed (they are attached natively), markdown links flattened,
 * blockquotes quoted, formatting markers stripped.
 */
function cleanMicroBody(body) {
  let text = stripImages(body);

  // Markdown links → "text (url)", or just the URL when the text is the URL
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const cleanLabel = label.trim();
    const cleanUrl = url.trim();
    return cleanLabel === cleanUrl ? cleanUrl : `${cleanLabel} (${cleanUrl})`;
  });

  // Blockquote blocks → quoted text
  text = text.replace(/(?:^>[^\n]*\n?)+/gm, (block) => {
    const quote = block.replace(/^>\s?/gm, '').replace(/\n+/g, ' ').trim();
    return quote ? `"${quote}"\n` : '';
  });

  // Strip common markdown formatting markers
  text = text.replace(/[#*_`]/g, '');

  // Collapse blank lines left behind by removed images
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Extract link from markdown link format (ignoring image syntax)
 */
function extractLinkFromMarkdown(text) {
  const linkMatch = stripImages(text).match(/\[([^\]]+)\]\(([^)]+)\)/);
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
  const body = stripImages(post.body);

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
 * Format content for a specific platform
 */
export function formatContentForPlatform(post, platform) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  let content = '';
  const postUrl = getPostUrl(post);
  const hashtagsText = config.includeHashtags ? generateHashtags(post, 3) : '';
  const category = (post.data.category || '').toLowerCase();

  if (NON_LINK_CATEGORIES.has(category)) {
    content = formatNonLinkPost(post, config, hashtagsText);
  } else if (category === 'micro') {
    // Micro posts: if the full text fits within the platform limit,
    // post it verbatim with no link back to the site.
    const cleanedBody = cleanMicroBody(post.body);
    const hashtagsSpace = hashtagsText ? hashtagsText.length + 2 : 0; // +2 for \n\n

    if (cleanedBody && cleanedBody.length + hashtagsSpace <= config.maxLength) {
      content = cleanedBody;

      if (config.includeHashtags && hashtagsText) {
        content += `\n\n${hashtagsText}`;
      }
    } else {
      // Content is too long, need to include link back and truncate
      const linkText = `\n\n📖 ${config.linkText}: ${postUrl}`;

      const reservedSpace = linkText.length + (hashtagsText ? hashtagsText.length + 2 : 0);
      const availableContentSpace = config.maxLength - reservedSpace;

      const formattedContent = formatMicroPost(post, availableContentSpace);

      if (formattedContent === 'NEEDS_WEBSITE_LINK') {
        // Handle quote >100 chars case: title + thoughts + website link
        const title = post.data.title || '';
        const thoughts = extractThoughts(stripImages(post.body));

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
      } else if (formattedContent.length > availableContentSpace) {
        // Truncate to complete sentences so the link back still fits
        content = truncateToCompleteSentences(formattedContent, availableContentSpace)
          || formattedContent.substring(0, availableContentSpace - 3) + '...';
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
      ? `\n\n📖 ${config.linkText}: ${postUrl}`
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

  // Images to attach as native media (micro posts only for now)
  let images = [];
  if (category === 'micro') {
    images = extractImages(post.body);
    if (images.length === 0 && post.data.image) {
      images = [{ url: resolveImageUrl(post.data.image), alt: post.data.title || '' }];
    }
  }

  return {
    text: content.trim(),
    url: postUrl,
    title: post.data.title,
    category: post.data.category,
    tags: post.data.tags || [],
    image: post.data.image ? resolveImageUrl(post.data.image) : (images[0]?.url || null),
    images,
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
