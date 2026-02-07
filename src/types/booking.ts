export interface Staff {
  resourceId: string;
  name: string;
}

export interface ResourceService {
  resourceId: string;
  name: string;
}

export interface Service {
  serviceId: number;
  name: string;
  length: number;
  priceIncludingVat: number;
  resourceServices: ResourceService[];
}

export interface ServiceGroup {
  services: Service[];
}

export interface TimeSlot {
  startTime: string;
  resourceId?: string;
}

export interface DateGroup {
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlotsResponse {
  dates: DateGroup[];
}

export interface MaskedCustomer {
  id: string;
  maskedName: string;
  maskedEmail: string;
}

export interface ReserveRequest {
  onlineBookingUrlName: string;
  resourceIds: string[];
  serviceIds: number[];
  startDate: string;
  startTime: string;
  customerPhoneNumber: string;
}

export interface ReserveResponse {
  appointmentId: string;
  customerPhoneNumber: string;
  maskedCustomers?: MaskedCustomer[];
}

export interface ConfirmRequest {
  onlineBookingUrlName: string;
  appointmentId: string;
  customerPhoneNumber: string;
  termsAndConditionsApproved: boolean;
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  notes?: string;
}

export interface ConfirmResponse {
  success: boolean;
}

export interface ServicesResponse {
  serviceGroups: ServiceGroup[];
}

export interface CustomerInfo {
  exists: boolean;
  customerId?: string;
}

export type BookingStep = 'who' | 'what' | 'when' | 'summary' | 'complete';

export interface BookingState {
  services: ServiceGroup[];
  staffList: Staff[];
  selectedStaff: Staff | null;
  selectedService: Service | null;
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  appointmentId: string | null;
  customerInfo: CustomerInfo | null;
  activeSchedule: Date;
  isServicesLoaded: boolean;
}
