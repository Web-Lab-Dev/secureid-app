/**
 * CONSTANTES MÉDICALES PARTAGÉES
 *
 * Utilisé par MedicalForm et MedicalFormEdit
 */

export const BLOOD_TYPES = [
  { value: 'UNKNOWN', label: 'Non renseigné' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
] as const;

export const RELATIONSHIPS = [
  { value: 'MOTHER', label: 'Mère' },
  { value: 'FATHER', label: 'Père' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'GUARDIAN', label: 'Tuteur' },
  { value: 'GUARDIANESS', label: 'Tutrice' },
  { value: 'GRANDFATHER', label: 'Grand-père' },
  { value: 'GRANDMOTHER', label: 'Grand-mère' },
  { value: 'BROTHER', label: 'Frère' },
  { value: 'SISTER', label: 'Sœur' },
  { value: 'UNCLE', label: 'Oncle' },
  { value: 'AUNT', label: 'Tante' },
  { value: 'DOCTOR', label: 'Médecin' },
  { value: 'OTHER', label: 'Autre' },
] as const;
