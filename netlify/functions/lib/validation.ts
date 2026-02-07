/**
 * Zod validation schemas for all API endpoints.
 *
 * These validate incoming data BEFORE it reaches EasyCashier,
 * providing clear error messages and protecting against bad input.
 * Zod strips unrecognized keys by default, so client-sent
 * onlineBookingUrlName is safely removed (the adapter injects it from config).
 */

import { z } from 'zod';

// ── Shared field validators ───────────────────────────────────────

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format');

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Expected HH:MM format');

const phoneString = z
  .string()
  .min(5, 'Phone number too short');

// ── Endpoint schemas ──────────────────────────────────────────────

/** GET /timeslots — query parameters */
export const timeSlotsQuerySchema = z.object({
  dateStart: dateString,
  dateStop: dateString,
  serviceIds: z.string().min(1, 'serviceIds is required'),
  resourceIds: z
    .array(z.string().min(1))
    .min(1, 'At least one resourceId is required'),
});

/** POST /reserve — request body */
export const reserveBodySchema = z.object({
  resourceIds: z.array(z.string().min(1)).min(1),
  serviceIds: z.array(z.union([z.string(), z.number()]).transform(String)).min(1),
  startDate: dateString,
  startTime: timeString,
  customerPhoneNumber: phoneString,
});

/** POST /confirm — request body */
export const confirmBodySchema = z.object({
  appointmentId: z.string().min(1),
  customerPhoneNumber: phoneString,
  termsAndConditionsApproved: z.literal(true, 'Terms and conditions must be accepted'),
  customerName: z.string().optional(),
  customerEmail: z
    .union([z.string().email(), z.literal('')])
    .optional(),
  customerId: z.string().optional(),
  notes: z.string().optional(),
});

// ── Inferred types ────────────────────────────────────────────────

export type TimeSlotsQuery = z.infer<typeof timeSlotsQuerySchema>;
export type ReserveBody = z.infer<typeof reserveBodySchema>;
export type ConfirmBody = z.infer<typeof confirmBodySchema>;
