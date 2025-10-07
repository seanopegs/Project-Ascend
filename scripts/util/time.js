export const weekdays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatTime(hour, minute = 0) {
  const normalizedHour = ((Math.floor(hour) % 24) + 24) % 24;
  const normalizedMinute = ((minute % 60) + 60) % 60;
  return `${String(normalizedHour).padStart(2, "0")}:${String(normalizedMinute).padStart(2, "0")}`;
}

export function formatCalendarDate(state) {
  const weekday = weekdays[state.weekdayIndex % weekdays.length];
  const monthName = months[state.monthIndex % months.length];
  return `${weekday}, ${state.dayOfMonth} ${monthName} ${state.year}`;
}

export function formatDuration(hours = 1) {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} menit`;
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) {
    return `${h} jam`;
  }
  return `${h} jam ${m} menit`;
}

export function getDaysInMonth(monthIndex, year) {
  const thirtyOne = new Set([0, 2, 4, 6, 7, 9, 11]);
  if (monthIndex === 1) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  return thirtyOne.has(monthIndex) ? 31 : 30;
}

export function advanceCalendarDay(state) {
  state.weekdayIndex = (state.weekdayIndex + 1) % weekdays.length;
  state.dayOfMonth += 1;
  const daysInMonth = getDaysInMonth(state.monthIndex, state.year);
  if (state.dayOfMonth > daysInMonth) {
    state.dayOfMonth = 1;
    state.monthIndex += 1;
    if (state.monthIndex >= months.length) {
      state.monthIndex = 0;
      state.year += 1;
    }
  }
}
