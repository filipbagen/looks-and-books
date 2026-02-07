/**
 * EasyCashier adapter — the anti-corruption layer.
 *
 * All EasyCashier-specific logic is isolated here:
 * - URL paths (e.g. /getServices, /reserveTimeSlot)
 * - The onlineBookingUrlName config value
 * - Request/response shape mapping
 *
 * When Bokadirekt changes their API, update ONLY this file
 * (and types.ts if the shapes change). Handlers and frontend stay untouched.
 */

import { client } from './client';
import { config } from '../config';
import type {
  ECServicesResponse,
  ECTimeSlotsResponse,
  ECReserveResponse,
  ECConfirmResponse,
} from './types';

// ── Internal param types (what handlers pass in) ──────────────────

export interface TimeSlotsParams {
  dateStart: string;
  dateStop: string;
  serviceIds: string;
  resourceIds: string[];
}

export interface ReserveParams {
  resourceIds: string[];
  serviceIds: string[];
  startDate: string;
  startTime: string;
  customerPhoneNumber: string;
}

export interface ConfirmParams {
  appointmentId: string;
  customerPhoneNumber: string;
  termsAndConditionsApproved: boolean;
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  notes?: string;
}

// ── Re-export response types ──────────────────────────────────────
// Today these are 1:1 with EasyCashier types.
// The adapter lets us diverge in the future without touching handlers.

export type { ECServicesResponse as ServicesResponse } from './types';
export type { ECTimeSlotsResponse as TimeSlotsResponse } from './types';
export type { ECReserveResponse as ReserveResponse } from './types';
export type { ECConfirmResponse as ConfirmResponse } from './types';

// ── Adapter ───────────────────────────────────────────────────────

const bookingUrlName = config.easycashier.bookingUrlName;

export const adapter = {
  /** Fetch the full service catalog (staff + services). */
  async getServices(): Promise<ECServicesResponse> {
    return client.get<ECServicesResponse>('/getServices', {
      onlineBookingUrlName: bookingUrlName,
    });
  },

  /** Fetch available time slots for a given week / staff / service. */
  async getTimeSlots(params: TimeSlotsParams): Promise<ECTimeSlotsResponse> {
    return client.get<ECTimeSlotsResponse>('/getAvailableTimeSlots', {
      dateStart: params.dateStart,
      dateStop: params.dateStop,
      onlineBookingUrlName: bookingUrlName,
      serviceIds: params.serviceIds,
      resourceIds: params.resourceIds,
    });
  },

  /** Reserve a time slot (step 1 of the two-phase booking). */
  async reserveTimeSlot(params: ReserveParams): Promise<ECReserveResponse> {
    return client.post<ECReserveResponse>('/reserveTimeSlot', {
      ...params,
      onlineBookingUrlName: bookingUrlName,
    });
  },

  /** Confirm a reservation (step 2 of the two-phase booking). */
  async confirmBooking(params: ConfirmParams): Promise<ECConfirmResponse> {
    return client.post<ECConfirmResponse>('/confirmOnlineBooking', {
      ...params,
      onlineBookingUrlName: bookingUrlName,
    });
  },
};
