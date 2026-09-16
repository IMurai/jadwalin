import { useState, useCallback } from 'react';
import { callGeminiWithContents, buildApiContents, buildEventsContext, TOOLS_SCHEMA } from '../lib/gemini';
import { getTodayStr, addDaysStr, parseLocalDateStr, toLocalDateStr } from '../lib/date';

function normalizeArgs(args) {
  if (!args) return {};
  if (typeof args === 'string') {
    try {
      return JSON.parse(args);
    } catch {
      return {};
    }
  }
  return args;
}

export function useGeminiAgent({ events, addEventFromAI, updateEventFromAI, deleteEventFromAI, getEventsForRange, getFreeSlots, getDensityForRange }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const executeTool = useCallback(async (toolName, rawArgs) => {
    const args = normalizeArgs(rawArgs);
    switch (toolName) {
      case 'add_event': {
        if (!args.title || !args.date || !args.startTime || !args.endTime || !args.category) {
          return { success: false, message: 'Parameter add_event tidak lengkap (title, date, startTime, endTime, category wajib).' };
        }
        if (args.endTime <= args.startTime) {
          return { success: false, message: 'Jam selesai harus setelah jam mulai.' };
        }
        const event = addEventFromAI(args);
        return { success: true, event, message: `Jadwal "${event.title}" ditambahkan pada ${event.date} ${event.startTime}-${event.endTime}` };
      }
      case 'edit_event': {
        if (!args.eventId || !args.fields) {
          return { success: false, message: 'Parameter edit_event tidak lengkap (eventId, fields wajib).' };
        }
        updateEventFromAI(args.eventId, args.fields);
        return { success: true, message: `Jadwal ${args.eventId} diperbarui` };
      }
      case 'delete_event': {
        if (!args.eventId) {
          return { success: false, message: 'Parameter delete_event tidak lengkap (eventId wajib).' };
        }
        deleteEventFromAI(args.eventId);
        return { success: true, message: 'Jadwal dihapus' };
      }
      case 'find_free_slot': {
        const { date, dateStart, dateEnd, durationMinutes, afterTime = '06:00', beforeTime = '22:00' } = args;
        if (!durationMinutes || durationMinutes <= 0) {
          return { success: false, message: 'durationMinutes harus > 0.' };
        }
        let slots = [];
        if (date) {
          const daySlots = getFreeSlots(date, durationMinutes, afterTime, beforeTime);
          slots = daySlots.map(s => ({ date, ...s }));
        } else if (dateStart && dateEnd) {
          const current = parseLocalDateStr(dateStart);
          const end = parseLocalDateStr(dateEnd);
          let guard = 0;
          while (current <= end && guard < 367) {
            guard += 1;
            const dateStr = toLocalDateStr(current);
            const daySlots = getFreeSlots(dateStr, durationMinutes, afterTime, beforeTime);
            if (daySlots.length > 0) {
              slots.push({ date: dateStr, slots: daySlots });
            }
            current.setDate(current.getDate() + 1);
          }
        } else {
          return { success: false, message: 'Isi date atau (dateStart + dateEnd) untuk find_free_slot.' };
        }
        return { success: true, slots, message: slots.length > 0 ? `Ditemukan ${slots.length} slot kosong` : 'Tidak ada slot kosong yang sesuai' };
      }
      case 'get_schedule': {
        const { dateStart, dateEnd } = args;
        if (!dateStart || !dateEnd) {
          return { success: false, message: 'dateStart dan dateEnd wajib untuk get_schedule.' };
        }
        const schedule = getEventsForRange(dateStart, dateEnd);
        return { success: true, schedule, message: `${schedule.length} jadwal ditemukan` };
      }
      case 'analyze_density': {
        const { dateStart, dateEnd } = args;
        if (!dateStart || !dateEnd) {
          return { success: false, message: 'dateStart dan dateEnd wajib untuk analyze_density.' };
        }
        const density = getDensityForRange(dateStart, dateEnd);
        return { success: true, density, message: 'Analisis kepadatan selesai' };
      }
      default:
        return { success: false, message: `Tool tidak dikenal: ${toolName}` };
    }
  }, [addEventFromAI, updateEventFromAI, deleteEventFromAI, getFreeSlots, getEventsForRange, getDensityForRange]);

  const sendMessage = useCallback(async (userText) => {
    if (!apiKey) {
      const msg = 'API Key Gemini tidak ditemukan. Tambahkan VITE_GEMINI_API_KEY ke file .env';
      setError(msg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${msg}. AI tidak bisa menjawab tanpa API key.`,
        timestamp: Date.now(),
        isError: true,
      }]);
      return;
    }

    const userMessage = { role: 'user', content: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const today = getTodayStr();
      const nextWeekStr = addDaysStr(today, 7);

      const eventsContext = buildEventsContext(events, today, nextWeekStr);

      // History API-native: UI messages + function exchanges
      let apiHistory = [...messages, userMessage];
      const toolCalls = [];
      let finalText = null;

      for (let step = 0; step < 3; step++) {
        const contents = buildApiContents(apiHistory, step === 0 ? eventsContext : null);
        const response = await callGeminiWithContents(apiKey, contents, TOOLS_SCHEMA);
        const candidate = response.candidates?.[0];

        if (!candidate) throw new Error('Tidak ada respons dari AI');

        const functionCalls = candidate.content?.parts?.filter(p => p.functionCall) || [];
        const textPart = candidate.content?.parts?.find(p => p.text)?.text;

        if (functionCalls.length > 0) {
          // Simpan functionCall model ke history agar konteks tidak hilang
          apiHistory.push({
            role: 'model',
            parts: candidate.content.parts.filter(p => p.functionCall || p.text),
          });
          for (const part of functionCalls) {
            const { name, args } = part.functionCall;
            const result = await executeTool(name, args);
            toolCalls.push({ name, args: normalizeArgs(args), result });
            // Role 'function' sesuai spec Gemini agar model membaca hasil tool
            apiHistory.push({
              role: 'function',
              parts: [{ functionResponse: { name, response: result } }],
            });
          }
          // Jika ini step terakhir dan tidak ada teks, lanjut agar loop memberi fallback
          if (step === 2 && !textPart) break;
          continue;
        }

        if (textPart) {
          finalText = textPart;
        }
        break;
      }

      if (finalText) {
        const aiMessage = {
          role: 'assistant',
          content: finalText,
          timestamp: Date.now(),
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else if (toolCalls.length > 0) {
        // Fallback: tool jalan tapi model tidak mengembalikan teks
        const summary = toolCalls.map(t => `• ${t.name}: ${t.result?.message || 'selesai'}`).join('\n');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Perintah selesai dijalankan:\n${summary}`,
          timestamp: Date.now(),
          toolCalls,
        }]);
      } else {
        throw new Error('AI tidak mengembalikan jawaban. Coba lagi.');
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
