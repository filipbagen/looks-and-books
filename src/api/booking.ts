import { getBaseUrl, ONLINE_BOOKING_URL_NAME } from './config';
import type {
  ServicesResponse,
  TimeSlotsResponse,
  ReserveRequest,
  ReserveResponse,
  ConfirmRequest,
  ConfirmResponse,
} from '../types/booking';

const baseUrl = () => getBaseUrl();

export async function fetchServices(): Promise<ServicesResponse> {
  const response = await fetch(`${baseUrl()}/services`);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
}

export async function fetchTimeSlots(params: {
  dateStart: string;
  dateStop: string;
  serviceIds: string;
  resourceIds: string[];
}): Promise<TimeSlotsResponse> {
  const searchParams = new URLSearchParams({
    dateStart: params.dateStart,
    dateStop: params.dateStop,
    onlineBookingUrlName: ONLINE_BOOKING_URL_NAME,
    serviceIds: params.serviceIds,
  });

  params.resourceIds.forEach((id) => {
    searchParams.append('resourceIds', id);
  });

  const response = await fetch(`${baseUrl()}/timeslots?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch time slots');
  }
  return response.json();
}

export async function reserveTimeSlot(
  body: ReserveRequest,
): Promise<ReserveResponse> {
  const response = await fetch(`${baseUrl()}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.error?.message || 'Reservation failed',
    );
  }
  return response.json();
}

export async function confirmBooking(
  body: ConfirmRequest,
): Promise<ConfirmResponse> {
  const response = await fetch(`${baseUrl()}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.error?.message || 'Booking failed',
    );
  }
  return response.json();
}
