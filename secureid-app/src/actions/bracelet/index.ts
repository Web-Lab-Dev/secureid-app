/**
 * BRACELET SERVER ACTIONS - Point d'entrée modulaire
 *
 * Ce module regroupe toutes les opérations côté serveur liées aux bracelets.
 * Découpé en sous-modules pour une meilleure maintenabilité:
 *
 * - bracelet-validation.ts: Validation tokens et formats
 * - bracelet-linking.ts: Liaison, transfert, déliaison
 * - bracelet-status.ts: Gestion des statuts (LOST, STOLEN, ACTIVE)
 * - bracelet-queries.ts: Requêtes de lecture (bracelets, scans)
 *
 * @see {@link https://firebase.google.com/docs/firestore/manage-data/transactions Transactions Firestore}
 */

// Validation
export {
  validateBraceletToken,
  type ValidateBraceletTokenInput,
  type ValidateBraceletTokenResult,
} from './bracelet-validation';

// Schemas (re-export from lib for convenience)
export { braceletIdSchema, secretTokenSchema } from '@/lib/bracelet-schemas';

// Linking
export {
  linkBraceletToProfile,
  transferBracelet,
  unlinkBracelet,
  type LinkBraceletToProfileInput,
  type LinkBraceletToProfileResult,
  type TransferBraceletInput,
  type TransferBraceletResult,
  type UnlinkBraceletInput,
  type UnlinkBraceletResult,
} from './bracelet-linking';

// Status
export {
  updateBraceletStatus,
  reportBraceletLost,
  reportBraceletStolen,
  reactivateBracelet,
  getOwnerContact,
  type UpdateBraceletStatusInput,
  type UpdateBraceletStatusResult,
  type ReportBraceletInput,
  type ReportBraceletResult,
  type GetOwnerContactInput,
  type GetOwnerContactResult,
} from './bracelet-status';

// Queries
export {
  getBraceletsByProfileIds,
  getRecentScans,
  type GetBraceletsByProfileIdsInput,
  type GetBraceletsByProfileIdsResult,
  type GetRecentScansInput,
  type GetRecentScansResult,
  type ScanData,
} from './bracelet-queries';
