import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react';
import type {
  BookingState,
  Staff,
  Service,
  ServiceGroup,
  TimeSlot,
  CustomerInfo,
} from '../types/booking';
import { fetchServices } from '../api/booking';
import { getPreviousMonday } from '../utils/date';
import { STAFF_ORDER } from '../config/staff';

// --- Actions ---
type Action =
  | { type: 'SET_SERVICES'; payload: ServiceGroup[] }
  | { type: 'SET_STAFF_LIST'; payload: Staff[] }
  | { type: 'SELECT_STAFF'; payload: Staff | null }
  | { type: 'SELECT_SERVICE'; payload: Service | null }
  | { type: 'SELECT_TIMESLOT'; payload: { date: string; slot: TimeSlot } | null }
  | { type: 'SET_APPOINTMENT'; payload: string }
  | { type: 'SET_CUSTOMER_INFO'; payload: CustomerInfo }
  | { type: 'NAVIGATE_WEEK'; payload: Date }
  | { type: 'RESET' };

const initialState: BookingState = {
  services: [],
  staffList: [],
  selectedStaff: null,
  selectedService: null,
  selectedDate: null,
  selectedTimeSlot: null,
  appointmentId: null,
  customerInfo: null,
  activeSchedule: getPreviousMonday(new Date()),
  isServicesLoaded: false,
};

function bookingReducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'SET_SERVICES':
      return { ...state, services: action.payload, isServicesLoaded: true };
    case 'SET_STAFF_LIST':
      return { ...state, staffList: action.payload };
    case 'SELECT_STAFF':
      return {
        ...state,
        selectedStaff: action.payload,
        selectedService: null,
        selectedDate: null,
        selectedTimeSlot: null,
        appointmentId: null,
        customerInfo: null,
      };
    case 'SELECT_SERVICE':
      return {
        ...state,
        selectedService: action.payload,
        selectedDate: null,
        selectedTimeSlot: null,
        appointmentId: null,
        customerInfo: null,
        activeSchedule: getPreviousMonday(new Date()),
      };
    case 'SELECT_TIMESLOT':
      return {
        ...state,
        selectedDate: action.payload?.date ?? null,
        selectedTimeSlot: action.payload?.slot ?? null,
        appointmentId: null,
        customerInfo: null,
      };
    case 'SET_APPOINTMENT':
      return { ...state, appointmentId: action.payload };
    case 'SET_CUSTOMER_INFO':
      return { ...state, customerInfo: action.payload };
    case 'NAVIGATE_WEEK':
      return { ...state, activeSchedule: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// --- Context ---
const BookingStateContext = createContext<BookingState>(initialState);
const BookingDispatchContext = createContext<Dispatch<Action>>(() => {});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Fetch services on mount and extract unique staff
  useEffect(() => {
    fetchServices()
      .then((data) => {
        dispatch({ type: 'SET_SERVICES', payload: data.serviceGroups });

        // Extract unique staff from services
        const uniqueStaff = new Map<string, Staff>();
        data.serviceGroups.forEach((group) => {
          group.services.forEach((service) => {
            service.resourceServices.forEach((rs) => {
              if (!uniqueStaff.has(rs.resourceId)) {
                uniqueStaff.set(rs.resourceId, {
                  resourceId: rs.resourceId,
                  name: rs.name,
                });
              }
            });
          });
        });

        // Sort staff based on predefined order
        const sortedStaff = Array.from(uniqueStaff.values()).sort((a, b) => {
          const indexA = STAFF_ORDER.indexOf(a.name);
          const indexB = STAFF_ORDER.indexOf(b.name);
          // If name not found in list, put at the end
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        dispatch({
          type: 'SET_STAFF_LIST',
          payload: sortedStaff,
        });
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
      });
  }, []);

  return (
    <BookingStateContext.Provider value={state}>
      <BookingDispatchContext.Provider value={dispatch}>
        {children}
      </BookingDispatchContext.Provider>
    </BookingStateContext.Provider>
  );
}

export function useBookingState() {
  return useContext(BookingStateContext);
}

export function useBookingDispatch() {
  return useContext(BookingDispatchContext);
}
