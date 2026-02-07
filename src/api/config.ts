export const ONLINE_BOOKING_URL_NAME = 'looksbooks';

export function getBaseUrl(): string {
  return import.meta.env.DEV ? 'http://localhost:8888' : '';
}
