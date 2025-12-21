export interface Staff {
  resourceId: string
  name: string
}

export interface Service {
  serviceId: number
  name: string
  length: number
  priceIncludingVat: number
  resourceServices: Staff[]
}

export interface ServiceGroup {
  name: string
  services: Service[]
}

export interface ServicesResponse {
  serviceGroups: ServiceGroup[]
}

export interface TimeSlot {
  startTime: string
  resourceId?: string
}

export interface DateGroup {
  date: string
  timeSlots: TimeSlot[]
}

export interface TimeSlotsResponse {
  dates: DateGroup[]
}

export interface MaskedCustomer {
  id: string
  maskedName: string
  maskedEmail: string
}

export interface ReserveResponse {
  appointmentId: string
  customerPhoneNumber: string
  maskedCustomers?: MaskedCustomer[]
}

export interface ConfirmResponse {
  success: boolean
}

export interface CustomerInfo {
  exists: boolean
  customerId?: string
}
