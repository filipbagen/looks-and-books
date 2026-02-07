import { useState } from 'react';
import { useBookingState, useBookingDispatch } from '../../context/BookingContext';
import { reserveTimeSlot, confirmBooking } from '../../api/booking';
import { ONLINE_BOOKING_URL_NAME } from '../../api/config';
import { isValidPhoneNumber, toInternationalFormat } from '../../utils/phone';
import { formatDateWord } from '../../utils/date';
import TermsOverlay from './TermsOverlay';

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
    <div className="flex flex-col w-full">
      <h2>Bekräfta bokning</h2>
      <hr />
      <div className="py-6 w-full box-border">
        <div className="flex flex-col gap-6 items-center py-6">
          {/* Summary header */}
          <div className="flex flex-col justify-center gap-6 items-center">
            <div className="flex flex-col justify-center items-center gap-1.5">
              <h2>
                {selectedService.name} hos {selectedStaff.name}
              </h2>
              <p className="m-0">
                {formattedDate}, {selectedTimeSlot.startTime} |{' '}
                {selectedService.length} min / {selectedService.priceIncludingVat} kr
              </p>
            </div>

            {/* Phone phase */}
            {phase === 'phone' && (
              <form className="flex flex-col items-center gap-2" onSubmit={handlePhoneSubmit}>
                <div className="flex flex-col items-center gap-2">
                  <p className="muted m-0">
                    Ange ditt telefonnummer för att reservera tiden
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Telefonnummer"
                      className="input-field max-w-[264px]"
                    />
                    <button
                      type="submit"
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!phoneValid}
                      style={{ opacity: phoneValid ? 1 : 0.5 }}
                    >
                      Nästa
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Details phase */}
          {phase === 'details' && (
            <form className="flex flex-col gap-3 items-center w-full max-w-[520px] px-4 box-border [&>div]:w-full" onSubmit={handleBookSubmit}>
              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Namn"
                  required
                  readOnly={isExistingCustomer}
                  className={`input-field ${isExistingCustomer ? 'bg-[#f5f5f5] cursor-not-allowed opacity-70' : ''}`}
                />
              </div>

              <div className="flex gap-3 w-full [&>div]:w-full [&>div]:box-border">
                <div>
                  <input
                    type="tel"
                    value={customerPhoneFinal}
                    readOnly
                    className="input-field bg-[#f5f5f5] cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email"
                    readOnly={isExistingCustomer}
                    className={`input-field ${isExistingCustomer ? 'bg-[#f5f5f5] cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>
              </div>

              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Meddelande"
                  className="input-field h-[75px] resize-y"
                />
              </div>

              <div className="flex flex-col items-start gap-1 w-full">
                <p className="muted">
                  Genom att boka godkänner du{' '}
                  <u className="cursor-pointer" onClick={() => setShowTerms(true)}>
                    bokningsvillkoren
                  </u>
                </p>
                <button
                  type="submit"
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canBook || isSubmitting}
                >
                  Boka
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <TermsOverlay visible={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
