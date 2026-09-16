import { useState, useMemo } from 'react';
import EventCard from './EventCard';
import EventModal from './EventModal';
import MonthMiniCalendar from './MonthMiniCalendar';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = 6 + i;
  return `${String(hour).padStart(2, '0')}:00`;
});

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAYS_SHORT = ['Mn', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'];

export default function WeekView({
  events,
  selectedDate,
  setSelectedDate,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  getDensityForDate,
}) {
  const [viewWeekStart, setViewWeekStart] = useState(() => startOfWeek(parseISO(selectedDate), { weekStartsOn: 0 }));
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEventDate, setNewEventDate] = useState(null);
  const [newEventTime, setNewEventTime] = useState(null);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = addWeeks(viewWeekStart, 0);
      day.setDate(day.getDate() + i);
      return day;
    });
  }, [viewWeekStart]);

  const weekLabel = `${format(viewWeekStart, 'd MMM', { locale: id })} - ${format(endOfWeek(viewWeekStart, { weekStartsOn: 0 }), 'd MMM yyyy', { locale: id })}`;

  const prevWeek = () => setViewWeekStart(subWeeks(viewWeekStart, 1));
  const nextWeek = () => setViewWeekStart(addWeeks(viewWeekStart, 1));
  const goToToday = () => {
    const today = new Date();
    setViewWeekStart(startOfWeek(today, { weekStartsOn: 0 }));
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const getEventsForDayAndTime = (day, timeSlot) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr && e.startTime <= timeSlot && e.endTime > timeSlot);
  };

  const handleSlotClick = (day, timeSlot) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setNewEventDate(dateStr);
    setNewEventTime(timeSlot);
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEvent(null);
    setNewEventDate(null);
    setNewEventTime(null);
  };

  const handleModalSave = (eventData) => {
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, eventData);
    } else {
      onAddEvent(eventData);
    }
    handleModalClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="flex flex-col h-full bg-canvas border-3 border-ink shadow-brutal-xl p-4 lg:p-6 relative overflow-hidden panel-brutal">
      {/* Header Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-3 border-ink mb-4">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-neo-yellow border-2 border-ink shadow-brutal-sm text-ink">
              <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-headline font-extrabold tracking-tight text-ink uppercase">
                  {format(viewWeekStart, 'MMMM yyyy', { locale: id })}
                </h1>
                <span className="text-xs px-2 py-0.5 bg-neo-blue text-white font-mono font-bold border-2 border-ink shadow-brutal-sm">
                  W{format(viewWeekStart, 'w', { locale: id })}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-ink/70 uppercase">
                {weekLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center bg-white border-2 border-ink shadow-brutal-sm p-0.5">
            <button onClick={prevWeek} className="p-1.5 text-ink hover:bg-neo-yellow transition-all border-r-2 border-ink" title="Minggu Sebelumnya">
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={goToToday} className="px-3.5 py-1.5 text-xs font-headline font-bold uppercase text-ink hover:bg-neo-yellow transition-all">
              Hari Ini
            </button>
            <button onClick={nextWeek} className="p-1.5 text-ink hover:bg-neo-yellow transition-all border-l-2 border-ink" title="Minggu Berikutnya">
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-ink shadow-brutal-sm text-xs font-headline font-bold">
            <span className="inline-block w-3 h-3 bg-neo-blue border border-ink"></span> Sekolah
            <span className="mx-1 text-ink/30">|</span>
            <span className="inline-block w-3 h-3 bg-neo-mint border border-ink"></span> Futsal
            <span className="mx-1 text-ink/30">|</span>
            <span className="inline-block w-3 h-3 bg-neo-purple border border-ink"></span> Belajar
            <span className="mx-1 text-ink/30">|</span>
            <span className="inline-block w-3 h-3 bg-neo-peach border border-ink"></span> Main
          </div>
          <div className="bg-white border-2 border-ink shadow-brutal-sm flex items-center text-xs font-headline font-bold">
            <button className="px-3 py-1.5 text-ink hover:bg-surface-dim transition-colors">Bulan</button>
            <button className="px-4 py-1.5 bg-ink text-white border-x-2 border-ink">Minggu</button>
            <button className="px-3 py-1.5 text-ink hover:bg-surface-dim transition-colors">Hari</button>
          </div>
          <button onClick={() => { setNewEventDate(format(viewWeekStart, 'yyyy-MM-dd')); setNewEventTime('06:00'); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-neo-yellow text-ink border-2 border-ink shadow-brutal font-headline font-extrabold text-xs uppercase tracking-wide transition-all btn-brutal">
            <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </header>

      {/* Weekly Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden mt-3">
        {/* Days of Week Header */}
        <div className="grid grid-cols-8 text-center pb-2.5 border-b-2 border-ink items-stretch gap-1 bg-surface-dim p-1 border-2 border-ink">
          <div className="flex items-center justify-center font-mono font-bold text-xs uppercase text-ink bg-white border border-ink">
            WIB
          </div>
          {weekDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const density = getDensityForDate(dateStr);
            return (
              <div key={idx} className={`flex flex-col items-center justify-center p-1.5 border border-ink ${
                isToday ? 'bg-neo-yellow border-2 shadow-brutal-sm' : 'bg-white'
              } ${isSelected ? 'ring-2 ring-neo-blue' : ''}`}>
                <span className="text-[11px] font-headline font-bold uppercase text-ink/70">{DAYS[idx]}</span>
                <span className="text-base font-headline font-black text-ink">{format(day, 'd')}</span>
                {isToday && <span className="text-[9px] font-mono font-bold bg-ink text-neo-yellow px-1 mt-0.5">HARI INI</span>}
              </div>
            );
          })}
        </div>

        {/* Time Grid with Scrollable Schedule */}
        <div className="flex-1 overflow-y-auto pr-1 relative divide-y-2 divide-ink/20 border-x-2 border-b-2 border-ink bg-white">
          {TIME_SLOTS.map((timeSlot, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-8 min-h-[86px] border-b-2 border-ink/10 relative hover:bg-canvas transition-colors">
              <div className="text-right pr-3 font-mono text-xs font-bold text-ink border-r-2 border-ink pt-2 bg-surface-dim">
                {timeSlot}
              </div>
              {weekDays.map((day, colIdx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = dateStr === today;
                const dayEvents = getEventsForDayAndTime(day, timeSlot);
                const isSelected = dateStr === selectedDate;

                return (
                  <div
                    key={colIdx}
                    className={`p-1 border-r border-ink/10 ${isToday ? 'bg-neo-yellow/10' : ''} ${isSelected ? 'ring-1 ring-neo-blue ring-inset' : ''}`}
                    onClick={() => handleSlotClick(day, timeSlot)}
                  >
                    {dayEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                      />
                    ))}
                    {dayEvents.length === 0 && (
                      <button className="w-full h-full border-2 border-dashed border-ink/40 bg-transparent hover:bg-neo-yellow/30 hover:border-ink flex items-center justify-center font-headline font-bold text-xs text-ink/70 transition">
                        + Jadwal
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={editingEvent}
          initialDate={newEventDate}
          initialTime={newEventTime}
          onSave={handleModalSave}
          onClose={handleModalClose}
        />
      )}
    </section>
  );
}