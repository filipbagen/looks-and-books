import { useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { ics } from 'calendar-link';
import Checkmark from '../ui/Checkmark';
import { useBookingState } from '../../context/BookingContext';
import { isQuickestAvailable } from '../../config/staff';
import { formatDateWord } from '../../utils/date';

export default function BookingComplete() {
  const { selectedStaff, selectedService, selectedDate, selectedTimeSlot } =
    useBookingState();

  const staffLabel = isQuickestAvailable(selectedStaff) ? 'Looks & Books' : selectedStaff?.name;

  const handleCalendar = useCallback(() => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTimeSlot) return;

    const calendarEvent: Record<string, unknown> = {
      title: `${selectedService.name} hos ${staffLabel}`,
      start: `${selectedDate} ${selectedTimeSlot.startTime}:00 +0100`,
      duration: [selectedService.length, 'minute'],
      description: 'Bokningsbekräftelse',
      location: 'Köpmangatan 3, 722 15 Västerås, Sweden',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = ics(calendarEvent as any);
    window.open(url, '_blank');
  }, [selectedService, selectedStaff, selectedDate, selectedTimeSlot, staffLabel]);

  if (!selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) {
    return null;
  }

  const formattedDate = formatDateWord(selectedDate);

  return (
    <div className="flex flex-col w-full">
      <h2>Bekräftad bokning</h2>
      <hr />
      <div className="py-6 w-full box-border">
        <div className="flex flex-col gap-4 items-center py-6">
          <Checkmark />

          <div className="flex flex-col gap-4 items-center">
            <h2>
              {selectedService.name} hos {staffLabel}
            </h2>
            <p className="m-0">
              {formattedDate}, {selectedTimeSlot.startTime} |{' '}
              {selectedService.length} min / {selectedService.priceIncludingVat} kr
            </p>
          </div>

          <div
            className="flex items-center gap-2 px-5 py-2 bg-[#9c9c7f] rounded-lg cursor-pointer transition-all duration-200 border-2 border-secondary hover:shadow-[0_0_10px_rgba(0,0,0,0.15)]"
            onClick={handleCalendar}
          >
            <Calendar className="text-secondary" size={20} />
            <p className="m-0">Lägg till i kalender</p>
          </div>
        </div>
      </div>
    </div>
  );
}
