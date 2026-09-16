import { useState, useCallback } from 'react';
import { callGeminiAPI, buildEventsContext, TOOLS_SCHEMA } from '../lib/gemini';
import { getEvents } from '../lib/storage';

export function useGeminiAgent({ events, addEventFromAI, updateEventFromAI, deleteEventFromAI, getEventsForRange, getFreeSlots, getDensityForRange }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const executeTool = useCallback(async (toolName, args) => {
    switch (toolName) {
      case 'add_event': {
        const event = addEventFromAI(args);
        return { success: true, event, message: `Jadwal "${event.title}" ditambahkan pada ${event.date} ${event.startTime}-${event.endTime}` };
      }
      case 'edit_event': {
        updateEventFromAI(args.eventId, args.fields);
        return { success: true, message: `Jadwal ${args.eventId} diperbarui` };
      }
      case 'delete_event': {
        deleteEventFromAI(args.eventId);
        return { success: true, message: 'Jadwal dihapus' };
      }
      case 'find_free_slot': {
        const { date, dateStart, dateEnd, durationMinutes, afterTime = '06:00', beforeTime = '22:00' } = args;
        let slots = [];
        if (date) {
          slots = getFreeSlots(date, durationMinutes, afterTime, beforeTime);
        } else if (dateStart && dateEnd) {
          const current = new Date(dateStart);
          const end = new Date(dateEnd);
          while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const daySlots = getFreeSlots(dateStr, durationMinutes, afterTime, beforeTime);
            if (daySlots.length > 0) {
              slots.push({ date: dateStr, slots: daySlots });
            }
            current.setDate(current.getDate() + 1);
          }
        }
        return { success: true, slots, message: slots.length > 0 ? `Ditemukan ${slots.length} slot kosong` : 'Tidak ada slot kosong yang sesuai' };
      }
      case 'get_schedule': {
        const { dateStart, dateEnd } = args;
        const schedule = getEventsForRange(dateStart, dateEnd);
        return { success: true, schedule, message: `${schedule.length} jadwal ditemukan` };
      }
      case 'analyze_density': {
        const { dateStart, dateEnd } = args;
        const density = getDensityForRange(dateStart, dateEnd);
        return { success: true, density, message: 'Analisis kepadatan selesai' };
      }
      default:
        return { success: false, message: `Tool tidak dikenal: ${toolName}` };
    }
  }, [addEventFromAI, updateEventFromAI, deleteEventFromAI, getFreeSlots, getEventsForRange, getDensityForRange]);

  const sendMessage = useCallback(async (userText) => {
    if (!apiKey) {
      setError('API Key Gemini tidak ditemukan. Tambahkan VITE_GEMINI_API_KEY ke file .env');
      return;
    }

    const userMessage = { role: 'user', content: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const eventsContext = buildEventsContext(events, today, nextWeekStr);

      let currentMessages = [...messages, userMessage];
      let toolCalls = [];

      for (let step = 0; step < 3; step++) {
        const response = await callGeminiAPI(apiKey, currentMessages, TOOLS_SCHEMA, eventsContext);
        const candidate = response.candidates?.[0];

        if (!candidate) throw new Error('Tidak ada respons dari AI');

        const functionCalls = candidate.content?.parts?.filter(p => p.functionCall) || [];
        const textPart = candidate.content?.parts?.find(p => p.text)?.text;

        if (functionCalls.length > 0) {
          for (const part of functionCalls) {
            const { name, args } = part.functionCall;
            const result = await executeTool(name, args);
            toolCalls.push({ name, args, result });
            currentMessages.push({
              role: 'model',
              parts: [{ functionResponse: { name, response: result } }],
            });
          }
          continue;
        }

        if (textPart) {
          const aiMessage = {
            role: 'assistant',
            content: textPart,
            timestamp: Date.now(),
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          };
          setMessages(prev => [...prev, aiMessage]);
        }
        break;
      }
    } catch (err) {
      console.error('Gemini error:', err);
      const fallbackMessage = {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti atau periksa koneksi internet.',
        timestamp: Date.now(),
        isError: true,
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, messages, events, executeTool]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}