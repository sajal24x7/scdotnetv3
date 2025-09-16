/**
 * Bluesky Platform Integration for POSSE Syndication
 *
 * Handles posting content to Bluesky using the AT Protocol.
 */

/**
 * Create an authenticated AT Protocol session
 *
 * @returns {Promise<Object>} - Session with accessJwt and did
 */
async function createBlueskySession() {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !password) {
    throw new Error('Missing Bluesky configuration: BLUESKY_HANDLE and BLUESKY_APP_PASSWORD required');
  }

  try {
    const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: handle,
        password: password
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      throw new Error(`Bluesky authentication failed: ${errorMessage}`);
    }

    const session = await response.json();
    return session;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to Bluesky');
    }
    throw error;
  }
}

/**
 * Detect URLs in text and create AT Protocol facets
 *
 * @param {string} text - The post text
 * @returns {Array} - Array of facets for URLs
 */
function detectUrls(text) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const facets = [];
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    facets.push({
      index: {
        byteStart: Buffer.from(text.substring(0, match.index)).length,
        byteEnd: Buffer.from(text.substring(0, match.index + match[0].length)).length
      },
      features: [
        {
          $type: 'app.bsky.richtext.facet#link',
          uri: match[0]
        }
      ]
    });
  }

  return facets;
}

/**
 * Post content to Bluesky
 *
 * @param {Object} formattedContent - Content formatted by content-formatter
 * @returns {Promise<string>} - URL of the posted record
 */
export async function postToBluesky(formattedContent) {
  try {
    // Create session
    const session = await createBlueskySession();

    // Prepare the post record
    const now = new Date().toISOString();
    const facets = detectUrls(formattedContent.text);

    const record = {
      $type: 'app.bsky.feed.post',
      text: formattedContent.text,
      createdAt: now
    };

    // Add facets if URLs were detected
    if (facets.length > 0) {
      record.facets = facets;
    }

    // Create the post
    const response = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: record
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
      throw new Error(`Bluesky post failed: ${errorMessage}`);
    }

    const result = await response.json();

    // Construct the Bluesky URL
    // Format: https://bsky.app/profile/[handle]/post/[rkey]
    const rkey = result.uri.split('/').pop();
    const blueskyUrl = `https://bsky.app/profile/${session.handle}/post/${rkey}`;

    return blueskyUrl;

  } catch (error) {
    throw error;
  }
}

/**
 * Upload blob to Bluesky (for future image support)
 *
 * @param {string} imageUrl - URL of the image to upload
 * @param {Object} session - Active Bluesky session
 * @returns {Promise<Object>} - Blob reference
 */
export async function uploadBlueskyBlob(imageUrl, session) {
  try {
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Upload to Bluesky
    const uploadResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`,
        'Content-Type': mimeType
      },
      body: imageBuffer
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(`Blob upload failed: ${errorData.message || uploadResponse.statusText}`);
    }

    const result = await uploadResponse.json();
    return result.blob;

  } catch (error) {
    throw new Error(`Failed to upload blob to Bluesky: ${error.message}`);
  }
}

/**
 * Verify Bluesky credentials
 *
 * @returns {Promise<Object>} - Session information if successful
 */
export async function verifyBlueskyCredentials() {
  try {
    const session = await createBlueskySession();
    return {
      handle: session.handle,
      did: session.did,
      authenticated: true
    };
  } catch (error) {
    throw new Error(`Failed to verify Bluesky credentials: ${error.message}`);
  }
}