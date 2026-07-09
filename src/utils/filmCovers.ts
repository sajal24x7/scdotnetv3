// Auto-generated file - do not edit manually
// Found 2 image(s): apex.jpg, ladies-first.jpg

import apex_jpg from '../images/filmshelf/apex.jpg';
import ladies_first_jpg from '../images/filmshelf/ladies-first.jpg';

export const filmCoverImages: Record<string, any> = {
  'apex.jpg': apex_jpg,
  'ladies-first.jpg': ladies_first_jpg
};

export function getFilmCoverImage(filename: string) {
  return filmCoverImages[filename];
}

export type FilmCoverFilename = 'apex.jpg' | 'ladies-first.jpg';
