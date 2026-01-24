/**
 * EMERGENCY SERVER ACTIONS - Point d'entrée modulaire
 *
 * Ce module regroupe toutes les opérations d'urgence:
 * - emergency-pin.ts: Validation PIN médecin avec rate limiting
 * - emergency-scan.ts: Enregistrement scans GPS
 * - emergency-documents.ts: Récupération documents médicaux
 */

// PIN Verification
export {
  verifyDoctorPin,
  type VerifyPinInput,
  type VerifyPinResult,
} from './emergency-pin';

// Scan Recording
export {
  recordScan,
  type RecordScanInput,
  type RecordScanResult,
} from './emergency-scan';

// Medical Documents
export {
  getMedicalDocuments,
  type MedicalDocument,
  type GetDocumentsInput,
  type GetDocumentsResult,
} from './emergency-documents';
