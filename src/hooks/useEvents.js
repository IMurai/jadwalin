import { useState, useEffect, useCallback } from 'react';
import {
  getEvents,
  setEvents,
  generateId,
  addEvent as storageAddEvent,
  updateEvent as storageUpdateEvent,
  deleteEvent as storageDeleteEvent,
  getEventsByDate,
  getEventsByDateRange,
} from '../lib/storage';
import { calculateDailyDensity, analyzeDensityRange, findFreeSlots } from '../lib/density';

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
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

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
    storageAddEvent(newEvent);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id, updates) => {
    setEventsState(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    storageUpdateEvent(id, updates);
  }, []);

  const deleteEvent = useCallback((id) => {
    setEventsState(prev => prev.filter(e => e.id !== id));
    storageDeleteEvent(id);
  }, []);

  const getEventsForDate = useCallback((date) => {
    return getEventsByDate(date).map(enrichEvent);
  }, []);

  const getEventsForRange = useCallback((startDate, endDate) => {
    return getEventsByDateRange(startDate, endDate).map(enrichEvent);
  }, []);

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
    storageAddEvent(newEvent);
    return newEvent;
  }, []);

  const updateEventFromAI = useCallback((id, fields) => {
    setEventsState(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e));
    storageUpdateEvent(id, fields);
  }, []);

  const deleteEventFromAI = useCallback((id) => {
    setEventsState(prev => prev.filter(e => e.id !== id));
    storageDeleteEvent(id);
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