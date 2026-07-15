import sharp from 'sharp';

// Cover images are downloaded once and read many times (every page render),
// so favor visual fidelity over squeezing out extra bytes.
const DEFAULT_QUALITY = 90;

// Convert an image file on disk to WebP and write it to outputPath.
// inputPath and outputPath must differ (sharp cannot read and overwrite the
// same file in one pipeline).
export async function convertFileToWebp(inputPath, outputPath, { quality = DEFAULT_QUALITY } = {}) {
  await sharp(inputPath).webp({ quality }).toFile(outputPath);
}
