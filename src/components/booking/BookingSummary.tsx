import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useBookingState, useBookingDispatch } from '../../context/BookingContext';
import { reserveTimeSlot, confirmBooking } from '../../api/booking';
import { ONLINE_BOOKING_URL_NAME } from '../../api/config';
import { isValidPhoneNumber, toInternationalFormat } from '../../utils/phone';
import { formatDateWord } from '../../utils/date';
import TermsOverlay from './TermsOverlay';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
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

  if (!selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) {
    return null;
  }

  const formattedDate = formatDateWord(selectedDate);
  const phoneValid = isValidPhoneNumber(phone);
  const canBook = customerName.trim().length > 0 && customerPhoneFinal.trim().length > 0;

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid || !selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) return;

    const intlPhone = toInternationalFormat(phone);
    try {
      const data = await reserveTimeSlot({
        onlineBookingUrlName: ONLINE_BOOKING_URL_NAME,
        resourceIds: [selectedStaff.resourceId],
        serviceIds: [selectedService.serviceId],
        startDate: selectedDate,
        startTime: selectedTimeSlot.startTime,
        customerPhoneNumber: intlPhone,
      });

      dispatch({ type: 'SET_APPOINTMENT', payload: data.appointmentId });
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
      console.error('Reserve error:', error);
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
      <h2 className="text-2xl font-serif mb-4">Bekräfta bokning</h2>
      <Separator className="w-full mb-8 bg-secondary/30" />

      <Card className="w-full border-none">
        <CardContent className="w-full flex flex-row gap-12 items-center justify-center">
          {/* Summary Section */}
          <div className="bg-secondary/5 rounded-lg p-6 border border-secondary/10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 p-2 rounded-full">
                  <Scissors className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Behandling</p>
                  <p className="font-semibold text-lg text-foreground">{selectedService.name}</p>
                </div>
              </div>
              
              <Separator className="bg-secondary/10" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-full">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Frisör</p>
                    <p className="font-medium text-foreground">{selectedStaff.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-full">
                    <Clock className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Tid</p>
                    <p className="font-medium text-foreground">{selectedService.length} min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-full">
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Datum</p>
                    <p className="font-medium text-foreground">{formattedDate}, {selectedTimeSlot.startTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-full">
                  <CreditCard className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Pris</p>
                    <p className="font-medium text-foreground">{selectedService.priceIncludingVat} kr</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          {phase === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4 text-center">
                <div className="inline-flex justify-center bg-secondary/10 p-3 rounded-full mb-2">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-medium">Vi börjar med ditt nummer</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Ange ditt telefonnummer för att reservera tiden i 10 minuter.
                </p>
              </div>
              
              <div className="flex gap-2">
              <div className="flex gap-2 max-w-sm mx-auto w-full">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="070 123 45 67"
                  className="h-12 text-lg text-center bg-secondary/10 border-secondary/10 focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary"
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="flex gap-2 max-w-sm mx-auto bg-secondary hover:bg-secondary/90 hover:cursor-pointer text-white font-semibold h-12"
                disabled={!phoneValid}
              >
                Nästa <ChevronRight className="w-4 h-4" />
              </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBookSubmit} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Förnamn Efternamn"
                      required
                      readOnly={isExistingCustomer}
                      className={cn(
                        "pl-9 bg-white",
                        isExistingCustomer && "bg-gray-100 cursor-not-allowed opacity-70"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhoneFinal}
                        readOnly
                        className="pl-9 bg-gray-100 cursor-not-allowed opacity-70"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="namn@exempel.se"
                        readOnly={isExistingCustomer}
                        className={cn(
                          "pl-9 bg-white",
                          isExistingCustomer && "bg-gray-100 cursor-not-allowed opacity-70"
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
                      className="min-h-[100px] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Genom att boka godkänner du{' '}
                  <button
                    type="button" 
                    className="underline hover:text-secondary font-medium"
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
        </CardContent>
      </Card>

      <TermsOverlay visible={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
