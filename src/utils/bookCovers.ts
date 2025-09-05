// Static imports for book cover images
// This allows us to use Astro's Image component with proper optimization

// Import all book cover images
import childrenOfTime from '../images/bookshelf/202509-children-of-time.jpg';

// Export a map of book cover filenames to their imported images
export const bookCoverImages: Record<string, any> = {
  '202509-children-of-time.jpg': childrenOfTime,
};

// Helper function to get the imported image
export function getBookCoverImage(filename: string) {
  return bookCoverImages[filename];
}