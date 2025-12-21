import { API_CONFIG } from '@/utils/constants'
import type {
  ServicesResponse,
  TimeSlotsResponse,
  ReserveResponse,
  ConfirmResponse,
} from './types'

const { baseUrl, onlineBookingUrlName } = API_CONFIG

export async function fetchServices(): Promise<ServicesResponse> {
  const response = await fetch(`${baseUrl}/api/services`)
  if (!response.ok) {
    throw new Error('Failed to fetch services')
  }
  return response.json() as Promise<ServicesResponse>
}

export async function fetchTimeSlots(
  resourceIds: string[],
  serviceId: number,
  dateStart: string,
  dateStop: string
): Promise<TimeSlotsResponse> {
  const params = new URLSearchParams({
    dateStart,
    dateStop,
    onlineBookingUrlName,
    serviceIds: serviceId.toString(),
  })

  resourceIds.forEach((id) => {
    params.append('resourceIds', id)
  })

  const response = await fetch(`${baseUrl}/api/timeslots?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch time slots')
  }
  return response.json() as Promise<TimeSlotsResponse>
}

export async function reserveTimeSlot(data: {
  resourceIds: string[]
  serviceIds: number[]
  startDate: string
  startTime: string
  customerPhoneNumber: string
}): Promise<ReserveResponse> {
  const response = await fetch(`${baseUrl}/api/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      onlineBookingUrlName,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.error?.message || 'Reservation failed')
  }

  return response.json() as Promise<ReserveResponse>
}

export async function confirmBooking(data: {
  appointmentId: string
  customerPhoneNumber: string
  customerName?: string
  customerEmail?: string
  customerId?: string
  notes?: string
}): Promise<ConfirmResponse> {
  const response = await fetch(`${baseUrl}/api/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      onlineBookingUrlName,
      termsAndConditionsApproved: true,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.error?.message || 'Booking failed')
  }

  return response.json() as Promise<ConfirmResponse>
}
