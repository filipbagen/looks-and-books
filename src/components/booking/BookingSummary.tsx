import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useBookingState, useBookingDispatch } from '../../context/BookingContext';
import { isQuickestAvailable } from '../../config/staff';
import { reserveTimeSlot, confirmBooking } from '../../api/booking';
import { ONLINE_BOOKING_URL_NAME } from '../../api/config';
import { isValidPhoneNumber, toInternationalFormat } from '../../utils/phone';
import { formatDateWord } from '../../utils/date';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Icons
import { Calendar, Clock, Scissors, User, Phone, Mail, ChevronRight, CreditCard } from 'lucide-react';

interface BookingSummaryProps {
  onComplete: () => void;
}

export default function BookingSummary({ onComplete }: BookingSummaryProps) {
  const state = useBookingState();
  const dispatch = useBookingDispatch();
  const { selectedStaff, selectedService, selectedDate, selectedTimeSlot } = state;

  const [phone, setPhone] = useState('');
  const [phase, setPhase] = useState<'phone' | 'details'>('phone');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhoneFinal, setCustomerPhoneFinal] = useState('');
  const [notes, setNotes] = useState('');
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  if (!selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) {
    return null;
  }

  const formattedDate = formatDateWord(selectedDate);
  const phoneValid = isValidPhoneNumber(phone);
  const canBook = customerName.trim().length > 0 && customerPhoneFinal.trim().length > 0;

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid || !selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) return;

    setReserveError(null);
    setIsReserving(true);

    const intlPhone = toInternationalFormat(phone);
    try {
      // When "quickest available", use the resourceIds from the time slot
      const resourceIds = isQuickestAvailable(selectedStaff)
        ? (selectedTimeSlot.resourceIds ?? [])
        : [selectedStaff.resourceId];

      const data = await reserveTimeSlot({
        onlineBookingUrlName: ONLINE_BOOKING_URL_NAME,
        resourceIds,
        serviceIds: [selectedService.serviceId],
        startDate: selectedDate,
        startTime: selectedTimeSlot.startTime,
        customerPhoneNumber: intlPhone,
      });

      dispatch({ type: 'SET_APPOINTMENT', payload: data.appointmentId });
      if (data.resourceName) {
        dispatch({ type: 'SET_RESOURCE_NAME', payload: data.resourceName });
      }
      setCustomerPhoneFinal(data.customerPhoneNumber);

      if (data.maskedCustomers?.[0]) {
        const customer = data.maskedCustomers[0];
        setCustomerName(customer.maskedName);
        setCustomerEmail(customer.maskedEmail);
        setIsExistingCustomer(true);
        dispatch({ type: 'SET_CUSTOMER_INFO', payload: { exists: true, customerId: customer.id } });
      } else {
        setIsExistingCustomer(false);
        dispatch({ type: 'SET_CUSTOMER_INFO', payload: { exists: false } });
      }

      setPhase('details');
    } catch (error) {
      setReserveError((error as Error).message);
    } finally {
      setIsReserving(false);
    }
  }

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canBook || isSubmitting) return;

    setIsSubmitting(true);
    const intlPhone = toInternationalFormat(customerPhoneFinal);

    const body: Parameters<typeof confirmBooking>[0] = {
      onlineBookingUrlName: ONLINE_BOOKING_URL_NAME,
      appointmentId: state.appointmentId!,
      customerPhoneNumber: intlPhone,
      termsAndConditionsApproved: true,
    };

    if (!state.customerInfo?.exists) {
      body.customerName = customerName;
      body.customerEmail = customerEmail;
    } else {
      body.customerId = state.customerInfo.customerId;
    }

    if (notes.trim()) body.notes = notes;

    try {
      await confirmBooking(body);
      onComplete();
    } catch (error) {
      console.error('Confirm error:', error);
      alert('Error confirming booking: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <h2 className="text-2xl font-serif mb-4 self-start">Bekräfta bokning</h2>
      <Separator className="w-full mb-8 bg-secondary/30" />

      <div className="flex flex-row gap-8 justify-center p-0 max-w-4xl max-md:flex-col max-md:items-center">
        {/* Summary Section */}
        <Card className="flex-shrink-0 flex flex-col gap-4 bg-secondary/5 rounded-lg border border-secondary/10 h-min">
          <CardHeader className="flex items-center gap-3">
            <div className="bg-secondary/10 p-2 rounded-full">
              <Scissors className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-secondary font-medium uppercase tracking-wide">Behandling</p>
              <CardTitle className="font-semibold text-lg text-brand-black">{selectedService.name}</CardTitle>
            </div>
          </CardHeader>
          
          <Separator className="bg-secondary/10" />
          
          <CardContent className="grid grid-cols-2 items-center gap-8 whitespace-nowrap">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 p-2 rounded-full">
                <User className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-secondary uppercase">
                  {isQuickestAvailable(selectedStaff) && !state.resourceName ? 'Tilldelning' : 'Frisör'}
                </p>
                <p className="font-bold text-brand-black font-bold">
                  {state.resourceName ?? (isQuickestAvailable(selectedStaff) ? 'Första lediga' : selectedStaff.name)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 p-2 rounded-full">
                <Clock className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-secondary uppercase">Tid</p>
                <p className="font-bold text-brand-black">{selectedService.length} min</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 p-2 rounded-full">
                <Calendar className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-secondary uppercase">Datum</p>
                <p className="font-bold text-brand-black">{formattedDate}, {selectedTimeSlot.startTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 p-2 rounded-full">
                <CreditCard className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-secondary uppercase">Pris</p>
                  <p className="font-bold text-brand-black">{selectedService.priceIncludingVat} kr</p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <div className="w-full flex-1 max-w-sm">
          {phase === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4 text-center">
                <div className="inline-flex justify-center bg-secondary/10 p-3 rounded-full mb-2">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-medium">Ser allt bra ut?</h3>
                <p className="text-secondary text-sm max-w-xs mx-auto">
                  Ange ditt telefonnummer för att reservera tiden i 10 minuter.
                </p>
              </div>

              {reserveError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive text-center">
                  {reserveError}
                </div>
              )}
              
              <div className="flex gap-2">
              <div className="flex gap-2 max-w-sm mx-auto w-full">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                  setPhone(e.target.value);
                  setReserveError(null);
                }}
                  required
                  placeholder="070 123 45 67"
                  className="h-12 text-lg text-center bg-secondary/10 border-secondary/10 focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary placeholder:text-secondary/50"
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="flex gap-2 max-w-sm mx-auto bg-secondary hover:bg-secondary/90 hover:cursor-pointer text-white font-semibold h-12"
                disabled={!phoneValid || isReserving}
              >
                {isReserving ? 'Reserverar...' : <>Nästa <ChevronRight className="w-4 h-4" /></>}
              </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBookSubmit} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-secondary/70" />
                    <Input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Förnamn Efternamn"
                      required
                      readOnly={isExistingCustomer}
                      className={cn(
                        "pl-9 h-11 bg-secondary/10 border-secondary/10 focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary",
                        isExistingCustomer && "cursor-not-allowed opacity-70"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-4 w-4 text-secondary/70" />
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhoneFinal}
                        readOnly
                        className="pl-9 h-11 bg-secondary/5 border-secondary/10 cursor-not-allowed opacity-70 focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-secondary/70" />
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="namn@exempel.se"
                        readOnly={isExistingCustomer}
                        className={cn(
                          "pl-9 h-11 bg-secondary/10 border-secondary/10 focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary",
                          isExistingCustomer && "cursor-not-allowed opacity-70"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Meddelande (valfritt)</Label>
                  <div className="relative">
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Om du har några specifika önskemål..."
                      className="min-h-24 bg-secondary/10 border-secondary/10 focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary placeholder:text-secondary/80"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                <p className="text-xs text-secondary/80 text-center">
                  Genom att boka godkänner du {' '}
                  <button
                    type="button" 
                    className="underline hover:text-secondary hover:cursor-pointer font-medium"
                    onClick={() => setShowTerms(true)}
                  >
                    bokningsvillkoren
                  </button>
                </p>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-lg shadow-md"
                  disabled={!canBook || isSubmitting}
                >
                  {isSubmitting ? 'Bokar...' : 'Bekräfta Bokning'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-[90%] sm:max-w-xl bg-white text-brand-black border-secondary">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-left">Användarvillkor för onlinebokning</DialogTitle>
            <DialogDescription className="text-left pt-2 text-brand-black/80">
              Användarvillkor för EasyCashier Bokningskalender
            </DialogDescription>
          </DialogHeader>
          
          <div className="no-scrollbar -mx-6 max-h-[50vh] overflow-y-auto px-6">
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Definitioner</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><b>Användaren</b> - Du / person som genomför onlinebokningen.</li>
                  <li><b>Bokningskalendern</b> - EasyCashier bokningskalender och tillhörande onlinebokning.</li>
                  <li><b>Företaget</b> - Det företag som använder sig av tjänsten EasyCashier bokningskalender och tillhörande onlinebokning på sin hemsida.</li>
                  <li><b>Personuppgifter</b> - Information som enskilt eller tillsammans med annan information kan identifiera en person.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Villkor</h3>
                <div className="space-y-2">
                  <p>Då Användaren genomför en onlinebokning ger man samtycke till att Användarens Personuppgifter sparas och behandlas i Företagets Bokningskalender.</p>
                  <p>De Personuppgifter som sparas om Användaren är förnamn, efternamn, epostadress samt mobiltelefonnummer.</p>
                  <p>Personuppgifterna sparas för att Företaget ska kunna använda Bokningskalendern och dess tjänster på ett korrekt sätt gentemot Användaren.</p>
                  <p>Om användaren önskar att få ta del av vilka personuppgifter som lagras, eller önskar att dessa personuppgifter tas bort, så åligger det Användaren att kontakta Företaget som då utan dröjsmål ska utföra detta.</p>
                  <p>Om Företaget slutar att använda Bokningskalendern så kommer samtliga personuppgifter om Användare att tas bort 1 senast månad efter att tjänsten avslutats.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
