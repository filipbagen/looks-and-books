import { useCallback } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Clock, 
  CreditCard, 
  Scissors, 
  User 
} from 'lucide-react';
import { google, outlook, office365, yahoo, ics } from 'calendar-link';
import Checkmark from '../ui/Checkmark';
import { useBookingState } from '../../context/BookingContext';
import { isQuickestAvailable } from '../../config/staff';
import { formatDateWord } from '../../utils/date';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BookingComplete() {
  const { selectedStaff, selectedService, selectedDate, selectedTimeSlot, resourceName } =
    useBookingState();

  if (!selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) {
    return null;
  }

  // Determine the staff name to display
  // 1. If we have a confirmed resourceName from backend, use it (e.g. "Fadi")
  // 2. If not, and it was "Quickest Available", use "Looks & Books" (generic)
  // 3. Otherwise use the selected staff name
  const staffLabel = resourceName 
    ? resourceName 
    : (isQuickestAvailable(selectedStaff) ? 'Looks & Books' : selectedStaff.name);

  const formattedDate = formatDateWord(selectedDate);

  const createCalendarEvent = useCallback(() => {
    return {
      title: `${selectedService.name} hos ${staffLabel}`,
      start: `${selectedDate} ${selectedTimeSlot.startTime}:00 +0100`,
      duration: [selectedService.length, 'minute'],
      description: 'Bokningsbekräftelse från Looks & Books',
      location: 'Köpmangatan 3, 722 15 Västerås, Sweden',
    };
  }, [selectedService, staffLabel, selectedDate, selectedTimeSlot]);

  const handleCalendar = (type: 'google' | 'outlook' | 'office365' | 'yahoo' | 'ics') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = createCalendarEvent() as any;
    let url = '';

    switch (type) {
      case 'google':
        url = google(event);
        break;
      case 'outlook':
        url = outlook(event);
        break;
      case 'office365':
        url = office365(event);
        break;
      case 'yahoo':
        url = yahoo(event);
        break;
      case 'ics':
      default:
        url = ics(event);
        break;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col w-full items-center">
      <h2 className="text-2xl font-serif mb-4 self-start">Bekräftad bokning</h2>
      <Separator className="w-full mb-8 bg-secondary/30" />
      
      <div className="flex flex-col items-center w-full max-w-md gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Success Animation */}
        <div className="flex flex-col items-center gap-2">
          <Checkmark />
          <h3 className="text-2xl font-serif text-center mt-2">Tack för din bokning!</h3>
          <p className="text-secondary text-center text-sm">
            En bekräftelse har skickats till ditt telefonnummer.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="w-full bg-secondary/5 border-secondary/10 shadow-sm">
          <CardHeader className="flex items-center gap-3 pb-4">
            <div className="bg-secondary/10 p-2 rounded-full">
              <Scissors className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-secondary font-medium uppercase tracking-wide">Behandling</p>
              <CardTitle className="font-semibold text-lg text-foreground">{selectedService.name}</CardTitle>
            </div>
          </CardHeader>
          
          <Separator className="bg-secondary/10" />
          
          <CardContent className="grid grid-cols-2 gap-6 pt-6">
            {/* Staff */}
            <div className="flex items-start gap-3">
              <div className="bg-secondary/10 p-2 rounded-full shrink-0">
                <User className="w-4 h-4 text-secondary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-secondary uppercase truncate">Frisör</p>
                <p className="font-medium text-foreground truncate">{staffLabel}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3">
              <div className="bg-secondary/10 p-2 rounded-full shrink-0">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-secondary uppercase">Tid</p>
                <p className="font-medium text-foreground">{selectedService.length} min</p>
              </div>
            </div>

            {/* Date/Time */}
            <div className="flex items-start gap-3 col-span-2 sm:col-span-1">
              <div className="bg-secondary/10 p-2 rounded-full shrink-0">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-secondary uppercase">Datum</p>
                <p className="font-medium text-foreground whitespace-nowrap">
                  {formattedDate}, {selectedTimeSlot.startTime}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-start gap-3 col-span-2 sm:col-span-1">
              <div className="bg-secondary/10 p-2 rounded-full shrink-0">
                <CreditCard className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-secondary uppercase">Pris</p>
                <p className="font-medium text-foreground">{selectedService.priceIncludingVat} kr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add to Calendar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto min-w-48 border-secondary/20 hover:bg-secondary/10 text-secondary-foreground gap-2 h-12 text-base shadow-sm"
            >
              <Calendar className="w-5 h-5 text-secondary" />
              Lägg till i kalender
              <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={() => handleCalendar('google')} className="cursor-pointer">
              Google Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCalendar('outlook')} className="cursor-pointer">
              Outlook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCalendar('office365')} className="cursor-pointer">
              Office 365
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCalendar('yahoo')} className="cursor-pointer">
              Yahoo Calendar
            </DropdownMenuItem>
            <Separator className="my-1" />
            <DropdownMenuItem onClick={() => handleCalendar('ics')} className="cursor-pointer">
              Apple Calendar (.ics)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
