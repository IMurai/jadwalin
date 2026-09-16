const GEMINI_MODEL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || 'gemini-3.6-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_TIMEOUT_MS = 30000;

const SYSTEM_PROMPT = `Anda adalah AI Schedule Agent untuk siswa ekstrakurikuler (futsal).
Tugas Anda: bantu mengelola jadwal sekolah, futsal, belajar, dan main/istirahat.
Gunakan tools yang tersedia untuk menambah, mengedit, menghapus jadwal, mencari slot kosong, dan menganalisis kepadatan.
Jawab dalam bahasa Indonesia, ramah, dan praktis.
Highlight tanggal/jam penting dengan format yang jelas.
Jika mendeteksi jadwal padat (>6 jam/hari atau bentrok), beri saran proaktif (sesi fokus, istirahat, hindari burnout).`;

const TOOLS_SCHEMA = [
  {
    name: 'add_event',
    description: 'Menambah jadwal baru',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Judul jadwal' },
        date: { type: 'STRING', description: 'Tanggal YYYY-MM-DD' },
        startTime: { type: 'STRING', description: 'Jam mulai HH:mm' },
        endTime: { type: 'STRING', description: 'Jam selesai HH:mm' },
        location: { type: 'STRING', description: 'Lokasi (opsional)' },
        category: { type: 'STRING', enum: ['sekolah', 'futsal', 'belajar', 'main', 'lainnya'], description: 'Kategori jadwal' },
      },
      required: ['title', 'date', 'startTime', 'endTime', 'category'],
    },
  },
  {
    name: 'edit_event',
    description: 'Mengubah jadwal yang sudah ada',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: { type: 'STRING', description: 'ID jadwal yang akan diubah' },
        fields: {
          type: 'OBJECT',
          description: 'Field yang akan diupdate (partial)',
          properties: {
            title: { type: 'STRING' },
            date: { type: 'STRING' },
            startTime: { type: 'STRING' },
            endTime: { type: 'STRING' },
            location: { type: 'STRING' },
            category: { type: 'STRING', enum: ['sekolah', 'futsal', 'belajar', 'main', 'lainnya'] },
          },
        },
      },
      required: ['eventId', 'fields'],
    },
  },
  {
    name: 'delete_event',
    description: 'Menghapus jadwal',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: { type: 'STRING', description: 'ID jadwal yang akan dihapus' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'find_free_slot',
    description: 'Mencari slot kosong sesuai kriteria',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'Tanggal YYYY-MM-DD (opsional jika pakai rentang)' },
        dateStart: { type: 'STRING', description: 'Tanggal mulai rentang YYYY-MM-DD' },
        dateEnd: { type: 'STRING', description: 'Tanggal akhir rentang YYYY-MM-DD' },
        durationMinutes: { type: 'NUMBER', description: 'Durasi dalam menit' },
        afterTime: { type: 'STRING', description: 'Jam setelah HH:mm (default 06:00)' },
        beforeTime: { type: 'STRING', description: 'Jam sebelum HH:mm (default 22:00)' },
      },
      required: ['durationMinutes'],
    },
  },
  {
    name: 'get_schedule',
    description: 'Mengambil daftar jadwal pada rentang tanggal',
    parameters: {
      type: 'OBJECT',
      properties: {
        dateStart: { type: 'STRING', description: 'Tanggal mulai YYYY-MM-DD' },
        dateEnd: { type: 'STRING', description: 'Tanggal akhir YYYY-MM-DD' },
      },
      required: ['dateStart', 'dateEnd'],
    },
  },
  {
    name: 'analyze_density',
    description: 'Menganalisis tingkat kepadatan per hari',
    parameters: {
      type: 'OBJECT',
      properties: {
        dateStart: { type: 'STRING', description: 'Tanggal mulai YYYY-MM-DD' },
        dateEnd: { type: 'STRING', description: 'Tanggal akhir YYYY-MM-DD' },
      },
      required: ['dateStart', 'dateEnd'],
    },
  },
];

export function buildApiContents(messages, eventsContext) {
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Siap! Apa yang bisa saya bantu untuk jadwal Anda hari ini?' }] },
  ];

  if (eventsContext) {
    contents.push({
      role: 'user',
      parts: [{ text: `Konteks jadwal terkini (${eventsContext.start} s.d. ${eventsContext.end}):\n${eventsContext.summary}` }],
    });
  }

  for (const m of messages) {
    // Dukung history API-native (functionCall / functionResponse) agar
    // hasil tool tidak hilang di iterasi berikutnya.
    if (m.parts) {
      // Gemini API v3.6+ tidak support role 'function'.
      // Function response harus dikirim sebagai role 'user'.
      const apiRole = m.role === 'function' ? 'user' : m.role;
      contents.push({ role: apiRole, parts: m.parts });
    } else {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      });
    }
  }

  return contents;
}

export async function callGeminiWithContents(apiKey, contents, availableTools) {
  const body = {
    contents,
    tools: [{ functionDeclarations: availableTools }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Gemini API timeout (30 detik). Coba lagi.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
  }

  return response.json();
}

export async function callGeminiAPI(apiKey, messages, availableTools, eventsContext) {
  const contents = buildApiContents(messages, eventsContext);
  return callGeminiWithContents(apiKey, contents, availableTools);
}

export function buildEventsContext(events, dateStart, dateEnd) {
  const filtered = (events || []).filter(e => e.date >= dateStart && e.date <= dateEnd);
  if (filtered.length === 0) return null;

  const byDate = {};
  for (const e of filtered) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }

  const summary = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, evs]) => {
      const items = evs.map(e => `  - [${e.id}] ${e.startTime}-${e.endTime} ${e.title} (${e.category})${e.location ? ` @ ${e.location}` : ''}`).join('\n');
      return `${date}:\n${items}`;
    })
    .join('\n\n');

  return { start: dateStart, end: dateEnd, summary };
}

export { TOOLS_SCHEMA };