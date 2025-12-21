import { create } from 'zustand'
import type { Staff, Service, TimeSlot, ServiceGroup, CustomerInfo } from '@/services/api/types'

interface BookingState {
  // Data
  serviceGroups: ServiceGroup[]
  isServicesLoaded: boolean

  // Selections
  selectedStaff: Staff | null
  selectedService: Service | null
  selectedDate: string | null
  selectedTimeSlot: TimeSlot | null

  // Booking process
  appointmentId: string | null
  customerInfo: CustomerInfo | null
  phoneNumber: string | null

  // UI state
  currentStep: 'staff' | 'service' | 'time' | 'summary' | 'complete'

  // Actions
  setServiceGroups: (groups: ServiceGroup[]) => void
  setServicesLoaded: (loaded: boolean) => void
  selectStaff: (staff: Staff | null) => void
  selectService: (service: Service | null) => void
  selectTimeSlot: (date: string, slot: TimeSlot) => void
  setAppointmentId: (id: string) => void
  setCustomerInfo: (info: CustomerInfo) => void
  setPhoneNumber: (phone: string) => void
  setCurrentStep: (step: BookingState['currentStep']) => void
  reset: () => void
}

const initialState = {
  serviceGroups: [],
  isServicesLoaded: false,
  selectedStaff: null,
  selectedService: null,
  selectedDate: null,
  selectedTimeSlot: null,
  appointmentId: null,
  customerInfo: null,
  phoneNumber: null,
  currentStep: 'staff' as const,
}

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setServiceGroups: (groups) => set({ serviceGroups: groups }),
  setServicesLoaded: (loaded) => set({ isServicesLoaded: loaded }),

  selectStaff: (staff) =>
    set({
      selectedStaff: staff,
      selectedService: null,
      selectedDate: null,
      selectedTimeSlot: null,
      currentStep: staff ? 'service' : 'staff',
    }),

  selectService: (service) =>
    set({
      selectedService: service,
      selectedDate: null,
      selectedTimeSlot: null,
      currentStep: service ? 'time' : 'service',
    }),

  selectTimeSlot: (date, slot) =>
    set({
      selectedDate: date,
      selectedTimeSlot: slot,
      currentStep: 'summary',
    }),

  setAppointmentId: (id) => set({ appointmentId: id }),
  setCustomerInfo: (info) => set({ customerInfo: info }),
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setCurrentStep: (step) => set({ currentStep: step }),

  reset: () => set(initialState),
}))
