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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function generateId() {
  return crypto.randomUUID();
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