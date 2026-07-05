// Auto-generated file - do not edit manually
// Generated on: 2026-07-05T06:45:47.874Z
// Found 2 image(s): drive-to-survive.jpg, glory.jpg

import drive_to_survive_jpg from '../images/tvshelf/drive-to-survive.jpg';
import glory_jpg from '../images/tvshelf/glory.jpg';

export const tvCoverImages: Record<string, any> = {
  'drive-to-survive.jpg': drive_to_survive_jpg,
  'glory.jpg': glory_jpg
};

export function getTVCoverImage(filename: string) {
  return tvCoverImages[filename];
}

export type TVCoverFilename = 'drive-to-survive.jpg' | 'glory.jpg';
