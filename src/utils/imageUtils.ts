/**
 * Utility functions for handling images in the site
 * Determines whether to use local images or R2-hosted images based on environment
 */

// Update this with your Cloudflare R2 public URL when you set it up
const R2_IMAGE_URL = process.env.CF_R2_PUBLIC_URL || 'https://pub-<your-bucket-name>.r2.dev';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Returns the appropriate URL for an image
 * In development: uses local images
 * In production: uses R2-hosted images
 * 
 * @param path The image path relative to the /images directory
 * @returns The full URL for the image
 */
export function getImageUrl(path: string): string {
  // Check if the path is already a full URL (external image)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Clean up the path to ensure it starts with a forward slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // In development, use local images
  if (!IS_PRODUCTION) {
    return `/images${cleanPath}`;
  }
  
  // In production, use R2-hosted images
  return `${R2_IMAGE_URL}${cleanPath}`;
}

/**
 * Custom image object for handling responsive images
 */
export interface CustomImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

/**
 * Creates an image object with the correct URL
 * 
 * @param path The image path relative to the /images directory
 * @param alt Alt text for the image
 * @param width Optional width of the image 
 * @param height Optional height of the image
 * @param caption Optional caption for the image
 * @returns An image object
 */
export function createImage(
  path: string, 
  alt: string = '', 
  width?: number, 
  height?: number,
  caption?: string
): CustomImage {
  return {
    src: getImageUrl(path),
    alt,
    width,
    height,
    caption
  };
} 