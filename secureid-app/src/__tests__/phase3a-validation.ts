/**
 * PHASE 3A - TESTS DE VALIDATION
 *
 * Fichier de test pour vérifier que tous les types compilent correctement
 * Ce fichier ne sera pas exécuté, juste compilé par TypeScript
 */

import type { BraceletDocument, BraceletStatus } from '@/types/bracelet';
import type { ProfileDocument, MedicalInfo, EmergencyContact, CreateProfileData } from '@/types/profile';
import type { UserDocument, SignupData, LoginData } from '@/types/user';
import {
  signupSchema,
  loginSchema,
  medicalFormSchema,
  doctorPinSchema,
  type SignupFormData,
  type MedicalFormData,
} from '@/schemas/activation';
import {
  generateEmailFromPhone,
  normalizePhoneNumber,
  formatPhoneForDisplay,
  isValidBurkinaPhone,
} from '@/lib/auth-helpers';

// ============================================================================
// TEST 1: Types Bracelet
// ============================================================================

const testBracelet: BraceletDocument = {
  id: 'BF-0001',
  secretToken: 'abc123',
  status: 'INACTIVE' as BraceletStatus,
  batchId: 'LOT_01',
  createdAt: null,
  linkedUserId: null,
  linkedProfileId: null, // ✅ Phase 3A ajout
};

// Test des nouveaux statuts
const statusTests: BraceletStatus[] = ['INACTIVE', 'ACTIVE', 'STOLEN', 'DEACTIVATED'];

// ============================================================================
// TEST 2: Types Profile
// ============================================================================

const testMedicalInfo: MedicalInfo = {
  bloodType: 'A+',
  allergies: ['Arachides', 'Pénicilline'],
  conditions: ['Asthme'],
  medications: ['Ventoline'],
  notes: 'RAS',
};

const testEmergencyContact: EmergencyContact = {
  name: 'Jean Dupont',
  relationship: 'FATHER',
  phone: '+22672259827',
  priority: 1,
  email: 'jean@example.com',
};

const testProfile: ProfileDocument = {
  id: 'profile-001',
  parentId: 'user-uid-123',
  fullName: 'Moussa Traoré',
  dateOfBirth: null,
  photoUrl: 'https://storage.googleapis.com/...',
  medicalInfo: testMedicalInfo,
  doctorPin: '1234',
  emergencyContacts: [testEmergencyContact],
  currentBraceletId: 'BF-0001',
  status: 'ACTIVE',
  createdAt: null as any,
  updatedAt: null as any,
};

// ============================================================================
// TEST 3: Types User
// ============================================================================

const testUser: UserDocument = {
  uid: 'user-uid-123',
  phoneNumber: '+22672259827',
  generatedEmail: '72259827@secureid.bf',
  displayName: 'Jean Dupont',
  createdAt: null as any,
  lastLoginAt: null,
  profileCount: 1,
};

const testSignupData: SignupData = {
  phoneNumber: '72259827',
  password: 'Password123!',
  displayName: 'Jean Dupont',
};

const testLoginData: LoginData = {
  phoneNumber: '72259827',
  password: 'Password123!',
};

// ============================================================================
// TEST 4: Schemas Zod
// ============================================================================

// Test validation signup
const validSignup: SignupFormData = {
  phoneNumber: '72259827',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  displayName: 'Jean Dupont',
};

// Test validation médical
const validMedical: MedicalFormData = {
  fullName: 'Moussa Traoré',
  dateOfBirth: new Date('2015-01-01'),
  photoUrl: 'https://example.com/photo.jpg',
  bloodType: 'A+',
  allergies: ['Arachides'],
  conditions: [],
  medications: [],
  medicalNotes: 'RAS',
  doctorPin: '1234',
  confirmDoctorPin: '1234',
  emergencyContacts: [
    {
      name: 'Jean Dupont',
      relationship: 'FATHER',
      phone: '+22672259827',
      email: 'jean@example.com',
    },
  ],
};

// ============================================================================
// TEST 5: Helpers Auth
// ============================================================================

// Test génération email
const email1 = generateEmailFromPhone('72259827');
const email2 = generateEmailFromPhone('+22672259827');
const email3 = generateEmailFromPhone('+226 72 25 98 27');
// Tous devraient donner: "72259827@secureid.bf"

// Test normalisation
const norm1 = normalizePhoneNumber('72259827');
const norm2 = normalizePhoneNumber('+22672259827');
// Tous devraient donner: "+22672259827"

// Test formatage
const fmt1 = formatPhoneForDisplay('72259827', 'local');
const fmt2 = formatPhoneForDisplay('72259827', 'international');
const fmt3 = formatPhoneForDisplay('72259827', 'compact');
// Résultats: "72 25 98 27", "+226 72 25 98 27", "72259827"

// Test validation
const valid1 = isValidBurkinaPhone('72259827'); // true
const valid2 = isValidBurkinaPhone('52259827'); // true
const valid3 = isValidBurkinaPhone('92259827'); // false
const valid4 = isValidBurkinaPhone('7225982'); // false

// ============================================================================
// TEST 6: Schémas Zod - Validation runtime
// ============================================================================

try {
  // Test signup valide
  signupSchema.parse(validSignup);
  console.log('✅ Signup schema valide');

  // Test login valide
  loginSchema.parse(testLoginData);
  console.log('✅ Login schema valide');

  // Test médical valide
  medicalFormSchema.parse(validMedical);
  console.log('✅ Medical form schema valide');

  // Test PIN valide
  doctorPinSchema.parse('1234');
  console.log('✅ Doctor PIN schema valide');

  console.log('✅ PHASE 3A - Tous les tests de compilation passés!');
} catch (error) {
  console.error('❌ Erreur de validation Zod:', error);
}

export {};
