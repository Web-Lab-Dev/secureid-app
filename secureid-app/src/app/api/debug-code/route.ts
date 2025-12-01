import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DIAGNOSTIC ROUTE - Vérifier le code déployé sur Vercel
 * Route: GET /api/debug-code
 */
export async function GET() {
  try {
    // Lire le fichier emergency-actions.ts déployé
    const filePath = path.join(process.cwd(), 'src', 'actions', 'emergency-actions.ts');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Extraire les lignes 240-270 (zone problématique)
    const lines = fileContent.split('\n');
    const relevantLines = lines.slice(239, 270); // 0-indexed, donc 239 = ligne 240

    return NextResponse.json({
      success: true,
      cwd: process.cwd(),
      nodeVersion: process.version,
      lines240to270: relevantLines.map((line, idx) => `${240 + idx}: ${line}`),
      fullFile: fileContent,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      cwd: process.cwd(),
    });
  }
}
