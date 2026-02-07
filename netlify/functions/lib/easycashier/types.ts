/**
 * Raw EasyCashier (Bokadirekt) API types.
 *
 * These map directly to the EasyCashier API request/response shapes.
 * Update ONLY when EasyCashier changes their API contract.
 * The adapter layer translates between these and our internal types.
 */

// ── Services ──────────────────────────────────────────────────────

export interface ECResourceService {
  resourceId: string;
  name: string;
}

export interface ECService {
  serviceId: string;
  name: string;
  length: number;
  priceIncludingVat: number;
  resourceServices: ECResourceService[];
}

export interface ECServiceGroup {
  services: ECService[];
}

export interface ECServicesResponse {
  serviceGroups: ECServiceGroup[];
}

// ── Time Slots ────────────────────────────────────────────────────

export interface ECTimeSlot {
  startTime: string;
  resourceId?: string;
}

export interface ECDateGroup {
  date: string;
  timeSlots: ECTimeSlot[];
}

export interface ECTimeSlotsResponse {
  dates: ECDateGroup[];
}

// ── Reserve ───────────────────────────────────────────────────────

export interface ECReserveRequest {
  onlineBookingUrlName: string;
  resourceIds: string[];
  serviceIds: string[];
  startDate: string;
  startTime: string;
  customerPhoneNumber: string;
}

export interface ECMaskedCustomer {
  id: string;
  maskedName: string;
  maskedEmail: string;
}

export interface ECReserveResponse {
  appointmentId: string;
  customerPhoneNumber: string;
  maskedCustomers?: ECMaskedCustomer[];
}

// ── Confirm ───────────────────────────────────────────────────────

export interface ECConfirmRequest {
  onlineBookingUrlName: string;
  appointmentId: string;
  customerPhoneNumber: string;
  termsAndConditionsApproved: boolean;
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  notes?: string;
}

export interface ECConfirmResponse {
  [key: string]: unknown;
}
