import { toLocalDateStr, parseLocalDateStr, toMinutes, toTimeStr } from './date';

export const DENSITY_LEVELS = {
  KOSONG: 'KOSONG',
  RINGAN: 'RINGAN',
  SEDANG: 'SEDANG',
  PADAT: 'PADAT',
};

export const DENSITY_COLORS = {
  [DENSITY_LEVELS.KOSONG]: { fill: 'white', text: '#1a1a1a', shadow: false },
  [DENSITY_LEVELS.RINGAN]: { fill: '#00E599', text: '#1a1a1a', shadow: true },
  [DENSITY_LEVELS.SEDANG]: { fill: '#FFE600', text: '#1a1a1a', shadow: true },
  [DENSITY_LEVELS.PADAT]: { fill: '#FF4D4D', text: 'white', shadow: true },
};

export const DENSITY_THRESHOLDS = {
  [DENSITY_LEVELS.KOSONG]: 0,
  [DENSITY_LEVELS.RINGAN]: 3,
  [DENSITY_LEVELS.SEDANG]: 6,
  [DENSITY_LEVELS.PADAT]: Infinity,
};

export function calculateDurationMinutes(startTime, endTime) {
  const s = toMinutes(startTime);
  const e = toMinutes(endTime);
  if (Number.isNaN(s) || Number.isNaN(e)) return 0;
  return e - s;
}

export function hasTimeConflict(events) {
  const sorted = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime < sorted[i - 1].endTime) {
      return true;
    }
  }
  return false;
}

export function calculateDailyDensity(events, date) {
  const dayEvents = (events || []).filter(e => e.date === date);
  const totalMinutes = dayEvents.reduce((sum, e) => sum + calculateDurationMinutes(e.startTime, e.endTime), 0);
  const totalHours = totalMinutes / 60;
  const hasConflict = hasTimeConflict(dayEvents);

  let level;
  if (totalHours === 0) {
    level = DENSITY_LEVELS.KOSONG;
  } else if (totalHours <= DENSITY_THRESHOLDS.RINGAN) {
    level = DENSITY_LEVELS.RINGAN;
  } else if (totalHours <= DENSITY_THRESHOLDS.SEDANG) {
    level = DENSITY_LEVELS.SEDANG;
  } else {
    level = DENSITY_LEVELS.PADAT;
  }

  if (hasConflict) {
    level = DENSITY_LEVELS.PADAT;
  }

  return {
    level,
    hours: totalHours,
    hasConflict,
    eventCount: dayEvents.length,
    color: DENSITY_COLORS[level],
  };
}

export function analyzeDensityRange(events, startDate, endDate) {
  const results = {};
  const current = parseLocalDateStr(startDate);
  const end = parseLocalDateStr(endDate);

  // Guard tanggal invalid agar tidak infinite loop
  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) return results;

  let guard = 0;
  while (current <= end && guard < 367) {
    guard += 1;
    const dateStr = toLocalDateStr(current);
    const dayEvents = (events || []).filter(e => e.date === dateStr);
    const totalMinutes = dayEvents.reduce((sum, e) => sum + calculateDurationMinutes(e.startTime, e.endTime), 0);
    const totalHours = totalMinutes / 60;
    const hasConflict = hasTimeConflict(dayEvents);

    let level;
    if (totalHours === 0) level = DENSITY_LEVELS.KOSONG;
    else if (totalHours <= 3) level = DENSITY_LEVELS.RINGAN;
    else if (totalHours <= 6) level = DENSITY_LEVELS.SEDANG;
    else level = DENSITY_LEVELS.PADAT;

    if (hasConflict) level = DENSITY_LEVELS.PADAT;

    results[dateStr] = {
      level,
      hours: totalHours,
      hasConflict,
      eventCount: dayEvents.length,
      color: DENSITY_COLORS[level],
    };

    current.setDate(current.getDate() + 1);
  }

  return results;
}

export function findFreeSlots(events, date, durationMinutes, afterTime = '06:00', beforeTime = '22:00') {
  const dayEvents = (events || [])
    .filter(e => e.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const slots = [];

  const dayStart = toMinutes(afterTime);
  const dayEnd = toMinutes(beforeTime);
  if (Number.isNaN(dayStart) || Number.isNaN(dayEnd) || dayEnd <= dayStart) return slots;
  if (!durationMinutes || durationMinutes <= 0) return slots;

  let currentTime = dayStart;

  for (const event of dayEvents) {
    const eventStart = toMinutes(event.startTime);
    const eventEnd = toMinutes(event.endTime);
    if (Number.isNaN(eventStart) || Number.isNaN(eventEnd)) continue;

    if (eventStart - currentTime >= durationMinutes) {
      const slotStart = currentTime;
      const slotEnd = currentTime + durationMinutes;
      slots.push({
        startTime: toTimeStr(slotStart),
        endTime: toTimeStr(slotEnd),
      });
    }

    currentTime = Math.max(currentTime, eventEnd);
  }

  if (dayEnd - currentTime >= durationMinutes) {
    const slotStart = currentTime;
    const slotEnd = currentTime + durationMinutes;
    slots.push({
      startTime: toTimeStr(slotStart),
      endTime: toTimeStr(slotEnd),
    });
  }

  return slots;
}

export function formatDensityLabel(level) {
  const labels = {
    [DENSITY_LEVELS.KOSONG]: 'Kosong',
    [DENSITY_LEVELS.RINGAN]: 'Ringan',
    [DENSITY_LEVELS.SEDANG]: 'Sedang',
    [DENSITY_LEVELS.PADAT]: 'Padat',
  };
  return labels[level] || level;
}

export function getDensityColorClass(level) {
  const classes = {
    [DENSITY_LEVELS.KOSONG]: 'bg-white border-ink',
    [DENSITY_LEVELS.RINGAN]: 'bg-neo-mint border-ink',
    [DENSITY_LEVELS.SEDANG]: 'bg-neo-yellow border-ink',
    [DENSITY_LEVELS.PADAT]: 'bg-neo-red text-white border-ink',
  };
  return classes[level] || classes[DENSITY_LEVELS.KOSONG];
}