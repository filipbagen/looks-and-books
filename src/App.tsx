import { useBookingStore } from '@/store/bookingStore'
import { OpeningHours } from '@/components/home/OpeningHours'
import { Hero } from '@/components/home/Hero'
import { Slideshow } from '@/components/home/Slideshow'
import { Services } from '@/components/home/Services'
import { Footer } from '@/components/layout/Footer'
import { Section } from '@/components/ui'
import { StaffSelector } from '@/components/booking/StaffSelector'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker'
import { BookingForm } from '@/components/booking/BookingForm'
import { BookingComplete } from '@/components/booking/BookingComplete'
import logo from '@/assets/images/icons/logo.svg'

function App() {
  const { selectedStaff, selectedService, selectedTimeSlot, currentStep } = useBookingStore()

  const showServices = !!selectedStaff
  const showTimeSlots = !!selectedService
  const showSummary = !!selectedTimeSlot && currentStep === 'summary'
  const showComplete = currentStep === 'complete'

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Background Logo */}
      <div className="pointer-events-none fixed right-[-50vw] top-0 z-[-1] h-screen opacity-[0.03]">
        <img src={logo} alt="" className="h-full" />
      </div>

      <div className="flex w-[90vw] max-w-7xl flex-col gap-8 pb-12">
        {/* Logo */}
        <img src={logo} alt="Looks & Books" className="mx-auto mt-20 h-20 md:h-24" />

        {/* Grid Layout */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-0">
          {/* Opening Hours - Full width on mobile, first row on desktop */}
          <div className="lg:col-span-2">
            <OpeningHours />
          </div>

          {/* Hero */}
          <div className="lg:pr-10">
            <Hero />
          </div>

          {/* Slideshow */}
          <div>
            <Slideshow />
          </div>
        </div>

        {/* Booking Section */}
        <div id="booking" className="flex w-full flex-col">
          <Section title="Vem vill du ska ta hand om dig?">
            <StaffSelector />
          </Section>

          <Section title="Vilken behandling vill du ha?" isVisible={showServices}>
            <ServiceSelector />
          </Section>

          <Section title="Vilken tid passar dig?" isVisible={showTimeSlots}>
            <TimeSlotPicker />
          </Section>

          <Section title="Bekräfta bokning" isVisible={showSummary}>
            <BookingForm />
          </Section>

          <Section title="Bekräftad bokning" isVisible={showComplete}>
            <BookingComplete />
          </Section>
        </div>

        {/* Services Section */}
        <Services />

        {/* Footer */}
        <Footer />

        {/* Credits */}
        <p className="text-center text-xs text-secondary">
          Designad och utvecklad av{' '}
          <a
            href="https://filipbagen.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-70"
          >
            Filip Malm-Bägén
          </a>
        </p>
      </div>
    </div>
  )
}

export default App
