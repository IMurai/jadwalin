# Bauhaus — Neo-Brutalist

## North Star: "Form Follows Function"
Bold, raw, and unapologetic. Inspired by Bauhaus and brutalist architecture. High contrast, strong geometry, deliberate imperfection.

## Colors
- **Primary (`#1a1a1a`):** Near-black for text, borders, and primary elements.
- **Accent Yellow (`#FFE600`):** High-energy highlight for CTAs, active states, and "Sedang" density.
- **Accent Red (`#FF4D4D`):** Destructive actions, alerts, bentrok/overlap warnings, and "Padat" density.
- **Accent Blue (`#0055ff`):** Links, primary buttons (contoh: Simpan), dan AI agent avatar/bubble.
- **Accent Mint (`#00E599`):** Konfirmasi positif, kategori aktivitas ringan, dan "Ringan" density.
- **Accent Purple (`#B388FF`):** Kategori tugas/proyek.
- **Accent Peach (`#FFAE73`):** Kategori personal/lainnya.
- **Background (`#f5f0e8`):** Warm off-white, like aged paper (surface utama).
- **Canvas (`#faf7f2`):** Off-white lebih terang, dipakai untuk panel/card di atas surface.
- Use flat, solid color blocks. No gradients on surfaces.

## Typography
- **Headlines:** Space Grotesk — geometric, bold, oversized.
- **Body:** Inter — functional and readable.
- **Mono/Label:** Space Mono — dipakai untuk timestamp, tag kategori, kode, dan label teknis (uppercase, tracking-wide).
- Scale contrast is key: headlines should feel massive relative to body text.

### Skala Ukuran (acuan konkret)
| Elemen | Ukuran | Font | Weight |
|---|---|---|---|
| Judul halaman (H1, misal "Desember 2024") | 24–30px | Space Grotesk | Extrabold/800 |
| Judul kartu/panel (H3, misal nama bulan mini calendar) | 16px | Space Grotesk | Black/900 |
| Judul event/jadwal dalam kartu | 12px | Space Grotesk | Extrabold |
| Body/teks form, deskripsi | 12–13px | Inter | Medium–Semibold |
| Label/tag/timestamp/mono | 9–11px | Space Mono | Bold, uppercase, letter-spacing lebar |

## Elevation
- No drop shadows. Use **thick solid borders** instead.
- Depth via **offset shadows**: solid-color block offsets (`brutal`: 4px, `brutal-sm`: 2px, `brutal-lg`: 6px, `brutal-xl`: 8px — semua offset ke arah kanan-bawah, warna `#1a1a1a`).

### Aturan Ketebalan Border (biar konsisten)
| Konteks | Border | Shadow |
|---|---|---|
| Container utama (panel kalender, panel chat, mini calendar) | 3px | `brutal-xl` |
| Card, tombol, input, modal | 2px | `brutal` atau `brutal-sm` |
| Pembatas antar baris/kolom di grid jadwal (non-interaktif) | 1px, opacity rendah (`border-ink/10` atau `/20`) | — |
| Slot kosong / area "+ Tambah" | 2px dashed | tanpa shadow |
| Radius | 0 (tegas, tanpa lengkung) — **kecuali** dot/lingkaran kepadatan di mini calendar yang memang bulat penuh (`rounded-full`) sebagai penanda status | — |

## Components

### Buttons
- Solid fill, thick border (2px), uppercase text, font Space Grotesk bold.
- **Default:** warna solid sesuai fungsi (yellow = aksi utama/tambah, blue = simpan/konfirmasi, mint = aksi positif seperti booking, white = aksi sekunder).
- **Hover:** sedikit gelapkan warna fill (atau invert ke `bg-ink text-white` untuk tombol outline/sekunder).
- **Active/klik:** geser isi tombol `translate-x-0.5 translate-y-0.5` sambil shadow mengecil dari `brutal` → `brutal-sm`, memberi ilusi tombol "ditekan" ke dalam.
- **Disabled:** turunkan opacity ke ~40%, hilangkan shadow, cursor `not-allowed`.
- **Focus (keyboard):** tambahkan outline 2px warna `neo-yellow` di luar border hitam agar tetap terlihat kontras.

### Cards (event/jadwal)
- Thick black borders (2px), no border-radius. Content-dense (waktu, judul, lokasi/tag ringkas).
- **Hover:** `translate-x-0.5 translate-y-0.5` + shadow mengecil (efek sama seperti tombol ditekan), `cursor-pointer`.
- Warna fill kartu = warna kategori (lihat pemetaan di bawah).

### Inputs
- Thick bottom border only (2px atau lebih tebal saat fokus). No rounded corners.
- **Focus:** background berubah ke putih bersih, border-bottom mempertebal atau berubah warna aksen.
- **Placeholder:** `text-ink/50`.

### Kategori Jadwal → Warna
Disesuaikan dengan konteks aplikasi (jadwal siswa ekstrakurikuler):

| Kategori | Warna |
|---|---|
| Sekolah | Accent Blue (`#0055ff`) atau varian biru muda (`#7dd3fc`) untuk sub-aktivitas sekolah |
| Futsal / Ekstrakurikuler | Accent Mint (`#00E599`) |
| Belajar | Accent Purple (`#B388FF`) |
| Main / Istirahat | Accent Peach (`#FFAE73`) |
| Lainnya | Neutral putih dengan border tebal (tanpa fill warna) |

### Mini Calendar & Indikator Kepadatan
- Setiap tanggal ditampilkan sebagai lingkaran (`rounded-full`, ukuran ~32px) dengan border 2px.
- Tanggal di luar bulan aktif: teks pudar (`text-ink/30`), tanpa fill, tanpa interaksi.
- Warna fill lingkaran mengikuti level kepadatan hari itu (lihat tabel), dengan `shadow-brutal-sm` untuk hari yang punya jadwal (kosong tidak pakai shadow).
- **Hari ini:** border 3px + ring tambahan warna kuning (`ring-2 ring-neo-yellow`) + dot kecil kuning di bawah angka, supaya tetap jelas dibedakan dari indikator kepadatan.
- **Hover:** `scale-105` pada lingkaran yang berisi jadwal.
- Tooltip/title saat hover menampilkan jumlah kegiatan (contoh: "5+ Kegiatan").

| Level | Warna Fill | Kriteria |
|---|---|---|
| Kosong | Putih, border saja (tanpa shadow) | 0 jam terjadwal |
| Ringan | Accent Mint | 0–3 jam terjadwal |
| Sedang | Accent Yellow | 3–6 jam terjadwal |
| Padat | Accent Red (teks putih) | >6 jam, atau ada bentrok antar jadwal |

Legenda kepadatan (dot kecil + label) selalu ditampilkan di bagian bawah mini calendar.

### AI Chat Panel
- Header panel: avatar kotak "AI" (background Accent Blue, border 2px, teks putih mono bold) + judul + badge kecil opsional (misal "PRO") + status hijau mint kecil ("Siap membantu...").
- **Bubble AI:** rata kiri, background `canvas` (`#faf7f2`), border 2px + `brutal-sm`, teks Inter medium. Highlight kata penting (tanggal, jam) dengan `bg-neo-yellow` atau underline merah.
- **Bubble User:** rata kanan, background Accent Blue solid, teks putih, font Space Grotesk bold (beda dari bubble AI supaya kontras jelas siapa yang bicara).
- **Kartu konfirmasi aksi** (contoh: slot kosong yang ditemukan): kotak putih di dalam bubble AI, border 2px, berisi info ringkas + tombol aksi kecil (misal "Booking", warna mint).
- **Quick action chips:** tombol kecil rata horizontal, scrollable, background putih, border 2px, hover ke `neo-yellow`, ada emoji/icon kecil di depan teks.
- **Input chat:** border 2px, tombol kirim bulat-persegi warna kuning di dalam input (posisi absolute kanan), ikon panah.

## Responsive / Breakpoints
- **Desktop (≥1280px, `xl`):** layout 2 kolom — kalender utama (lebih lebar) di kiri, sidebar (mini calendar + AI chat) di kanan, tinggi penuh layar dengan scroll internal per panel.
- **Tablet/mobile (<1280px):** kolom disusun vertikal (stacked): kalender utama di atas, mini calendar, lalu panel AI chat di bawah — masing-masing full width.
- Di lebar sempit, filter kategori (pills) boleh disembunyikan (`hidden` di bawah `md`) untuk hemat ruang, cukup andalkan warna pada kartu jadwal.
- Ukuran font dan padding tidak perlu berubah drastis antar breakpoint — desain ini memang tetap terasa "padat/dense" secara sengaja, cukup pastikan elemen interaktif (tombol, lingkaran tanggal) tetap punya area sentuh minimal ~32px agar nyaman di touchscreen.

## Rules
- Never use soft shadows or glassmorphism. Keep it raw and graphic.
- Embrace asymmetric layouts and oversized type.
- Limited palette: black + satu atau dua warna aksen per section (jangan campur semua warna aksen dalam satu komponen kecil).
- Konsistensi kepadatan (border tebal, offset shadow, uppercase mono label) harus terasa di **semua** komponen baru yang dibangun, bukan hanya di komponen yang sudah ada di `design.html`.
