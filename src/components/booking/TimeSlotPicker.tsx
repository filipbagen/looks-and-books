import { useState, useEffect, useCallback } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { fetchTimeSlots } from '@/services/api/bookingApi'
import {
  getDayShortName,
  getMonthShortName,
  addDays,
  getWeekNumber,
  getPreviousMonday,
} from '@/utils/date'
import type { DateGroup, TimeSlot } from '@/services/api/types'

export function TimeSlotPicker() {
  const { selectedStaff, selectedService, selectedTimeSlot, selectedDate, selectTimeSlot } =
    useBookingStore()

  const [activeWeek, setActiveWeek] = useState(() => getPreviousMonday(new Date()))
  const [timeSlotData, setTimeSlotData] = useState<DateGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadTimeSlots = useCallback(async () => {
    if (!selectedStaff || !selectedService) return

    setIsLoading(true)
    try {
      const dateStart = activeWeek.toISOString().split('T')[0]
      const dateStop = addDays(activeWeek, 6).toISOString().split('T')[0]

      const data = await fetchTimeSlots(
        [selectedStaff.resourceId],
        selectedService.serviceId,
        dateStart!,
        dateStop!
      )

      setTimeSlotData(data.dates)
    } catch (error) {
      console.error('Failed to load time slots:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedStaff, selectedService, activeWeek])

  useEffect(() => {
    loadTimeSlots()
  }, [loadTimeSlots])

  if (!selectedStaff || !selectedService) return null

  const currentWeek = getPreviousMonday(new Date())
  const canGoBack = activeWeek > currentWeek

  const handlePrevWeek = () => {
    if (canGoBack) {
      setActiveWeek(addDays(activeWeek, -7))
    }
  }

  const handleNextWeek = () => {
    setActiveWeek(addDays(activeWeek, 7))
  }

  const handleSlotClick = (date: string, slot: TimeSlot) => {
    selectTimeSlot(date, slot)
  }

  // Generate days for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(activeWeek, i))
  const weekEnd = addDays(activeWeek, 6)

  return (
    <div className="flex flex-col gap-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevWeek}
          disabled={!canGoBack}
          className={`p-2 ${canGoBack ? 'cursor-pointer hover:opacity-70' : 'cursor-not-allowed opacity-30'}`}
          aria-label="Previous week"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-display">Vecka {getWeekNumber(activeWeek)}</h2>
          <p className="text-sm">
            {activeWeek.getDate()} {getMonthShortName(activeWeek)} - {weekEnd.getDate()}{' '}
            {getMonthShortName(weekEnd)}
          </p>
        </div>

        <button
          onClick={handleNextWeek}
          className="cursor-pointer p-2 hover:opacity-70"
          aria-label="Next week"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Time Slots Grid */}
      <div className="flex gap-2 overflow-x-auto pb-4 md:justify-center md:gap-4">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0]
          const dayData = timeSlotData.find(
            (d) => new Date(d.date).toISOString().split('T')[0] === dateStr
          )
          const slots = dayData?.timeSlots ?? []
          const hasSlots = slots.length > 0

          return (
            <div key={dateStr} className="flex flex-col gap-2">
              {/* Date Header */}
              <div
                className={`flex h-20 w-20 flex-col items-center justify-center rounded-lg md:h-24 md:w-24 ${
                  hasSlots ? 'bg-secondary text-white' : 'bg-secondary/20 text-secondary'
                }`}
              >
                <h2 className="text-lg font-display md:text-xl">{getDayShortName(day)}</h2>
                <p className="text-sm">
                  {day.getDate()} {getMonthShortName(day)}
                </p>
              </div>

              {/* Slots */}
              <div className="flex flex-col gap-2">
                {isLoading ? (
                  <div className="h-10 w-20 animate-pulse rounded-lg bg-secondary/20 md:w-24" />
                ) : (
                  slots.map((slot) => {
                    const isSelected =
                      selectedDate === dayData?.date && selectedTimeSlot?.startTime === slot.startTime

                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => handleSlotClick(dayData!.date, slot)}
                        className={`rounded-lg border-2 border-secondary px-2 py-2 text-center transition-colors ${
                          isSelected
                            ? 'bg-secondary text-white'
                            : 'bg-primary text-secondary hover:bg-secondary hover:text-white'
                        }`}
                      >
                        <p className="text-sm">{slot.startTime}</p>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!isLoading && timeSlotData.every((d) => d.timeSlots.length === 0) && (
        <p className="text-center text-sm text-secondary">Inga lediga tider denna vecka</p>
      )}
    </div>
  )
}
