/**
 * Date utility functions shared across the application
 */

/**
 * Calculate age from a date of birth
 * Handles Date objects, strings, and Firestore Timestamps
 *
 * @param dateOfBirth - Date of birth (Date, string, or object with toDate method)
 * @returns Age in years, or null if invalid date
 */
export function calculateAge(dateOfBirth: Date | string | { toDate: () => Date } | null | undefined): number | null {
  if (!dateOfBirth) return null;

  let birthDate: Date;

  // Handle Firestore Timestamp (has toDate method)
  if (typeof dateOfBirth === 'object' && 'toDate' in dateOfBirth && typeof dateOfBirth.toDate === 'function') {
    birthDate = dateOfBirth.toDate();
  } else if (typeof dateOfBirth === 'string') {
    birthDate = new Date(dateOfBirth);
  } else if (dateOfBirth instanceof Date) {
    birthDate = dateOfBirth;
  } else {
    return null;
  }

  // Validate the date
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

/**
 * Format a date for display in French locale
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateFr(
  date: Date | string | { toDate: () => Date } | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  if (!date) return '';

  let dateObj: Date;

  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return '';
  }

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('fr-FR', options);
}
