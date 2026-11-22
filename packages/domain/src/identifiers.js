/** Public handles use ASCII lowercase letters, numbers and hyphens. */
export function normalizeIdentifier(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
export function validateIdentifier(value, label, maxLength = 100) {
  if (
    typeof value !== 'string' ||
    !/^[a-z0-9-]+$/.test(value) ||
    !/[a-z0-9]/.test(value) ||
    value.length > maxLength
  )
    throw new Error(
      `${label} must contain lowercase letters or numbers and may use hyphens only (at most ${maxLength} characters)`,
    );
}
