import { useBookingStore } from '@/store/bookingStore'
import { formatDateWord } from '@/utils/date'
import { AnimatedCheckmark } from '@/components/ui'
import { CONTACT } from '@/utils/constants'

export function BookingComplete() {
  const { selectedStaff, selectedService, selectedDate, selectedTimeSlot } = useBookingStore()

  if (!selectedStaff || !selectedService || !selectedDate || !selectedTimeSlot) return null

  const summaryText = `${selectedService.name} hos ${selectedStaff.name}`
  const dateText = `${formatDateWord(selectedDate)}, ${selectedTimeSlot.startTime}`
  const detailsText = `${selectedService.length} min / ${selectedService.priceIncludingVat} kr`

  const handleAddToCalendar = () => {
    // Create ICS file content
    const startDate = new Date(`${selectedDate}T${selectedTimeSlot.startTime}:00`)
    const endDate = new Date(startDate.getTime() + selectedService.length * 60000)

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Looks & Books//Booking//SV
BEGIN:VEVENT
UID:${Date.now()}@looksandbooks.se
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${summaryText}
LOCATION:${CONTACT.address}
DESCRIPTION:Bokningsbekräftelse
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'booking.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <AnimatedCheckmark />

      <div className="text-center">
        <h2 className="text-xl font-display">{summaryText}</h2>
        <p>
          {dateText} | {detailsText}
        </p>
      </div>

      <button
        onClick={handleAddToCalendar}
        className="flex items-center gap-2 rounded-lg border-2 border-secondary bg-secondary/10 px-5 py-2 transition-shadow hover:shadow-md"
      >
        <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Lägg till i kalender</span>
      </button>
    </div>
  )
}
