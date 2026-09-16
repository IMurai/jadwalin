# AGENT.md — AI Calendar untuk Siswa Ekstrakurikuler

> Dokumen ini adalah spesifikasi acuan untuk AI coding agent (Opencode) dalam membangun proyek ini.
> Referensi desain UI/UX ada di `design.md` dan contoh implementasi kasar di `design.html`, keduanya tersedia di folder `project-root`. Baca kedua file tersebut sebelum mulai coding.

---

## 1. Konteks & Masalah

Target pengguna adalah siswa yang mengikuti kegiatan ekstrakurikuler (contoh: futsal) dan sering kesulitan membagi waktu antara:
- Jadwal sekolah
- Jadwal ekstrakurikuler (futsal)
- Waktu belajar
- Waktu main / istirahat

Masalah inti: pengguna **bingung melihat gambaran jadwalnya secara keseluruhan** dan **kesulitan menemukan waktu kosong** untuk belajar atau istirahat di sela-sela aktivitas yang padat. Solusinya adalah kalender web dengan AI agent yang bisa membaca, mengatur, dan memberi saran jadwal secara percakapan (chat), bukan cuma kalender pasif.

## 2. Tujuan Produk

1. Pengguna bisa melihat seluruh jadwalnya (sekolah, futsal, belajar, main) dalam satu tampilan kalender.
2. Pengguna bisa menambah/mengedit/menghapus jadwal secara manual dengan cepat.
3. Pengguna bisa "ngobrol" dengan AI agent untuk menambah jadwal, mencari slot kosong, atau minta saran (misalnya menghindari jadwal terlalu padat / burnout).
4. Pengguna langsung tahu hari mana yang padat dan hari mana yang longgar lewat indikator visual di kalender mini.

## 3. Target Pengguna

- Single user, tanpa sistem login/akun (aplikasi personal, dipakai sendiri oleh 1 orang).
- Menggunakan bahasa Indonesia sebagai bahasa antarmuka utama.
- Kemungkinan besar diakses dari laptop maupun HP, jadi harus tetap nyaman dipakai di layar sempit meskipun desain awal berorientasi desktop (lihat §10 Responsive).

## 4. Tech Stack

| Bagian | Pilihan |
|---|---|
| Frontend framework | React + Vite |
| Styling | Tailwind CSS (utility classes), mengikuti token warna & style di `design.md` |
| Font | Space Grotesk (headline/display), Inter (body), Space Mono (label/mono/timestamp) — via Google Fonts |
| State management | React state/hooks bawaan (useState/useReducer/useContext) — proyek kecil, **tidak perlu** Redux/Zustand kecuali kompleksitas AI agent membutuhkannya nanti |
| Penyimpanan data | **localStorage** (browser), tanpa backend, tanpa database eksternal |
| AI Model | Google Gemini API (dipanggil langsung dari frontend menggunakan API key) |
| Deployment target | Static hosting (misal Vercel/Netlify) — karena tidak ada backend |

**Catatan penting soal API key:** karena tidak ada backend, Gemini API key akan terekspos di sisi client. Ini bisa diterima untuk proyek personal/skala kecil seperti ini, tapi:
- Simpan key di file `.env` (`VITE_GEMINI_API_KEY=...`), jangan hardcode di source code.
- Tambahkan `.env` ke `.gitignore`.
- Beri tahu pengguna (lewat komentar/README) bahwa jika proyek ini di-deploy publik, key sebaiknya dibatasi (restricted) dari Google Cloud Console, atau di masa depan dipindah ke backend/proxy ringan.

## 5. Struktur Proyek (usulan)

```
ai-calender/
├── project-root/
│   ├── agent.md
│   ├── design.md
│   ├── design.html
├── .env
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── WeekView.jsx
│   │   │   ├── MonthMiniCalendar.jsx      # kalender mini + indikator kepadatan
│   │   │   ├── EventCard.jsx
│   │   │   └── EventModal.jsx             # form tambah/edit jadwal manual
│   │   └── ai-agent/
│   │       ├── ChatPanel.jsx
│   │       ├── ChatBubble.jsx
│   │       └── QuickActionChips.jsx
│   ├── hooks/
│   │   ├── useEvents.js                   # CRUD + sinkronisasi localStorage
│   │   └── useGeminiAgent.js              # komunikasi ke Gemini API + function calling
│   ├── lib/
│   │   ├── storage.js                     # get/set localStorage
│   │   ├── density.js                     # kalkulasi tingkat kepadatan per hari
│   │   └── gemini.js                      # wrapper fetch ke Gemini API + tool schema
│   └── styles/
│       └── index.css
└── package.json
```

## 6. Data Model

### Event (jadwal)
```ts
{
  id: string,            // uuid
  title: string,
  date: string,           // "YYYY-MM-DD"
  startTime: string,       // "HH:mm"
  endTime: string,         // "HH:mm"
  location: string | null,
  category: "sekolah" | "futsal" | "belajar" | "main" | "lainnya",
  color: string,           // ditentukan otomatis dari category, lihat design.md
  createdBy: "user" | "ai" // untuk membedakan jadwal manual vs hasil AI agent
}
```

- Disimpan sebagai array JSON di localStorage, key: `ai-calendar-events`.
- Semua operasi CRUD (tambah/edit/hapus) harus lewat satu hook terpusat (`useEvents`) supaya AI agent dan form manual memakai sumber data yang sama dan selalu sinkron.

## 7. Fitur Utama (MVP)

### 7.1 Tambah / Edit / Hapus Jadwal Manual
- Tombol "+ Tambah Jadwal" membuka modal (lihat referensi modal di `design.html`).
- Form: judul, tanggal, jam mulai, jam selesai, lokasi (opsional), kategori/label.
- Validasi dasar: jam selesai > jam mulai; field wajib tidak boleh kosong.
- Klik jadwal yang sudah ada → buka modal yang sama dalam mode edit, dengan tombol hapus.

### 7.2 AI Schedule Agent (chat)
Panel chat di sisi kanan (lihat `design.html` bagian `ai-assistant-chat-panel`). AI agent harus bisa:
- Menambahkan jadwal baru dari instruksi bahasa natural ("atur meeting besok jam 10 pagi").
- Mengedit / memindahkan (reschedule) jadwal yang sudah ada.
- Mencari slot kosong sesuai durasi & batasan waktu yang diminta ("carikan slot kosong setelah jam 14:00").
- Memberi saran proaktif ketika mendeteksi jadwal padat (contoh: usul sesi fokus/istirahat di sela jadwal padat, mengingatkan potensi bentrok antar jadwal).
- Quick action chips sebagai shortcut: "Cari slot kosong", "Reschedule jadwal", "Analisis kepadatan minggu ini".

Implementasi disarankan pakai **function calling** Gemini API dengan tools berikut (nama & parameter bisa disesuaikan saat implementasi, ini acuan awal):

| Tool | Parameter | Fungsi |
|---|---|---|
| `add_event` | title, date, startTime, endTime, location?, category | Menambah jadwal baru |
| `edit_event` | eventId, fields (partial) | Mengubah jadwal yang sudah ada |
| `delete_event` | eventId | Menghapus jadwal |
| `find_free_slot` | date atau rentang tanggal, durationMinutes, afterTime?, beforeTime? | Mencari slot kosong sesuai kriteria |
| `get_schedule` | dateStart, dateEnd | Mengambil daftar jadwal pada rentang tanggal (untuk konteks jawaban AI) |
| `analyze_density` | dateStart, dateEnd | Menghitung tingkat kepadatan per hari (lihat §7.3) |

Alur: pesan user → Gemini menentukan tool yang relevan (bisa lebih dari satu langkah) → hasil tool dieksekusi di frontend terhadap data localStorage → hasil dikirim balik ke Gemini → Gemini rangkai jadi balasan natural ke user → tampilkan di chat (termasuk kartu konfirmasi seperti contoh "Booking" di `design.html` bila relevan).

### 7.3 Indikator Kepadatan di Kalender Mini
Setiap tanggal di kalender mini diberi warna sesuai tingkat kepadatan hari itu (lihat contoh visual: kosong/ringan/sedang/padat dengan warna berbeda di `design.html`).

Aturan default (boleh disesuaikan saat implementasi, taruh sebagai konstanta yang mudah diubah di `lib/density.js`):

| Level | Kriteria (total jam terjadwal dalam sehari) |
|---|---|
| Kosong | 0 jam |
| Ringan | > 0 – 3 jam |
| Sedang | > 3 – 6 jam |
| Padat | > 6 jam, ATAU ada bentrok/overlap antar jadwal |

Fungsi `analyze_density` pada AI agent (§7.2) memakai logika yang sama, supaya jawaban AI konsisten dengan warna yang tampil di kalender mini.

## 8. Integrasi AI (Google Gemini API)

- Panggil Gemini API langsung dari `lib/gemini.js` menggunakan `fetch`, dengan API key dari `import.meta.env.VITE_GEMINI_API_KEY`.
- Definisikan tools (§7.2) sesuai format function calling Gemini.
- Sertakan konteks jadwal terkini (hasil `get_schedule`) secukupnya ke setiap request supaya AI punya gambaran jadwal user, tanpa mengirim seluruh histori event kalau tidak perlu (hemat token).
- Tangani error (API gagal / rate limit) dengan pesan fallback yang ramah di chat, bukan aplikasi crash.

## 9. Referensi Desain (UI/UX)

Ikuti `design.md` untuk seluruh keputusan visual (warna, tipografi, elevasi ala neo-brutalist dengan border tebal + offset shadow, komponen tombol/kartu/input). Gunakan `design.html` sebagai referensi struktur markup/kelas Tailwind, tapi **bukan sumber kebenaran final** — style token yang benar mengikuti `design.md` bila ada perbedaan kecil antara keduanya.

## 10. Non-Functional Requirements

- **Tanpa backend/database eksternal** — semua data hidup di localStorage browser.
- **Responsive**: layout 2 kolom (kalender utama + panel AI) di desktop boleh menjadi susun-tumpuk (stacked) di layar sempit/mobile.
- Perubahan data (tambah/edit/hapus, baik manual maupun via AI) harus langsung tersinkron ke localStorage dan ter-refresh di semua bagian UI (kalender utama, kalender mini, chat) tanpa perlu reload halaman.
- Bahasa antarmuka: Indonesia.

## 11. Batasan / Out of Scope (MVP)

- Tidak ada sistem login/multi-user.
- Tidak ada notifikasi push/reminder terjadwal (di luar MVP awal).
- Tidak ada sinkronisasi ke Google Calendar atau kalender eksternal lain.
- Tidak ada backend — jadi data tidak akan tersinkron lintas perangkat/browser.

## 12. Saran Fitur Tambahan (untuk didiskusikan, belum masuk MVP)

Ini bukan bagian dari scope wajib — cukup bahan diskusi sebelum dikerjakan:

- **Reminder/notifikasi browser** sebelum jadwal dimulai (pakai Notification API).
- **Ringkasan mingguan otomatis dari AI** (misalnya setiap Minggu malam, AI merangkum minggu depan dan menandai potensi hari terlalu padat).
- **Mode "belajar fokus"**: AI otomatis mengalokasikan slot belajar berdasarkan jadwal ujian/tugas yang diinput user.
- **Export/Import jadwal** sebagai file JSON, sebagai bentuk backup sederhana karena data hanya di localStorage (tidak ada backend).

---

**Instruksi untuk Opencode saat membangun proyek ini:**
1. Ikuti struktur folder di §5 sebagai baseline, boleh disesuaikan bila ada alasan teknis yang jelas.
2. Bangun fitur manual CRUD jadwal (§7.1) terlebih dahulu, karena AI agent (§7.2) bergantung pada hook `useEvents` yang sama.
3. Implementasikan kalkulasi kepadatan (§7.3) sebagai fungsi murni (pure function) yang bisa dipakai baik oleh UI kalender mini maupun tool `analyze_density` milik AI agent.
4. Ikuti `design.md` untuk semua keputusan visual.
