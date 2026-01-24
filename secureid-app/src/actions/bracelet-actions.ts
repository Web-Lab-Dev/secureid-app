/**
 * BRACELET SERVER ACTIONS - Fichier de rétrocompatibilité
 *
 * Ce fichier réexporte toutes les actions depuis les modules découpés.
 * Pour les nouveaux imports, préférez importer directement depuis:
 * - @/actions/bracelet/bracelet-validation
 * - @/actions/bracelet/bracelet-linking
 * - @/actions/bracelet/bracelet-status
 * - @/actions/bracelet/bracelet-queries
 *
 * Ou depuis l'index: @/actions/bracelet
 */

export {
  // Validation
  validateBraceletToken,
  type ValidateBraceletTokenInput,
  type ValidateBraceletTokenResult,
  // Linking
  linkBraceletToProfile,
  transferBracelet,
  unlinkBracelet,
  type LinkBraceletToProfileInput,
  type LinkBraceletToProfileResult,
  type TransferBraceletInput,
  type TransferBraceletResult,
  type UnlinkBraceletInput,
  type UnlinkBraceletResult,
  // Status
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
  // Queries
  getBraceletsByProfileIds,
  getRecentScans,
  type GetBraceletsByProfileIdsInput,
  type GetBraceletsByProfileIdsResult,
  type GetRecentScansInput,
  type GetRecentScansResult,
  type ScanData,
} from './bracelet';

// Schemas (non-server action exports)
export { braceletIdSchema, secretTokenSchema } from '@/lib/bracelet-schemas';
