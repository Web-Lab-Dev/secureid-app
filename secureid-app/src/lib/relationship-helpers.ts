import type { RelationshipType } from '@/types/profile';

/**
 * Traductions françaises des types de relations
 */
const RELATIONSHIP_TRANSLATIONS: Record<RelationshipType, string> = {
  PARENT: 'Parent',
  MOTHER: 'Mère',
  FATHER: 'Père',
  GUARDIAN: 'Tuteur',
  GRANDPARENT: 'Grand-parent',
  SIBLING: 'Frère/Sœur',
  DOCTOR: 'Médecin',
  OTHER: 'Autre',
};

/**
 * Traduit un type de relation en français
 */
export function translateRelationship(relationship: RelationshipType): string {
  return RELATIONSHIP_TRANSLATIONS[relationship] || relationship;
}
