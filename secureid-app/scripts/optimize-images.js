const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const QUALITY = 85;

// Dossiers et extensions à traiter
const DIRECTORIES = [
  { name: 'landing', extensions: ['.png', '.jpg', '.jpeg'] },
  { name: 'annonce des reseaux sociaux', extensions: ['.jpg', '.jpeg'] }
];

async function convertToWebP(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const sizeBefore = (stats.size / 1024).toFixed(2);

    await sharp(inputPath)
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(outputPath);

    const statsAfter = fs.statSync(outputPath);
    const sizeAfter = (statsAfter.size / 1024).toFixed(2);
    const reduction = ((1 - statsAfter.size / stats.size) * 100).toFixed(1);

    console.log(`✅ ${path.basename(inputPath)}: ${sizeBefore} KB → ${sizeAfter} KB (-${reduction}%)`);

    return { before: stats.size, after: statsAfter.size };
  } catch (error) {
    console.error(`❌ ${path.basename(inputPath)}:`, error.message);
    return null;
  }
}

async function processDirectory(dirConfig) {
  const dirPath = path.join(PUBLIC_DIR, dirConfig.name);

  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Dossier introuvable: ${dirConfig.name}`);
    return { count: 0, totalBefore: 0, totalAfter: 0 };
  }

  console.log(`\n📁 ${dirConfig.name}/`);
  console.log('─'.repeat(60));

  const files = fs.readdirSync(dirPath);
  let count = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!dirConfig.extensions.includes(ext)) continue;

    const inputPath = path.join(dirPath, file);
    const outputName = file.replace(/\.(png|jpe?g)$/i, '.webp');
    const outputPath = path.join(dirPath, outputName);

    // Skip si WebP existe déjà
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  ${file} (WebP existe)`);
      continue;
    }

    const result = await convertToWebP(inputPath, outputPath);
    if (result) {
      count++;
      totalBefore += result.before;
      totalAfter += result.after;
    }
  }

  return { count, totalBefore, totalAfter };
}

async function optimizeImages() {
  console.log('🎨 OPTIMISATION IMAGES - SECUREID APP');
  console.log('═'.repeat(60));
  console.log(`Qualité WebP: ${QUALITY}%\n`);

  let globalCount = 0;
  let globalBefore = 0;
  let globalAfter = 0;

  for (const dirConfig of DIRECTORIES) {
    const { count, totalBefore, totalAfter } = await processDirectory(dirConfig);
    globalCount += count;
    globalBefore += totalBefore;
    globalAfter += totalAfter;
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSULTATS');
  console.log('═'.repeat(60));
  console.log(`Images converties: ${globalCount}`);
  console.log(`Avant: ${(globalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Après: ${(globalAfter / 1024 / 1024).toFixed(2)} MB`);

  if (globalBefore > 0) {
    const reduction = ((1 - globalAfter / globalBefore) * 100).toFixed(1);
    const savedMB = ((globalBefore - globalAfter) / 1024 / 1024).toFixed(2);
    console.log(`Économie: -${reduction}% (${savedMB} MB)`);
  }

  console.log('\n✨ Terminé!');
}

optimizeImages();
