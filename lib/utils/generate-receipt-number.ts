/**
 * Generates an immutable receipt number based on academic year and sequence number.
 * Format: GCI-{academic_year}-{zero_padded_sequence} (e.g. GCI-2026-000147)
 */
export function generateReceiptNumber(academicYear: string, sequenceNumber: number): string {
  const paddedSequence = String(sequenceNumber).padStart(6, '0');
  // Normalize academic year if it contains spaces or other chars, e.g. "2026-2027"
  const cleanAcademicYear = academicYear.replace(/\s+/g, '');
  return `GCI-${cleanAcademicYear}-${paddedSequence}`;
}
