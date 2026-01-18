import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import security from 'eslint-plugin-security';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Plugin de sécurité - Détecte les vulnérabilités courantes
  {
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
      // Désactiver quelques règles trop strictes pour Next.js
      'security/detect-object-injection': 'off', // Trop de faux positifs avec TS
    },
  },

  // Plugin d'accessibilité - WCAG compliance
  {
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      // Règles personnalisées
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
    },
  },

  // Règles TypeScript strictes supplémentaires
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Inférence TS
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Fichiers supplémentaires
    'node_modules/**',
    'public/**',
    'scripts/**',
    '*.config.js',
    '*.config.ts',
  ]),
]);

export default eslintConfig;
