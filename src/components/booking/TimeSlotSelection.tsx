import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBookingState, useBookingDispatch } from '../../context/BookingContext';
import { fetchTimeSlots } from '../../api/booking';
import {
  addDays,
  getDayShortName,
  getMonthShortName,
  getWeekNumber,
  toISODateString,
} from '../../utils/date';
import type { TimeSlotsResponse, TimeSlot } from '../../types/booking';

export default function TimeSlotSelection() {
  const { selectedStaff, selectedService, selectedTimeSlot, selectedDate, activeSchedule } =
    useBookingState();
  const dispatch = useBookingDispatch();
  const [slotsData, setSlotsData] = useState<TimeSlotsResponse | null>(null);
  const prefetchedRef = useRef<{ data: TimeSlotsResponse; weekStart: Date } | null>(null);

  const fetchWeek = useCallback(
    async (weekStart: Date): Promise<TimeSlotsResponse> => {
      if (!selectedStaff || !selectedService) throw new Error('Missing staff/service');
      return fetchTimeSlots({
        dateStart: toISODateString(weekStart),
        dateStop: toISODateString(addDays(weekStart, 6)),
        serviceIds: selectedService.serviceId,
        resourceIds: [selectedStaff.resourceId],
      });
    },
    [selectedStaff, selectedService],
  );

  useEffect(() => {
    if (!selectedStaff || !selectedService) return;
    let cancelled = false;

    fetchWeek(activeSchedule)
      .then((data) => {
        if (cancelled) return;
        setSlotsData(data);
        const nextWeek = addDays(activeSchedule, 7);
        fetchWeek(nextWeek)
          .then((nextData) => {
            if (!cancelled) prefetchedRef.current = { data: nextData, weekStart: nextWeek };
          })
          .catch(console.error);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      setSlotsData(null);
    };
  }, [activeSchedule, selectedStaff, selectedService, fetchWeek]);

  const canGoBackward = (() => {
    const currentMonday = new Date();
    const day = currentMonday.getDay();
    const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1);
    currentMonday.setDate(diff);
    currentMonday.setHours(0, 0, 0, 0);
    return activeSchedule > currentMonday;
  })();

  function handleForward() {
    if (prefetchedRef.current) {
      const { data, weekStart } = prefetchedRef.current;
      prefetchedRef.current = null;
      dispatch({ type: 'NAVIGATE_WEEK', payload: weekStart });
      setSlotsData(data);
    } else {
      dispatch({ type: 'NAVIGATE_WEEK', payload: addDays(activeSchedule, 7) });
    }
  }

  function handleBackward() {
    if (!canGoBackward) return;
    prefetchedRef.current = null;
    dispatch({ type: 'NAVIGATE_WEEK', payload: addDays(activeSchedule, -7) });
  }

  function handleSlotClick(date: string, slot: TimeSlot) {
    dispatch({ type: 'SELECT_TIMESLOT', payload: { date, slot } });
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(activeSchedule, i));
  const weekEnd = addDays(activeSchedule, 6);
  const hasAnySlots =
    slotsData?.dates.some((dg) => dg.timeSlots && dg.timeSlots.length > 0) ?? false;

  return (
    <div className="flex flex-col w-full">
      <h2>Vilken tid passar dig?</h2>
      <hr />
      <div className="py-6 w-full box-border">
        {/* Week navigation */}
        <div className="flex items-center justify-center gap-4 mb-6 max-md:mb-0">
          <a
            className={cn(
              "flex items-center text-black cursor-pointer transition-opacity duration-200 hover:opacity-70",
              !canGoBackward && "cursor-not-allowed opacity-30 pointer-events-none"
            )}
            onClick={handleBackward}
          >
            <ChevronLeft size={24} />
          </a>
          <div className="flex flex-col items-center justify-center">
            <h2>Vecka {getWeekNumber(activeSchedule)}</h2>
            <p className="m-0">
              {activeSchedule.getDate()} {getMonthShortName(activeSchedule)} -{' '}
              {weekEnd.getDate()} {getMonthShortName(weekEnd)}
            </p>
          </div>
          <a
            className="flex items-center text-black cursor-pointer transition-opacity duration-200 hover:opacity-70"
            onClick={handleForward}
          >
            <ChevronRight size={24} />
          </a>
        </div>

        {/* Time slots grid */}
        <div className="flex flex-row justify-start gap-4 overflow-x-auto overflow-y-hidden w-full [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-[max(1.25rem,calc(50%-24rem))] py-5 box-border max-md:gap-2 max-md:gap-0.5">
          {days.map((day) => {
            const dateStr = toISODateString(day);
            const dateGroup = slotsData?.dates.find(
              (dg) => toISODateString(new Date(dg.date)) === dateStr,
            );
            const slots = dateGroup?.timeSlots ?? [];
            const noSlots = slots.length === 0;

            return (
              <div key={dateStr} className="flex flex-col gap-3 max-md:gap-2">
                <div
                  className={cn(
                    "flex items-center justify-center flex-col w-24 h-24 bg-secondary text-brand-white rounded-lg max-md:w-20 max-md:h-20",
                    noSlots && "[&_h2]:text-primary [&_p]:text-primary"
                  )}
                >
                  <h2 className="max-md:text-xl">{getDayShortName(day)}</h2>
                  <p className="max-md:text-sm">
                    {day.getDate()} {getMonthShortName(day)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {slots.map((slot) => {
                    const isActive =
                      selectedDate === dateGroup?.date &&
                      selectedTimeSlot?.startTime === slot.startTime;

                    return (
                      <div
                        key={slot.startTime}
                        className={cn(
                          "bg-primary text-secondary border-2 border-secondary rounded-lg transition-all duration-200 cursor-pointer text-center p-2 hover:bg-secondary hover:text-brand-white",
                          isActive && "bg-secondary text-brand-white"
                        )}
                        onClick={() => handleSlotClick(dateGroup!.date, slot)}
                      >
                        <p className="m-0">{slot.startTime}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {slotsData && !hasAnySlots && (
          <div className="text-center p-4">
            <p>Inga lediga tider denna vecka</p>
          </div>
        )}
      </div>
    </div>
  );
}
