type AnalyticsEventMap = {
  begin_booking: Record<string, never>;
  select_staff: {
    staff_name: string;
    is_quickest_available: boolean;
  };
  select_service: {
    service_name: string;
    service_id: string;
    service_price: number;
    service_duration: number;
    staff_name: string;
  };
  select_timeslot: {
    staff_name: string;
    service_name: string;
    booking_date: string;
    booking_time: string;
  };
  submit_phone: {
    staff_name: string;
    service_name: string;
    is_returning_customer: boolean;
  };
  booking_confirmed: {
    staff_name: string;
    service_name: string;
    service_price: number;
    service_duration: number;
    booking_date: string;
    booking_time: string;
    is_returning_customer: boolean;
  };
  add_to_calendar: {
    calendar_type: string;
  };
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent<K extends keyof AnalyticsEventMap>(
  ...args: AnalyticsEventMap[K] extends Record<string, never>
    ? [name: K]
    : [name: K, params: AnalyticsEventMap[K]]
): void {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', args[0], args[1] ?? {});
}
