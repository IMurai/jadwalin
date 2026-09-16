import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const CATEGORIES = [
  { value: 'sekolah', label: 'Sekolah', color: 'bg-neo-blue' },
  { value: 'futsal', label: 'Futsal', color: 'bg-neo-mint' },
  { value: 'belajar', label: 'Belajar', color: 'bg-neo-purple' },
  { value: 'main', label: 'Main', color: 'bg-neo-peach' },
  { value: 'lainnya', label: 'Lainnya', color: 'bg-white border-ink' },
];

const TIME_OPTIONS = Array.from({ length: 34 }, (_, i) => {
  const hour = 6 + Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

export default function EventModal({ event, initialDate, initialTime, onSave, onClose }) {
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
      setFormData({
        title: '',
        date: initialDate || format(new Date(), 'yyyy-MM-dd'),
        startTime: initialTime || '06:00',
        endTime: TIME_OPTIONS[TIME_OPTIONS.indexOf(initialTime || '06:00') + 2] || '07:00',
        location: '',
        category: 'sekolah',
      });
    }
    setErrors({});
  }, [event, initialDate, initialTime]);

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
      onSave({ _delete: true, id: event.id });
    }
  };

  const formatDateDisplay = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'EEEE, d MMMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <aside className="absolute right-6 top-20 w-80 sm:w-96 bg-white border-3 border-ink shadow-brutal-xl p-5 z-30 panel-brutal">
      <div className="flex items-center justify-between pb-3 border-b-3 border-ink bg-neo-yellow -m-5 mb-4 p-4">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 bg-neo-red border-2 border-ink inline-block"></span>
          <span className="text-xs font-headline font-black uppercase tracking-wider text-ink">
            {event ? 'Edit Jadwal' : 'Jadwal Baru'}
          </span>
        </div>
        <button onClick={onClose} className="w-7 h-7 bg-white border-2 border-ink font-black text-ink hover:bg-neo-red hover:text-white transition flex items-center justify-center shadow-brutal-sm btn-brutal">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
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

        <div className="pt-3 border-t-2 border-ink flex items-center justify-between">
          {event && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-white hover:bg-neo-red hover:text-white border-2 border-ink font-headline font-bold text-xs uppercase text-ink shadow-brutal-sm btn-brutal"
            >
              Hapus
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-neo-blue hover:bg-blue-700 text-white font-headline font-black text-xs uppercase border-2 border-ink shadow-brutal btn-brutal"
          >
            Simpan Jadwal
          </button>
        </div>
      </form>
    </aside>
  );
}