/**
 * Centralized configuration for all Netlify Functions.
 * All environment-driven values live here with sensible defaults.
 *
 * To override in production, set environment variables in the Netlify dashboard.
 */

const env = process.env;

export const config = {
  easycashier: {
    baseUrl:
      env.EASYCASHIER_BASE_URL ||
      'https://boka.easycashier.se/v1/open/calendar/onlineBooking',
    bookingUrlName: env.ONLINE_BOOKING_URL_NAME || 'looksbooks',
  },
  http: {
    timeoutMs: Number(env.REQUEST_TIMEOUT_MS) || 8000,
    maxRetries: Number(env.MAX_RETRIES) || 2,
  },
  cors: {
    allowedOrigins: (
      env.ALLOWED_ORIGINS ||
      'https://looksandbooks.se,https://www.looksandbooks.se'
    ).split(','),
  },
} as const;
