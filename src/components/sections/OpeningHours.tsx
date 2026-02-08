import { useMemo } from 'react';

const HOURS = [
  { label: 'Måndag: 10:00-18:00', day: 1 },
  { label: 'Tisdag: 10:00-18:00', day: 2 },
  { label: 'Onsdag: 10:00-18:00', day: 3 },
  { label: 'Torsdag: 10:00-18:00', day: 4 },
  { label: 'Fredag: 10:00-18:00', day: 5 },
  { label: 'Lördag: 10:00-17:00', day: 6 },
  { label: 'Söndag: Stängt', day: 0 },
];

export default function OpeningHours() {
  const todayIndex = useMemo(() => new Date().getDay(), []);

  return (
    <div className="area-opening w-full">
      <div className="w-full flex justify-between items-center shrink-0 max-xl:flex-col max-xl:gap-8 py-4">
        {HOURS.map((h) => (
          <p key={h.day} className={`whitespace-nowrap ${h.day === todayIndex ? 'today' : ''}`}>
            {h.label}
          </p>
        ))}
      </div>
    </div>
  );
}
