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
  // Copy date so don't modify original
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

export function animateContainer(state, id) {
  const target = document.querySelector(id);

  if (target) {
    if (state) {
      const items = document.querySelector(id);
      if (target && items) {
        target.style.height = items.scrollHeight + 10 + 'px';
      }
    } else {
      target.style.height = '0px';
    }
  }
}
