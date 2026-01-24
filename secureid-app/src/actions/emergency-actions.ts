/**
 * EMERGENCY SERVER ACTIONS - Fichier de rétrocompatibilité
 *
 * Ce fichier réexporte toutes les actions depuis les modules découpés.
 * Pour les nouveaux imports, préférez importer directement depuis:
 * - @/actions/emergency/emergency-pin
 * - @/actions/emergency/emergency-scan
 * - @/actions/emergency/emergency-documents
 *
 * Ou depuis l'index: @/actions/emergency
 */

export {
  // PIN Verification
  verifyDoctorPin,
  type VerifyPinInput,
  type VerifyPinResult,
  // Scan Recording
  recordScan,
  type RecordScanInput,
  type RecordScanResult,
  // Medical Documents
  getMedicalDocuments,
  type MedicalDocument,
  type GetDocumentsInput,
  type GetDocumentsResult,
} from './emergency';
