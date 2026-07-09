/**
 * Instagram Platform Integration for POSSE Syndication
 *
 * Publishes photo posts to Instagram using the "Instagram API with Instagram
 * Login" (graph.instagram.com) — the same container → publish pattern as
 * Threads, but with its own token: Threads tokens are NOT valid here.
 *
 * Requirements (enforced by Meta, checked here where possible):
 * - Instagram professional account (Business or Creator)
 * - Token scopes: instagram_business_basic + instagram_business_content_publish
 * - JPEG images only, max 8MB, aspect ratio between 4:5 and 1.91:1,
 *   publicly reachable URL
 * - Max 10 images per carousel; 50 API-published posts per 24h
 */

const API_HOST = 'https://graph.instagram.com';
const API_VERSION = 'v23.0';
const MAX_CAROUSEL_ITEMS = 10;
const MAX_CAPTION_LENGTH = 2200;

const api = (path) => `${API_HOST}/${API_VERSION}/${path}`;

/**
 * Instagram only accepts JPEG. Our R2 keys carry real extensions, so filter
 * by URL rather than failing the whole post at Meta's end.
 */
function jpegImagesOnly(images) {
  const jpeg = [];
  for (const image of images) {
    if (/\.jpe?g(\?|#|$)/i.test(image.url)) {
      jpeg.push(image);
    } else {
      console.warn(`    ⚠️  Instagram: skipping non-JPEG image ${image.url}`);
    }
  }
  return jpeg;
}

/**
 * Post content to Instagram
 *
 * @param {Object} formattedContent - Content formatted by content-formatter
 * @returns {Promise<string>} - Permalink of the published Instagram post
 */
export async function postToInstagram(formattedContent) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();

  if (!accessToken || !userId) {
    throw new Error('Missing Instagram configuration: INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID required');
  }
  if (!/^\d+$/.test(userId)) {
    throw new Error('Invalid INSTAGRAM_USER_ID format. Should only contain digits.');
  }

  const images = jpegImagesOnly(formattedContent.images || []).slice(0, MAX_CAROUSEL_ITEMS);
  if (images.length === 0) {
    // Instagram has no text-only posts — without a usable image there is
    // nothing to publish.
    throw new Error('Instagram requires at least one JPEG image');
  }

  const caption = (formattedContent.text || '').substring(0, MAX_CAPTION_LENGTH);

  let containerId;
  if (images.length === 1) {
    containerId = await createContainer(userId, accessToken, {
      image_url: images[0].url,
      ...(images[0].alt ? { alt_text: images[0].alt.substring(0, 1000) } : {}),
      caption
    });
  } else {
    // Carousel: one container per image, then a parent CAROUSEL container
    const children = [];
    for (const image of images) {
      const childId = await createContainer(userId, accessToken, {
        image_url: image.url,
        is_carousel_item: true,
        ...(image.alt ? { alt_text: image.alt.substring(0, 1000) } : {})
      });
      await waitForContainer(childId, accessToken);
      children.push(childId);
    }
    containerId = await createContainer(userId, accessToken, {
      media_type: 'CAROUSEL',
      children: children.join(','),
      caption
    });
  }

  // Instagram fetches images asynchronously; wait until the container is ready
  await waitForContainer(containerId, accessToken);

  const publishResponse = await fetch(api(`${userId}/media_publish`), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ creation_id: containerId })
  });

  if (!publishResponse.ok) {
    const errorData = await publishResponse.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.error || `HTTP ${publishResponse.status}`;
    throw new Error(`Instagram publish failed: ${errorMessage}`);
  }

  const { id: mediaId } = await publishResponse.json();

  // Fetch the permalink for syndicationUrls bookkeeping
  const permalinkResponse = await fetch(api(`${mediaId}?fields=permalink`), {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (permalinkResponse.ok) {
    const { permalink } = await permalinkResponse.json();
    if (permalink) return permalink;
  }

  console.warn('Could not retrieve Instagram permalink, using media id URL');
  return `https://www.instagram.com/p/${mediaId}`;
}

/**
 * Create an Instagram media container
 */
async function createContainer(userId, accessToken, payload) {
  const response = await fetch(api(`${userId}/media`), {
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
    throw new Error(`Instagram container creation failed: ${errorMessage}`);
  }

  const result = await response.json();
  return result.id;
}

/**
 * Poll a media container until Instagram finishes processing it
 */
async function waitForContainer(containerId, accessToken, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await fetch(api(`${containerId}?fields=status_code`), {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      continue; // transient error - keep waiting
    }

    const result = await response.json();
    if (result.status_code === 'FINISHED') {
      return;
    }
    if (result.status_code === 'ERROR' || result.status_code === 'EXPIRED') {
      throw new Error(`Instagram could not process the media (status: ${result.status_code})`);
    }
  }

  throw new Error('Timed out waiting for Instagram to process the media');
}

/**
 * Verify Instagram API credentials and permissions
 */
export async function verifyInstagramCredentials() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();

  if (!accessToken || !userId) {
    throw new Error('Missing Instagram configuration');
  }

  const response = await fetch(api(`${userId}?fields=id,username,account_type`), {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.error || `HTTP ${response.status}`;
    throw new Error(`Instagram credential verification failed: ${errorMessage}`);
  }

  return await response.json();
}
