import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const svgPath = path.join(rootDir, 'public', 'card-icon.svg');

async function generateIcons() {
  console.log('Generating 512x512 PNG icons from public/card-icon.svg...');

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Generate 512x512 PNG for public/card-icon.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'card-icon.png'));
  console.log('✓ Created public/card-icon.png (512x512)');

  // 2. Generate 512x512 PNG for public/icon.png & public/favicon.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'icon.png'));
  console.log('✓ Created public/icon.png (512x512)');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'favicon.png'));
  console.log('✓ Created public/favicon.png (512x512)');

  // 3. Generate Android mipmap icons if android directory exists
  const androidResDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
  if (fs.existsSync(androidResDir)) {
    const mipmaps = [
      { folder: 'mipmap-mdpi', size: 48 },
      { folder: 'mipmap-hdpi', size: 72 },
      { folder: 'mipmap-xhdpi', size: 96 },
      { folder: 'mipmap-xxhdpi', size: 144 },
      { folder: 'mipmap-xxxhdpi', size: 192 },
    ];

    for (const item of mipmaps) {
      const folderPath = path.join(androidResDir, item.folder);
      if (fs.existsSync(folderPath)) {
        await sharp(svgBuffer)
          .resize(item.size, item.size)
          .png()
          .toFile(path.join(folderPath, 'ic_launcher.png'));

        await sharp(svgBuffer)
          .resize(item.size, item.size)
          .png()
          .toFile(path.join(folderPath, 'ic_launcher_round.png'));

        console.log(`✓ Updated Android ${item.folder} (${item.size}x${item.size})`);
      }
    }
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
