/**
 * Validate a Swedish phone number.
 * Accepts formats starting with 0 (10 digits) or 46 (11 digits) or +46.
 */
export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.startsWith('+46')) {
    return /^\+46\d{9}$/.test(trimmed);
  }
  if (trimmed.startsWith('0')) {
    return /^\d{10}$/.test(trimmed);
  }
  if (trimmed.startsWith('46')) {
    return /^\d{11}$/.test(trimmed);
  }
  return false;
}

/**
 * Convert a phone number to international format (46...).
 */
export function toInternationalFormat(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+46')) {
    return '46' + trimmed.slice(3);
  }
  if (trimmed.startsWith('0')) {
    return '46' + trimmed.slice(1);
  }
  return trimmed;
}
