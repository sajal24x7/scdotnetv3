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

  // Upload images so they attach as native media (Mastodon allows up to 4)
  const mediaIds = [];
  const images = formattedContent.images || [];
  for (const image of images.slice(0, 4)) {
    try {
      mediaIds.push(await uploadMastodonMedia(image.url, image.alt));
    } catch (error) {
      console.warn(`    ⚠️  Skipping image for Mastodon (${image.url}): ${error.message}`);
    }
  }

  // Prepare the status data
  const statusData = {
    status: formattedContent.text,
    visibility: 'public'
  };

  if (mediaIds.length > 0) {
    statusData.media_ids = mediaIds;
  }

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
 * Upload media to Mastodon
 *
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} description - Alt text for the image
 * @returns {Promise<string>} - Media attachment ID
 */
export async function uploadMastodonMedia(imageUrl, description = '') {
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
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const imageBlob = new Blob([imageBuffer], { type: mimeType });

    // Create form data
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.jpg');
    if (description) {
      formData.append('description', description.substring(0, 1500));
    }

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

    // 202 means the media is still processing; attaching it too early fails
    if (uploadResponse.status === 202) {
      await waitForMastodonMedia(result.id, instance, accessToken);
    }

    return result.id;

  } catch (error) {
    throw new Error(`Failed to upload media to Mastodon: ${error.message}`);
  }
}

/**
 * Poll a media attachment until Mastodon finishes processing it
 * (GET returns 206 while processing, 200 when ready)
 */
async function waitForMastodonMedia(mediaId, instance, accessToken, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(`${instance}/api/v1/media/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 200) {
      return;
    }
    if (response.status !== 206) {
      throw new Error(`Media processing failed: HTTP ${response.status}`);
    }
  }

  throw new Error('Timed out waiting for media processing');
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