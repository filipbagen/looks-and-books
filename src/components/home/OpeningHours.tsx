import { OPENING_HOURS } from '@/utils/constants'
import { getTodayIndex } from '@/utils/date'

export function OpeningHours() {
  const todayIndex = getTodayIndex()

  return (
    <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
      {OPENING_HOURS.map((item, index) => (
        <p
          key={item.day}
          className={`whitespace-nowrap ${
            index === todayIndex
              ? 'rounded-lg bg-secondary px-4 py-2 font-bold text-white'
              : ''
          }`}
        >
          {item.day}: {item.hours}
        </p>
      ))}
    </div>
  )
}
