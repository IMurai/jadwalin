export function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayStr() {
  return toLocalDateStr(new Date());
}

export function parseLocalDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function addDaysStr(dateStr, days) {
  const d = parseLocalDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

export function toMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return NaN;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

export function toTimeStr(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
