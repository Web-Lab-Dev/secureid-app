/**
 * Script pour mettre à jour toutes les références d'images vers WebP
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_UPDATE = [
  'src/components/landing/ParentTestimonialsTikTokSection.tsx',
  'src/app/about/page.tsx'
];

const REPLACEMENTS = [
  { from: /\.jpg(['"])/g, to: '.webp$1' },
  { from: /\.jpeg(['"])/g, to: '.webp$1' },
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Fichier introuvable: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changes = 0;

  REPLACEMENTS.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      changes += matches.length;
      content = content.replace(from, to);
    }
  });

  if (changes > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}: ${changes} références mises à jour`);
    return true;
  } else {
    console.log(`⏭️  ${filePath}: Aucune modification nécessaire`);
    return false;
  }
}

function main() {
  console.log('🔄 MISE À JOUR DES RÉFÉRENCES D\'IMAGES');
  console.log('═'.repeat(60));

  let totalUpdated = 0;

  FILES_TO_UPDATE.forEach(file => {
    if (updateFile(file)) {
      totalUpdated++;
    }
  });

  console.log('\n' + '═'.repeat(60));
  console.log(`📊 ${totalUpdated} fichier(s) mis à jour`);
  console.log('✨ Terminé!');
}

main();
