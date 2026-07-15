// Auto-generated file - do not edit manually
// Found 2 image(s): drive-to-survive.webp, glory.webp

import drive_to_survive_webp from '../images/tvshelf/drive-to-survive.webp';
import glory_webp from '../images/tvshelf/glory.webp';

export const tvCoverImages: Record<string, any> = {
  'drive-to-survive.webp': drive_to_survive_webp,
  'glory.webp': glory_webp
};

export function getTVCoverImage(filename: string) {
  return tvCoverImages[filename];
}

export type TVCoverFilename = 'drive-to-survive.webp' | 'glory.webp';
