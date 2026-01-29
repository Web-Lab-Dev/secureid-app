/**
 * Script de génération des assets PWA
 * Génère toutes les icônes, splash screens et favicons
 *
 * Usage: node scripts/generate-pwa-assets.mjs
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const SOURCE_ICON = join(PUBLIC_DIR, 'icon-512.png');

// Configurations des icônes à générer
const ICON_SIZES = [
  // Favicons
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },

  // Android Chrome
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },

  // Apple Touch Icons
  { size: 120, name: 'apple-touch-icon-120.png' },
  { size: 152, name: 'apple-touch-icon-152.png' },
  { size: 167, name: 'apple-touch-icon-167.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // Default Apple touch icon

  // Windows Tiles
  { size: 70, name: 'ms-icon-70.png' },
  { size: 150, name: 'ms-icon-150.png' },
  { size: 310, name: 'ms-icon-310.png' },
];

// Icônes maskable (Android Adaptive Icons) - avec padding pour safe zone
const MASKABLE_SIZES = [
  { size: 192, name: 'icon-maskable-192.png' },
  { size: 512, name: 'icon-maskable-512.png' },
];

// Splash screens iOS (portrait uniquement pour simplifier)
const SPLASH_SCREENS = [
  // iPhone
  { width: 640, height: 1136, name: 'splash-640x1136.png' },   // iPhone 5/SE
  { width: 750, height: 1334, name: 'splash-750x1334.png' },   // iPhone 6/7/8/SE2
  { width: 828, height: 1792, name: 'splash-828x1792.png' },   // iPhone XR/11
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS/11 Pro
  { width: 1170, height: 2532, name: 'splash-1170x2532.png' }, // iPhone 12/13/14
  { width: 1179, height: 2556, name: 'splash-1179x2556.png' }, // iPhone 14 Pro
  { width: 1284, height: 2778, name: 'splash-1284x2778.png' }, // iPhone 12/13/14 Pro Max
  { width: 1290, height: 2796, name: 'splash-1290x2796.png' }, // iPhone 14 Pro Max
  { width: 1242, height: 2688, name: 'splash-1242x2688.png' }, // iPhone XS Max/11 Pro Max

  // iPad
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' }, // iPad Mini/Air
  { width: 1668, height: 2224, name: 'splash-1668x2224.png' }, // iPad Pro 10.5"
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' }, // iPad Pro 11"
  { width: 2048, height: 2732, name: 'splash-2048x2732.png' }, // iPad Pro 12.9"
];

// Couleurs de l'app
const BACKGROUND_COLOR = '#1c1917'; // slate-900
const THEME_COLOR = '#f97316';      // orange-500

async function generateIcon(sourceBuffer, size, outputPath) {
  await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log(`✓ Generated: ${outputPath} (${size}x${size})`);
}

async function generateMaskableIcon(sourceBuffer, size, outputPath) {
  // Pour les icônes maskable, on ajoute un padding de 10% (safe zone Android)
  // L'icône occupe 80% du canvas, avec un fond coloré
  const iconSize = Math.round(size * 0.8);
  const padding = Math.round(size * 0.1);

  // Créer le fond avec la couleur du thème
  const background = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 28, g: 25, b: 23, alpha: 1 } // #1c1917
    }
  }).png().toBuffer();

  // Redimensionner l'icône source
  const resizedIcon = await sharp(sourceBuffer)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Composer l'icône sur le fond
  await sharp(background)
    .composite([{
      input: resizedIcon,
      left: padding,
      top: padding
    }])
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log(`✓ Generated maskable: ${outputPath} (${size}x${size})`);
}

async function generateSplashScreen(sourceBuffer, width, height, outputPath) {
  // Taille de l'icône: 30% de la plus petite dimension
  const iconSize = Math.round(Math.min(width, height) * 0.3);
  const iconX = Math.round((width - iconSize) / 2);
  const iconY = Math.round((height - iconSize) / 2) - Math.round(height * 0.05); // Légèrement au-dessus du centre

  // Créer le fond
  const background = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 28, g: 25, b: 23, alpha: 1 } // #1c1917
    }
  }).png().toBuffer();

  // Redimensionner l'icône
  const resizedIcon = await sharp(sourceBuffer)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Composer
  await sharp(background)
    .composite([{
      input: resizedIcon,
      left: iconX,
      top: iconY
    }])
    .png({ quality: 90 })
    .toFile(outputPath);

  console.log(`✓ Generated splash: ${outputPath} (${width}x${height})`);
}

async function generateFavicon(sourceBuffer, outputPath) {
  // Générer un ICO avec plusieurs tailles
  const sizes = [16, 32, 48];
  const layers = await Promise.all(
    sizes.map(size =>
      sharp(sourceBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // Pour simplifier, on génère juste un PNG 32x32 comme favicon
  // Les navigateurs modernes supportent bien le PNG
  await sharp(sourceBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(PUBLIC_DIR, 'favicon.png'));

  console.log(`✓ Generated: favicon.png (32x32)`);
}

async function main() {
  console.log('🚀 Génération des assets PWA...\n');

  // Créer le dossier splash si nécessaire
  const splashDir = join(PUBLIC_DIR, 'splash');
  if (!existsSync(splashDir)) {
    await mkdir(splashDir, { recursive: true });
  }

  // Charger l'icône source
  const sourceBuffer = await sharp(SOURCE_ICON).png().toBuffer();
  console.log(`📦 Source: ${SOURCE_ICON}\n`);

  // Générer les icônes standard
  console.log('--- Icônes Standard ---');
  for (const { size, name } of ICON_SIZES) {
    await generateIcon(sourceBuffer, size, join(PUBLIC_DIR, name));
  }

  // Générer les icônes maskable
  console.log('\n--- Icônes Maskable (Android Adaptive) ---');
  for (const { size, name } of MASKABLE_SIZES) {
    await generateMaskableIcon(sourceBuffer, size, join(PUBLIC_DIR, name));
  }

  // Générer le favicon
  console.log('\n--- Favicon ---');
  await generateFavicon(sourceBuffer, join(PUBLIC_DIR, 'favicon.ico'));

  // Générer les splash screens
  console.log('\n--- Splash Screens iOS ---');
  for (const { width, height, name } of SPLASH_SCREENS) {
    await generateSplashScreen(sourceBuffer, width, height, join(splashDir, name));
  }

  console.log('\n✅ Génération terminée!');
  console.log(`📁 Assets générés dans: ${PUBLIC_DIR}`);
}

main().catch(console.error);
