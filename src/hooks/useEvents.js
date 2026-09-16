import { useState, useEffect, useCallback } from 'react';
import {
  getEvents,
  setEvents,
  generateId,
} from '../lib/storage';
import { calculateDailyDensity, analyzeDensityRange, findFreeSlots } from '../lib/density';
import { getTodayStr } from '../lib/date';

const CATEGORY_COLORS = {
  sekolah: '#0055ff',
  futsal: '#00E599',
  belajar: '#B388FF',
  main: '#FFAE73',
  lainnya: 'white',
};

function enrichEvent(event) {
  return {
    ...event,
    color: event.color || CATEGORY_COLORS[event.category] || CATEGORY_COLORS.lainnya,
    createdBy: event.createdBy || 'user',
  };
}

export function useEvents() {
  const [events, setEventsState] = useState(() => getEvents().map(enrichEvent));
  const [selectedDate, setSelectedDate] = useState(() => getTodayStr());

  // Single source of truth: state -> localStorage. Jangan tulis langsung
  // ke storage di add/update/delete agar tidak terjadi lost-update.
  useEffect(() => {
    setEvents(events);
  }, [events]);

  const addEvent = useCallback((eventData) => {
    const newEvent = {
      id: generateId(),
      ...eventData,
      color: CATEGORY_COLORS[eventData.category] || CATEGORY_COLORS.lainnya,
      createdBy: 'user',
    };
    setEventsState(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id, updates) => {
    const { _delete, ...safeUpdates } = updates || {};
    setEventsState(prev => prev.map(e => e.id === id ? { ...e, ...safeUpdates } : e));
  }, []);

  const deleteEvent = useCallback((id) => {
    setEventsState(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEventsForDate = useCallback((date) => {
    return events
      .filter(e => e.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(enrichEvent);
  }, [events]);

  const getEventsForRange = useCallback((startDate, endDate) => {
    return events
      .filter(e => e.date >= startDate && e.date <= endDate)
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
      .map(enrichEvent);
  }, [events]);

  const getDensityForDate = useCallback((date) => {
    return calculateDailyDensity(events, date);
  }, [events]);

  const getDensityForRange = useCallback((startDate, endDate) => {
    return analyzeDensityRange(events, startDate, endDate);
  }, [events]);

  const getFreeSlots = useCallback((date, durationMinutes, afterTime, beforeTime) => {
    return findFreeSlots(events, date, durationMinutes, afterTime, beforeTime);
  }, [events]);

  const addEventFromAI = useCallback((eventData) => {
    const newEvent = {
      id: generateId(),
      ...eventData,
      color: CATEGORY_COLORS[eventData.category] || CATEGORY_COLORS.lainnya,
      createdBy: 'ai',
    };
    setEventsState(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEventFromAI = useCallback((id, fields) => {
    const { _delete, ...safeFields } = fields || {};
    setEventsState(prev => prev.map(e => e.id === id ? { ...e, ...safeFields } : e));
  }, []);

  const deleteEventFromAI = useCallback((id) => {
    setEventsState(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    events,
    selectedDate,
    setSelectedDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForRange,
    getDensityForDate,
    getDensityForRange,
    getFreeSlots,
    addEventFromAI,
    updateEventFromAI,
    deleteEventFromAI,
  };
}