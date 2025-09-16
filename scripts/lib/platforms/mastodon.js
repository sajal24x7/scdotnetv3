/**
 * Mastodon Platform Integration for POSSE Syndication
 *
 * Handles posting content to Mastodon using the REST API v1.
 */

/**
 * Post content to Mastodon
 *
 * @param {Object} formattedContent - Content formatted by content-formatter
 * @returns {Promise<string>} - URL of the posted status
 */
export async function postToMastodon(formattedContent) {
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  const instance = process.env.MASTODON_INSTANCE;

  if (!accessToken || !instance) {
    throw new Error('Missing Mastodon configuration: MASTODON_ACCESS_TOKEN and MASTODON_INSTANCE required');
  }

  // Prepare the status data
  const statusData = {
    status: formattedContent.text,
    visibility: 'public'
  };

  try {
    // Post the status
    const response = await fetch(`${instance}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Mastodon API error: ${errorMessage}`);
    }

    const result = await response.json();

    // Return the URL of the posted status
    return result.url || result.uri;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to Mastodon instance');
    }
    throw error;
  }
}

/**
 * Upload media to Mastodon (for future image support)
 *
 * @param {string} imageUrl - URL of the image to upload
 * @returns {Promise<string>} - Media attachment ID
 */
export async function uploadMastodonMedia(imageUrl) {
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  const instance = process.env.MASTODON_INSTANCE;

  if (!accessToken || !instance) {
    throw new Error('Missing Mastodon configuration');
  }

  try {
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer]);

    // Create form data
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.jpg');

    // Upload to Mastodon
    const uploadResponse = await fetch(`${instance}/api/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(`Media upload failed: ${errorData.error || uploadResponse.statusText}`);
    }

    const result = await uploadResponse.json();
    return result.id;

  } catch (error) {
    throw new Error(`Failed to upload media to Mastodon: ${error.message}`);
  }
}

/**
 * Verify Mastodon API credentials
 *
 * @returns {Promise<Object>} - Account information if successful
 */
export async function verifyMastodonCredentials() {
  const accessToken = process.env.MASTODON_ACCESS_TOKEN;
  const instance = process.env.MASTODON_INSTANCE;

  if (!accessToken || !instance) {
    throw new Error('Missing Mastodon configuration');
  }

  try {
    const response = await fetch(`${instance}/api/v1/accounts/verify_credentials`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Credential verification failed: ${errorData.error || response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    throw new Error(`Failed to verify Mastodon credentials: ${error.message}`);
  }
}