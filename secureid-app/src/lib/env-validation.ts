/**
 * Validation stricte des variables d'environnement au démarrage
 * Permet de détecter les configurations manquantes dès le build/startup
 */

interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
}

// Variables d'environnement requises pour l'application
const ENV_VARS: EnvVarConfig[] = [
  // Firebase Client SDK (Public)
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    description: 'Firebase API Key (public)',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    description: 'Firebase Auth Domain',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    description: 'Firebase Project ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    required: true,
    description: 'Firebase Storage Bucket',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    required: true,
    description: 'Firebase Messaging Sender ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    required: true,
    description: 'Firebase App ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
    required: true,
    description: 'Firebase VAPID Key (pour push notifications)',
  },

  // Firebase Admin SDK (Private - Server only)
  {
    name: 'FIREBASE_ADMIN_CLIENT_EMAIL',
    required: true,
    description: 'Firebase Admin Service Account Email',
  },
  {
    name: 'FIREBASE_ADMIN_PRIVATE_KEY',
    required: true,
    description: 'Firebase Admin Private Key',
  },

  // SMTP (Optionnel selon features)
  {
    name: 'SMTP_USER',
    required: false,
    description: 'SMTP User pour envoi emails',
  },
  {
    name: 'SMTP_PASS',
    required: false,
    description: 'SMTP Password',
  },

  // App Configuration
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'URL publique de l\'application',
  },
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Valide que toutes les variables d'environnement requises sont présentes
 */
export function validateEnvVars(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push(`${envVar.name} - ${envVar.description}`);
      } else {
        warnings.push(`${envVar.name} - ${envVar.description} (optionnel)`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Valide et throw une erreur si des variables critiques manquent
 * À appeler au démarrage de l'application
 */
export function validateEnvVarsOrThrow(): void {
  const result = validateEnvVars();

  if (!result.valid) {
    const errorMessage = [
      '❌ ERREUR: Variables d\'environnement manquantes',
      '',
      'Variables requises manquantes:',
      ...result.missing.map((m) => `  - ${m}`),
      '',
      'Consultez .env.example pour la configuration complète',
    ].join('\n');

    console.error(errorMessage);
    throw new Error('Missing required environment variables');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Variables d\'environnement optionnelles manquantes:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  console.log('✅ Variables d\'environnement validées avec succès');
}

/**
 * Helper pour obtenir une variable d'environnement avec validation
 */
export function getEnvVar(name: string, required = true): string {
  const value = process.env[name];

  if (!value && required) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }

  return value || '';
}
