import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('./public/favicon.svg');

await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile('./public/apple-touch-icon.png');

console.log('✓ Generated public/apple-touch-icon.png');
