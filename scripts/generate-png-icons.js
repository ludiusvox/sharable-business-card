import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const mainSvgPath = path.join(rootDir, 'public', 'card-icon.svg');
const fgSvgPath = path.join(rootDir, 'public', 'card-icon-foreground.svg');

async function generateIcons() {
  console.log('Generating 512x512 PNG icons & Android Adaptive Launcher icons...');

  const mainSvgBuffer = fs.readFileSync(mainSvgPath);
  const fgSvgBuffer = fs.readFileSync(fgSvgPath);

  // 1. Generate 512x512 PNG for web & capacitor
  await sharp(mainSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'card-icon.png'));

  await sharp(mainSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'icon.png'));

  await sharp(mainSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'favicon.png'));

  console.log('✓ Created web & Capacitor 512x512 PNG icons');

  // 2. Generate Android mipmap icons (legacy + adaptive foreground)
  const androidResDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
  if (fs.existsSync(androidResDir)) {
    const mipmaps = [
      { folder: 'mipmap-mdpi', legacySize: 48, fgSize: 108 },
      { folder: 'mipmap-hdpi', legacySize: 72, fgSize: 162 },
      { folder: 'mipmap-xhdpi', legacySize: 96, fgSize: 216 },
      { folder: 'mipmap-xxhdpi', legacySize: 144, fgSize: 324 },
      { folder: 'mipmap-xxxhdpi', legacySize: 192, fgSize: 432 },
    ];

    for (const item of mipmaps) {
      const folderPath = path.join(androidResDir, item.folder);
      if (fs.existsSync(folderPath)) {
        // Legacy ic_launcher & ic_launcher_round
        await sharp(mainSvgBuffer)
          .resize(item.legacySize, item.legacySize)
          .png()
          .toFile(path.join(folderPath, 'ic_launcher.png'));

        await sharp(mainSvgBuffer)
          .resize(item.legacySize, item.legacySize)
          .png()
          .toFile(path.join(folderPath, 'ic_launcher_round.png'));

        // Adaptive Icon Foreground (ic_launcher_foreground.png)
        await sharp(fgSvgBuffer)
          .resize(item.fgSize, item.fgSize)
          .png()
          .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

        console.log(
          `✓ Updated Android ${item.folder} (legacy: ${item.legacySize}x${item.legacySize}, adaptive foreground: ${item.fgSize}x${item.fgSize})`
        );
      }
    }
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
