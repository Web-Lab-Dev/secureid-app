const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LANDING_DIR = path.join(__dirname, '../public/landing');

const pngFiles = [
  'hero-mother-child.png',
  'section-ia.png',
  'shield-protection-3d.png',
  'feature-medical-kit.png',
  'feature-identity-joy.png',
  'cta-father-hand.png'
];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  for (const file of pngFiles) {
    const inputPath = path.join(LANDING_DIR, file);
    const outputPath = path.join(LANDING_DIR, file.replace('.png', '.webp'));

    try {
      const stats = fs.statSync(inputPath);
      const inputSizeMB = (stats.size / 1024 / 1024).toFixed(2);

      console.log(`Converting ${file} (${inputSizeMB} MB)...`);

      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
      const reduction = ((1 - outputStats.size / stats.size) * 100).toFixed(1);

      console.log(`✅ Created ${file.replace('.png', '.webp')} (${outputSizeMB} MB) - ${reduction}% reduction\n`);
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error.message);
    }
  }

  console.log('✨ Image optimization complete!');
}

optimizeImages();
