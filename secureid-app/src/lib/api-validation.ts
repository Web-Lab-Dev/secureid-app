import { z } from 'zod';

/**
 * SCHÉMAS DE VALIDATION ZOD - ROUTES API
 *
 * Validation stricte des données entrantes pour prévenir:
 * - Injection de contenu malveillant
 * - Données corrompues ou malformées
 * - Attaques par débordement de buffer
 */

// ============================================================================
// SCHÉMA: Route /api/order (Commandes bracelets)
// ============================================================================

export const OrderSchema = z.object({
  // ID commande: Format ORD-YYYYMMDD-XXX
  orderId: z
    .string()
    .regex(/^ORD-\d{8}-\d{3}$/, 'Format ID invalide (attendu: ORD-YYYYMMDD-XXX)'),

  // Nom client: 2-100 caractères, lettres/espaces/accents
  customerName: z
    .string()
    .min(2, 'Nom trop court (min 2 caractères)')
    .max(100, 'Nom trop long (max 100 caractères)')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Nom invalide (lettres, espaces, tirets et apostrophes uniquement)'
    ),

  // Téléphone: Format Burkina Faso +226XXXXXXXX
  customerPhone: z
    .string()
    .regex(
      /^\+226\d{8}$/,
      'Numéro invalide (format attendu: +226XXXXXXXX)'
    ),

  // Quantité: Entre 1 et 100 bracelets
  quantity: z
    .number()
    .int('Quantité doit être un nombre entier')
    .min(1, 'Minimum 1 bracelet')
    .max(100, 'Maximum 100 bracelets par commande'),

  // Prix unitaire: Entier positif (FCFA)
  pricePerBracelet: z
    .number()
    .int('Prix doit être un nombre entier')
    .positive('Prix doit être positif')
    .max(1000000, 'Prix unitaire trop élevé'),

  // Montant total: Cohérent avec quantité * prix
  totalAmount: z
    .number()
    .int('Montant total doit être un nombre entier')
    .positive('Montant total doit être positif')
    .max(100000000, 'Montant total trop élevé'),

  // Adresse livraison: 10-500 caractères
  deliveryAddress: z
    .string()
    .min(10, 'Adresse trop courte (min 10 caractères)')
    .max(500, 'Adresse trop longue (max 500 caractères)'),

  // Coordonnées GPS: Optionnelles mais validées si présentes
  gpsLocation: z
    .object({
      lat: z
        .number()
        .min(-90, 'Latitude invalide')
        .max(90, 'Latitude invalide'),
      lng: z
        .number()
        .min(-180, 'Longitude invalide')
        .max(180, 'Longitude invalide'),
    })
    .optional(),

  // Notes livraison: Optionnelles, max 1000 caractères
  deliveryNotes: z
    .string()
    .max(1000, 'Notes trop longues (max 1000 caractères)')
    .optional(),
}).refine(
  (data) => data.totalAmount === data.quantity * data.pricePerBracelet,
  {
    message: 'Montant total incohérent (doit être quantité × prix unitaire)',
    path: ['totalAmount'],
  }
);

export type OrderInput = z.infer<typeof OrderSchema>;

// ============================================================================
// SCHÉMA: Route /api/partnership (Demandes de partenariat)
// ============================================================================

export const PartnershipSchema = z.object({
  // Nom établissement: 3-200 caractères
  etablissement: z
    .string()
    .min(3, 'Nom établissement trop court (min 3 caractères)')
    .max(200, 'Nom établissement trop long (max 200 caractères)'),

  // Type établissement: Enum strict
  type: z.enum(['ecole', 'garderie', 'centre', 'autre']),

  // Nom responsable: 2-100 caractères
  responsable: z
    .string()
    .min(2, 'Nom responsable trop court (min 2 caractères)')
    .max(100, 'Nom responsable trop long (max 100 caractères)')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Nom invalide (lettres, espaces, tirets et apostrophes uniquement)'
    ),

  // Email: Validation RFC 5322 (via Zod)
  email: z
    .string()
    .email('Email invalide')
    .max(254, 'Email trop long (max 254 caractères)'),

  // Téléphone: Optionnel mais validé si présent (format international)
  telephone: z
    .string()
    .regex(
      /^\+\d{1,3}\d{6,14}$/,
      'Numéro invalide (format international: +XXXXXXXXXXX)'
    )
    .optional()
    .or(z.literal('')),

  // Ville: 2-100 caractères
  ville: z
    .string()
    .min(2, 'Ville trop courte (min 2 caractères)')
    .max(100, 'Ville trop longue (max 100 caractères)'),

  // Nombre élèves: Optionnel, entre 1 et 10000
  nombreEleves: z
    .number()
    .int('Nombre élèves doit être un entier')
    .min(1, 'Minimum 1 élève')
    .max(10000, 'Maximum 10000 élèves')
    .optional()
    .or(z.literal(0)),

  // Message: Optionnel, max 2000 caractères
  message: z
    .string()
    .max(2000, 'Message trop long (max 2000 caractères)')
    .optional()
    .or(z.literal('')),
});

export type PartnershipInput = z.infer<typeof PartnershipSchema>;

// ============================================================================
// FONCTION UTILITAIRE: Validation avec gestion d'erreurs
// ============================================================================

/**
 * Valide des données contre un schéma Zod
 *
 * @param schema - Schéma Zod à utiliser
 * @param data - Données à valider
 * @returns Résultat de validation avec données typées ou erreurs
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Extraire les messages d'erreur lisibles
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });

  return { success: false, errors };
}
