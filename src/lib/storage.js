const STORAGE_KEY = 'ai-calendar-events';

export function getEvents() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Gagal menyimpan event ke localStorage:', err);
  }
}

export function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fallback di bawah
  }
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function addEvent(event) {
  const events = getEvents();
  events.push(event);
  setEvents(events);
  return events;
}

export function updateEvent(id, updates) {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    setEvents(events);
  }
  return events;
}

export function deleteEvent(id) {
  const events = getEvents().filter(e => e.id !== id);
  setEvents(events);
  return events;
}

export function getEventsByDateRange(startDate, endDate) {
  const events = getEvents();
  return events.filter(e => e.date >= startDate && e.date <= endDate);
}

export function getEventsByDate(date) {
  const events = getEvents();
  return events.filter(e => e.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
}