import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'sekolah', label: 'Sekolah', color: 'bg-neo-blue' },
  { value: 'futsal', label: 'Futsal', color: 'bg-neo-mint' },
  { value: 'belajar', label: 'Belajar', color: 'bg-neo-purple' },
  { value: 'main', label: 'Main', color: 'bg-neo-peach' },
  { value: 'lainnya', label: 'Lainnya', color: 'bg-white border-ink' },
];

const TIME_OPTIONS = Array.from({ length: 36 }, (_, i) => {
  const hour = 6 + Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

function getDefaultEndTime(startTime) {
  const idx = TIME_OPTIONS.indexOf(startTime);
  if (idx !== -1 && TIME_OPTIONS[idx + 2]) return TIME_OPTIONS[idx + 2];
  const [h, m] = (startTime || '06:00').split(':').map(Number);
  const endH = h + 1;
  if (endH > 23) return '23:30';
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function EventModal({ event, initialDate, initialTime, onSave, onClose, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: 'sekolah',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || '',
        category: event.category,
      });
    } else {
      const start = initialTime || '06:00';
      setFormData({
        title: '',
        date: initialDate || format(new Date(), 'yyyy-MM-dd'),
        startTime: TIME_OPTIONS.includes(start) ? start : '06:00',
        endTime: getDefaultEndTime(TIME_OPTIONS.includes(start) ? start : '06:00'),
        location: '',
        category: 'sekolah',
      });
    }
    setErrors({});
  }, [event, initialDate, initialTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!formData.date) newErrors.date = 'Tanggal wajib diisi';
    if (!formData.startTime) newErrors.startTime = 'Jam mulai wajib diisi';
    if (!formData.endTime) newErrors.endTime = 'Jam selesai wajib diisi';
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'Jam selesai harus setelah jam mulai';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...formData });
    }
  };

  const handleDelete = () => {
    if (event && window.confirm('Yakin ingin menghapus jadwal ini?')) {
      if (onDelete) {
        onDelete(event.id);
      } else {
        onSave({ ...formData, _delete: true, id: event.id });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-ink/50" aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={event ? 'Edit Jadwal' : 'Jadwal Baru'}
        className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-white border-[3px] border-ink shadow-brutal-xl p-5 z-30 transition-all duration-200"
        style={{ borderWidth: '3px' }}
      >
        {/* Modal Header - Yellow bar */}
        <div className="flex items-center justify-between pb-3 border-b-[3px] border-ink bg-neo-yellow -m-5 mb-4 p-4" style={{ borderBottomWidth: '3px' }}>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-neo-red border-2 border-ink inline-block"></span>
            <span className="text-xs font-headline font-black uppercase tracking-wider text-ink">
              {event ? 'Edit Jadwal' : 'Jadwal Baru / Edit'}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white border-2 border-ink font-black text-ink hover:bg-neo-red hover:text-white transition flex items-center justify-center shadow-brutal-sm">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-ink mb-1">Judul Agenda</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`input-brutal ${errors.title ? 'border-neo-red' : ''}`}
              placeholder="Contoh: Latihan Futsal"
              autoFocus
            />
            {errors.title && <p className="text-[10px] font-mono text-neo-red mt-1">{errors.title}</p>}
          </div>

          {/* Date Selector Field */}
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-dim border-2 border-ink text-xs font-headline font-bold text-ink shadow-brutal-sm">
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-transparent border-0 p-0 text-xs font-headline font-bold text-ink focus:ring-0 w-full"
            />
          </div>

          {/* Time Slots Pickers */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between px-3 py-2 bg-white border-2 border-ink text-xs font-mono font-bold text-ink shadow-brutal-sm">
              <label className="text-[10px] font-mono font-bold uppercase text-ink/70">Mulai</label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-transparent border-0 p-0 text-xs font-mono font-bold text-ink focus:ring-0 w-auto appearance-none"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>{time} WIB</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-white border-2 border-ink text-xs font-mono font-bold text-ink shadow-brutal-sm">
              <label className="text-[10px] font-mono font-bold uppercase text-ink/70">Selesai</label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-transparent border-0 p-0 text-xs font-mono font-bold text-ink focus:ring-0 w-auto appearance-none"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>{time} WIB</option>
                ))}
              </select>
            </div>
          </div>
          {(errors.startTime || errors.endTime) && (
            <p className="text-[10px] font-mono text-neo-red">{errors.startTime || errors.endTime}</p>
          )}

          {/* Location Input */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-ink mb-1">Lokasi</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-ink shadow-brutal-sm">
              <span className="text-sm font-bold">📍</span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-transparent border-0 p-0 text-xs font-headline font-bold text-ink focus:ring-0 w-full"
                placeholder="Opsional"
              />
            </div>
          </div>

          {/* Categories Chips */}
          <div>
            <span className="text-[11px] font-mono font-bold uppercase text-ink block mb-1.5">Label Kategori:</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`px-2.5 py-1 border-2 border-ink shadow-brutal-sm text-[11px] font-headline font-bold transition-all ${
                    formData.category === cat.value
                      ? 'ring-2 ring-ink ring-offset-1'
                      : 'hover:bg-neo-yellow'
                  } ${cat.color}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t-2 border-ink flex items-center justify-between">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-white hover:bg-neo-red hover:text-white border-2 border-ink font-headline font-bold text-xs uppercase text-ink shadow-brutal-sm transition-all"
              >
                Hapus
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-neo-blue hover:bg-blue-700 text-white font-headline font-black text-xs uppercase border-2 border-ink shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm transition"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
