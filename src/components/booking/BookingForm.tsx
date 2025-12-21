import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBookingStore } from '@/store/bookingStore'
import { reserveTimeSlot, confirmBooking } from '@/services/api/bookingApi'
import { formatDateWord } from '@/utils/date'
import { Button } from '@/components/ui'
import { Modal } from '@/components/ui'

const phoneSchema = z.object({
  phone: z.string().regex(/^(0\d{9}|46\d{9})$/, 'Ogiltigt telefonnummer'),
})

const bookingSchema = z.object({
  name: z.string().min(1, 'Namn krävs'),
  email: z.string().email('Ogiltig e-post').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type BookingFormData = z.infer<typeof bookingSchema>

export function BookingForm() {
  const {
    selectedStaff,
    selectedService,
    selectedDate,
    selectedTimeSlot,
    appointmentId,
    customerInfo,
    phoneNumber,
    setAppointmentId,
    setCustomerInfo,
    setPhoneNumber,
    setCurrentStep,
  } = useBookingStore()

  const [step, setStep] = useState<'phone' | 'details'>('phone')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  })

  const bookingForm = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: '', email: '', notes: '' },
  })

  if (!selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) return null

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true)
    try {
      let phone = data.phone
      if (phone.startsWith('0')) {
        phone = '46' + phone.slice(1)
      }

      const response = await reserveTimeSlot({
        resourceIds: [selectedStaff.resourceId],
        serviceIds: [selectedService.serviceId],
        startDate: selectedDate,
        startTime: selectedTimeSlot.startTime,
        customerPhoneNumber: phone,
      })

      setAppointmentId(response.appointmentId)
      setPhoneNumber(phone)

      if (response.maskedCustomers?.[0]) {
        const customer = response.maskedCustomers[0]
        setCustomerInfo({ exists: true, customerId: customer.id })
        bookingForm.setValue('name', customer.maskedName)
        bookingForm.setValue('email', customer.maskedEmail)
      } else {
        setCustomerInfo({ exists: false })
      }

      setStep('details')
    } catch (error) {
      console.error('Reservation failed:', error)
      alert('Kunde inte reservera tiden. Försök igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBookingSubmit = async (data: BookingFormData) => {
    if (!appointmentId || !phoneNumber) return

    setIsSubmitting(true)
    try {
      await confirmBooking({
        appointmentId,
        customerPhoneNumber: phoneNumber,
        customerName: customerInfo?.exists ? undefined : data.name,
        customerEmail: customerInfo?.exists ? undefined : data.email || undefined,
        customerId: customerInfo?.exists ? customerInfo.customerId : undefined,
        notes: data.notes || undefined,
      })

      setCurrentStep('complete')
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Kunde inte slutföra bokningen. Försök igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryText = `${selectedService.name} hos ${selectedStaff.name}`
  const dateText = `${formatDateWord(selectedDate)}, ${selectedTimeSlot.startTime}`
  const detailsText = `${selectedService.length} min / ${selectedService.priceIncludingVat} kr`

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Booking Summary */}
      <div className="text-center">
        <h2 className="text-xl font-display">{summaryText}</h2>
        <p>
          {dateText} | {detailsText}
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="flex flex-col items-center gap-4">
          <p className="text-sm text-secondary">Ange ditt telefonnummer för att reservera tiden</p>
          <div className="flex gap-3">
            <input
              {...phoneForm.register('phone')}
              type="tel"
              placeholder="Telefonnummer"
              className="input-field max-w-[200px]"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '...' : 'Nästa'}
            </Button>
          </div>
          {phoneForm.formState.errors.phone && (
            <p className="text-sm text-red-600">{phoneForm.formState.errors.phone.message}</p>
          )}
        </form>
      ) : (
        <form
          onSubmit={bookingForm.handleSubmit(handleBookingSubmit)}
          className="flex w-full max-w-md flex-col gap-4"
        >
          <input
            {...bookingForm.register('name')}
            type="text"
            placeholder="Namn"
            readOnly={customerInfo?.exists}
            className={`input-field ${customerInfo?.exists ? 'cursor-not-allowed bg-gray-100 opacity-70' : ''}`}
          />

          <div className="flex gap-3">
            <input
              type="tel"
              value={phoneNumber ?? ''}
              readOnly
              className="input-field flex-1 cursor-not-allowed bg-gray-100 opacity-70"
            />
            <input
              {...bookingForm.register('email')}
              type="email"
              placeholder="Email"
              readOnly={customerInfo?.exists}
              className={`input-field flex-1 ${customerInfo?.exists ? 'cursor-not-allowed bg-gray-100 opacity-70' : ''}`}
            />
          </div>

          <textarea
            {...bookingForm.register('notes')}
            placeholder="Meddelande"
            rows={3}
            className="input-field resize-none"
          />

          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-secondary">
              Genom att boka godkänner du{' '}
              <button type="button" onClick={() => setShowTerms(true)} className="underline">
                bokningsvillkoren
              </button>
            </p>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Bokar...' : 'Boka'}
            </Button>
          </div>

          {bookingForm.formState.errors.name && (
            <p className="text-sm text-red-600">{bookingForm.formState.errors.name.message}</p>
          )}
        </form>
      )}

      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)}>
        <h2 className="mb-4 text-xl font-display">
          Användarvillkor för onlinebokning i EasyCashier Bokningskalender
        </h2>
        <h3 className="mb-2 font-bold">Definitioner</h3>
        <p className="mb-2">
          <strong>Användaren</strong> - Du / person som genomför onlinebokningen.
        </p>
        <p className="mb-2">
          <strong>Bokningskalendern</strong> - EasyCashier bokningskalender och tillhörande
          onlinebokning.
        </p>
        <p className="mb-2">
          <strong>Företaget</strong> - Det företag som använder sig av tjänsten EasyCashier
          bokningskalender och tillhörande onlinebokning på sin hemsida.
        </p>
        <p className="mb-4">
          <strong>Personuppgifter</strong> - Information som enskilt eller tillsammans med annan
          information kan identifiera en person.
        </p>

        <h3 className="mb-2 font-bold">Villkor</h3>
        <p className="mb-2">
          Då Användaren genomför en onlinebokning ger man samtycke till att Användarens
          Personuppgifter sparas och behandlas i Företagets Bokningskalender.
        </p>
        <p className="mb-2">
          De Personuppgifter som sparas om Användaren är förnamn, efternamn, epostadress samt
          mobiltelefonnummer.
        </p>
        <p className="mb-2">
          Personuppgifterna sparas för att Företaget ska kunna använda Bokningskalendern och dess
          tjänster på ett korrekt sätt gentemot Användaren.
        </p>
        <p className="mb-2">
          Om användaren önskar att få ta del av vilka personuppgifter som lagras, eller önskar att
          dessa personuppgifter tas bort, så åligger det Användaren att kontakta Företaget som då
          utan dröjsmål ska utföra detta.
        </p>
        <p>
          Om Företaget slutar att använda Bokningskalendern så kommer samtliga personuppgifter om
          Användare att tas bort senast 1 månad efter att tjänsten avslutats.
        </p>
      </Modal>
    </div>
  )
}
