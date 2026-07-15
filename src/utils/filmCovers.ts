// Auto-generated file - do not edit manually
// Found 2 image(s): apex.webp, ladies-first.webp

import apex_webp from '../images/filmshelf/apex.webp';
import ladies_first_webp from '../images/filmshelf/ladies-first.webp';

export const filmCoverImages: Record<string, any> = {
  'apex.webp': apex_webp,
  'ladies-first.webp': ladies_first_webp
};

export function getFilmCoverImage(filename: string) {
  return filmCoverImages[filename];
}

export type FilmCoverFilename = 'apex.webp' | 'ladies-first.webp';
