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
    selectedTimeSlot !== null &&
    !isComplete;
  const showComplete = isComplete;

  useEffect(() => {
    if (showWhat && !showWhen) smoothScrollTo('what');
  }, [showWhat, showWhen]);

  useEffect(() => {
    if (showWhen && !showSummary) smoothScrollTo('when');
  }, [showWhen, showSummary]);

  useEffect(() => {
    if (showSummary) smoothScrollTo('summary');
  }, [showSummary]);

  useEffect(() => {
    if (showComplete) smoothScrollTo('complete');
  }, [showComplete]);

  return (
    <div id="bookingContainer" className="flex flex-col items-center max-w-[1280px] w-full [&>div]:w-full [&>div]:box-border">
      <StaffSelection />

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
