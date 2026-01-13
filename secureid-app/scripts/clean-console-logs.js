/**
 * Script pour nettoyer/commenter les console.log en production
 * Garde uniquement les console.error/warn critiques
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_CLEAN = [
  'src/app/dashboard/profile/[id]/tracking/page.tsx',
  'src/app/s/[slug]/page-client.tsx',
  'src/app/test-notif/page.tsx',
  'src/app/test-token/page.tsx',
  'src/components/dashboard/DocumentUpload.tsx',
  'src/components/dashboard/GpsSimulationCard.tsx'
];

function cleanFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Fichier introuvable: ${filePath}`);
    return { removed: 0, commented: 0 };
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let removed = 0;
  let commented = 0;

  // Commenter les console.log de debug
  const logMatches = content.match(/(\s*)console\.log\([^)]*\);?/g);
  if (logMatches) {
    logMatches.forEach(match => {
      // Ne pas toucher aux console.log dans les commentaires
      if (!match.trim().startsWith('//')) {
        const commented_version = match.replace(/console\.log/, '// console.log');
        content = content.replace(match, commented_version);
        commented++;
      }
    });
  }

  // Garder console.error et console.warn mais les entourer de conditions
  const errorMatches = content.match(/(\s*)console\.(error|warn)\([^)]*\);?/g);
  if (errorMatches) {
    errorMatches.forEach(match => {
      if (!match.includes('process.env.NODE_ENV') && !match.trim().startsWith('//')) {
        const indentation = match.match(/^(\s*)/)[1];
        const wrapped = `${indentation}if (process.env.NODE_ENV !== 'production') ${match.trim()}`;
        content = content.replace(match, wrapped);
      }
    });
  }

  if (removed > 0 || commented > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  return { removed, commented };
}

function main() {
  console.log('🧹 NETTOYAGE DES CONSOLE.LOG');
  console.log('═'.repeat(60));

  let totalRemoved = 0;
  let totalCommented = 0;

  FILES_TO_CLEAN.forEach(file => {
    const { removed, commented } = cleanFile(file);
    if (removed > 0 || commented > 0) {
      console.log(`✅ ${file}:`);
      if (commented > 0) console.log(`   ${commented} console.log commentés`);
      if (removed > 0) console.log(`   ${removed} console supprimés`);
      totalRemoved += removed;
      totalCommented += commented;
    } else {
      console.log(`⏭️  ${file}: Propre`);
    }
  });

  console.log('\n' + '═'.repeat(60));
  console.log(`📊 Total: ${totalCommented} commentés, ${totalRemoved} supprimés`);
  console.log('✨ Terminé!');
}

main();
