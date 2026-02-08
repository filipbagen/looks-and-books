import { useState, useEffect } from 'react';
import { useBookingState } from '../../context/BookingContext';
import AnimatedSection from '../ui/AnimatedSection';
import StaffSelection from './StaffSelection';
import ServiceSelection from './ServiceSelection';
import TimeSlotSelection from './TimeSlotSelection';
import BookingSummary from './BookingSummary';
import BookingComplete from './BookingComplete';
import { smoothScrollTo } from '../../utils/scroll';

export default function BookingContainer() {
  const { selectedStaff, selectedService, selectedTimeSlot } = useBookingState();
  const [isComplete, setIsComplete] = useState(false);

  const showWhat = selectedStaff !== null;
  const showWhen = selectedStaff !== null && selectedService !== null;
  const showSummary =
    selectedStaff !== null &&
    selectedService !== null &&
    selectedTimeSlot !== null;
  const showComplete = isComplete;

  useEffect(() => {
    if (showWhat && !showWhen) smoothScrollTo('what');
  }, [showWhat, showWhen, selectedStaff]);

  useEffect(() => {
    if (showWhen && !showSummary) smoothScrollTo('when');
  }, [showWhen, showSummary, selectedService]);

  useEffect(() => {
    if (showSummary) smoothScrollTo('summary');
  }, [showSummary, selectedTimeSlot]);

  useEffect(() => {
    if (showComplete) {
      setTimeout(() => smoothScrollTo('complete'));
    }
  }, [showComplete]);

  return (
    <div id="bookingContainer" className="flex flex-col items-center max-w-screen-xl w-full [&>div]:w-full [&>div]:box-border">
      <div id="who" className="w-full mb-14">
        <StaffSelection />
      </div>

      <AnimatedSection visible={showWhat} id="what">
        <ServiceSelection />
      </AnimatedSection>

      <AnimatedSection visible={showWhen} id="when">
        <TimeSlotSelection />
      </AnimatedSection>

      <AnimatedSection visible={showSummary} id="summary">
        <BookingSummary onComplete={() => setIsComplete(true)} />
      </AnimatedSection>

      <AnimatedSection visible={showComplete} id="complete">
        <BookingComplete />
      </AnimatedSection>
    </div>
  );
}
