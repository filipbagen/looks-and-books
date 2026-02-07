export const ONLINE_BOOKING_URL_NAME = 'looksbooks';

export function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8888';
  }
  return '';
}
