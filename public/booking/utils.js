// Get short name of day (Mon, Tue, etc.)
export function getDayShortName(date) {
  const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
  return dayNames[date.getDay()];
}

// Get short name of month (Jan, Feb, etc.)
export function getMonthShortName(date) {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Maj',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dec',
  ];
  return monthNames[date.getMonth()];
}

// Add specified number of days to a date
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Get week number of a date
export function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function animateContainer(state, id) {
  const target = document.querySelector(id);

  if (target) {
    if (state) {
      const items = target.querySelector('div.content');
      if (target && items) {
        // Wait for next frame to ensure content is rendered
        requestAnimationFrame(() => {
          target.style.height = `${items.scrollHeight}px`;
        });
      }
      target.classList.remove('hidden');
    } else {
      target.style.height = '0px';
      target.classList.add('hidden');
    }
  }
}
