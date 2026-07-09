/**
 * Threads Platform Integration for POSSE Syndication
 *
 * Handles posting content to Threads using the Meta Threads API.
 * Requires Meta Business verification and proper app setup.
 */

/**
 * Post content to Threads
 *
 * @param {Object} formattedContent - Content formatted by content-formatter
 * @returns {Promise<string>} - URL of the posted thread
 */
export async function postToThreads(formattedContent) {
  // Clean and validate environment variables
  const accessToken = process.env.THREADS_ACCESS_TOKEN?.trim();
  const userId = process.env.THREADS_USER_ID?.trim();

  // Debug logging (remove this after testing)
  // console.log('Threads Debug:');
  // console.log('- Access Token exists:', !!accessToken);
  // console.log('- Access Token length:', accessToken?.length);
  // console.log('- Access Token preview:', accessToken?.substring(0, 20) + '...');
  // console.log('- User ID exists:', !!userId);
  // console.log('- User ID value:', userId);

  if (!accessToken || !userId) {
    throw new Error('Missing Threads configuration: THREADS_ACCESS_TOKEN and THREADS_USER_ID required');
  }

  // Validate formats
  if (!/^[A-Za-z0-9\-_]+$/.test(accessToken)) {
    throw new Error('Invalid THREADS_ACCESS_TOKEN format. Should only contain alphanumeric characters, hyphens, and underscores.');
  }

  if (!/^\d+$/.test(userId)) {
    throw new Error('Invalid THREADS_USER_ID format. Should only contain digits.');
  }

  // Validate that access token doesn't contain user ID
  if (accessToken.includes(userId)) {
    throw new Error(`Invalid configuration: THREADS_ACCESS_TOKEN appears to contain the user ID. Please check your environment variables.`);
  }

  try {
    // Step 1: Create a Threads Media Container (with image when available)
    const images = formattedContent.images || [];
    const firstImage = images[0];
    if (images.length > 1) {
      console.warn('    ⚠️  Threads: only attaching the first image (carousel posts not supported yet)');
    }

    let containerId;
    if (firstImage) {
      try {
        containerId = await createThreadsContainer(userId, accessToken, {
          media_type: 'IMAGE',
          image_url: firstImage.url,
          text: formattedContent.text,
          ...(firstImage.alt ? { alt_text: firstImage.alt.substring(0, 1000) } : {})
        });
        // Threads fetches the image asynchronously; wait until the container is ready
        await waitForThreadsContainer(containerId, accessToken);
      } catch (error) {
        console.warn(`    ⚠️  Threads image post failed (${error.message}); retrying as text-only`);
        containerId = null;
      }
    }

    if (!containerId) {
      containerId = await createThreadsContainer(userId, accessToken, {
        media_type: 'TEXT',
        text: formattedContent.text
      });
    }

    // Step 2: Publish the Threads Media Container
    const publishResponse = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_id: containerId
      })
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.error || `HTTP ${publishResponse.status}`;
      throw new Error(`Threads publish failed: ${errorMessage}`);
    }

    const publishResult = await publishResponse.json();
    const threadId = publishResult.id;

    // Step 3: Get the permalink for the thread
    const permalinkResponse = await fetch(`https://graph.threads.net/v1.0/${threadId}?fields=permalink`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!permalinkResponse.ok) {
      // If we can't get the permalink, construct a generic one
      console.warn('Could not retrieve Threads permalink, using generic URL');
      return `https://www.threads.net/t/${threadId}`;
    }

    const permalinkResult = await permalinkResponse.json();
    return permalinkResult.permalink || `https://www.threads.net/t/${threadId}`;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to Threads API');
    }
    throw error;
  }
}

/**
 * Create a Threads media container
 *
 * @param {string} userId - Threads user ID
 * @param {string} accessToken - Threads access token
 * @param {Object} payload - Container payload (media_type, text, image_url, ...)
 * @returns {Promise<string>} - Container ID
 */
async function createThreadsContainer(userId, accessToken, payload) {
  const response = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.error || `HTTP ${response.status}`;
    throw new Error(`Threads container creation failed: ${errorMessage}`);
  }

  const result = await response.json();
  return result.id;
}

/**
 * Poll a media container until Threads finishes processing it
 */
async function waitForThreadsContainer(containerId, accessToken, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await fetch(`https://graph.threads.net/v1.0/${containerId}?fields=status_code`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      continue; // transient error - keep waiting
    }

    const result = await response.json();
    if (result.status_code === 'FINISHED') {
      return;
    }
    if (result.status_code === 'ERROR' || result.status_code === 'EXPIRED') {
      throw new Error(`Threads could not process the media (status: ${result.status_code})`);
    }
  }

  throw new Error('Timed out waiting for Threads to process the media');
}

/**
 * Upload media to Threads (for future image support)
 *
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} text - Text content to accompany the image
 * @returns {Promise<string>} - URL of the posted thread with image
 */
export async function postThreadsWithImage(imageUrl, text) {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    throw new Error('Missing Threads configuration');
  }

  try {
    // Create container with image
    const containerResponse = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        media_type: 'IMAGE',
        image_url: imageUrl,
        text: text
      })
    });

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json().catch(() => ({}));
      throw new Error(`Threads image container creation failed: ${errorData.error?.message || containerResponse.statusText}`);
    }

    const containerResult = await containerResponse.json();

    // Wait a moment for the image to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Publish the container
    const publishResponse = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_id: containerResult.id
      })
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json().catch(() => ({}));
      throw new Error(`Threads image publish failed: ${errorData.error?.message || publishResponse.statusText}`);
    }

    const publishResult = await publishResponse.json();
    return `https://www.threads.net/t/${publishResult.id}`;

  } catch (error) {
    throw new Error(`Failed to post image to Threads: ${error.message}`);
  }
}

/**
 * Check Threads API rate limits
 *
 * @returns {Promise<Object>} - Rate limit information
 */
export async function getThreadsRateLimit() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    throw new Error('Missing Threads configuration');
  }

  try {
    // Make a simple API call to check rate limits
    const response = await fetch(`https://graph.threads.net/v1.0/${userId}?fields=id`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const rateLimitRemaining = response.headers.get('X-App-Usage') ||
                              response.headers.get('X-Business-Use-Case-Usage');

    return {
      remaining: rateLimitRemaining,
      resetTime: response.headers.get('X-RateLimit-Reset')
    };

  } catch (error) {
    throw new Error(`Failed to check Threads rate limit: ${error.message}`);
  }
}

/**
 * Verify Threads API credentials and permissions
 *
 * @returns {Promise<Object>} - User profile information if successful
 */
export async function verifyThreadsCredentials() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    throw new Error('Missing Threads configuration');
  }

  try {
    const response = await fetch(`https://graph.threads.net/v1.0/${userId}?fields=id,username,threads_profile_picture_url`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.error || `HTTP ${response.status}`;
      throw new Error(`Threads credential verification failed: ${errorMessage}`);
    }

    return await response.json();

  } catch (error) {
    throw new Error(`Failed to verify Threads credentials: ${error.message}`);
  }
}

/**
 * Check if access token is close to expiring (Threads tokens expire every 60 days)
 *
 * @returns {Promise<Object>} - Token expiration information
 */
export async function checkThreadsTokenExpiration() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Missing THREADS_ACCESS_TOKEN');
  }

  try {
    // Use debug_token endpoint to check token validity and expiration
    const response = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`);

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    const result = await response.json();
    const tokenInfo = result.data;

    if (!tokenInfo.is_valid) {
      throw new Error('Token is invalid');
    }

    const expiresAt = tokenInfo.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const daysRemaining = Math.floor((expiresAt - now) / (24 * 60 * 60));

    return {
      isValid: tokenInfo.is_valid,
      expiresAt: new Date(expiresAt * 1000),
      daysRemaining: daysRemaining,
      needsRenewal: daysRemaining < 7 // Warn if less than 7 days remaining
    };

  } catch (error) {
    throw new Error(`Failed to check token expiration: ${error.message}`);
  }
}