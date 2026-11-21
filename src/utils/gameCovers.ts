// Auto-generated file - do not edit manually
// Found 6 image(s): fc26.webp, fc27.webp, ghost-of-yotei.webp, gta-vi.webp, spiderman-2.webp, the-blood-of-dawnwalker.webp

import fc26_webp from '../images/gameshelf/fc26.webp';
import fc27_webp from '../images/gameshelf/fc27.webp';
import ghost_of_yotei_webp from '../images/gameshelf/ghost-of-yotei.webp';
import gta_vi_webp from '../images/gameshelf/gta-vi.webp';
import spiderman_2_webp from '../images/gameshelf/spiderman-2.webp';
import the_blood_of_dawnwalker_webp from '../images/gameshelf/the-blood-of-dawnwalker.webp';

export const gameCoverImages: Record<string, any> = {
  'fc26.webp': fc26_webp,
  'fc27.webp': fc27_webp,
  'ghost-of-yotei.webp': ghost_of_yotei_webp,
  'gta-vi.webp': gta_vi_webp,
  'spiderman-2.webp': spiderman_2_webp,
  'the-blood-of-dawnwalker.webp': the_blood_of_dawnwalker_webp
};

export function getGameCoverImage(filename: string) {
  return gameCoverImages[filename];
}

export type GameCoverFilename = 'fc26.webp' | 'fc27.webp' | 'ghost-of-yotei.webp' | 'gta-vi.webp' | 'spiderman-2.webp' | 'the-blood-of-dawnwalker.webp';
