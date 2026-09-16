import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { getDensityColorClass, formatDensityLabel } from '../../lib/density';

const DAYS_SHORT = ['Mn', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'];

export default function MonthMiniCalendar({
  currentMonth,
  onMonthChange,
  onDateSelect,
  selectedDate,
  getDensityForDate,
}) {
  const monthStart = startOfMonth(parseISO(currentMonth + '-01'));
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const today = new Date().toISOString().split('T')[0];

  const monthLabel = format(monthStart, 'MMMM yyyy', { locale: id });

  const handlePrevMonth = () => onMonthChange(subMonths(monthStart, 1));
  const handleNextMonth = () => onMonthChange(addMonths(monthStart, 1));

  return (
    <div className="bg-white border-3 border-ink shadow-brutal-xl p-4 flex flex-col panel-brutal">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b-2 border-ink">
        <div>
          <h3 className="font-headline font-black text-base text-ink uppercase tracking-tight">{monthLabel}</h3>
          <p className="font-mono text-[10px] font-bold text-ink/70 uppercase">Analisis Kepadatan Jadwal Harian</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevMonth} className="p-1 bg-canvas border-2 border-ink text-ink hover:bg-neo-yellow shadow-brutal-sm transition btn-brutal" title="Bulan Sebelumnya">
            <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={handleNextMonth} className="p-1 bg-canvas border-2 border-ink text-ink hover:bg-neo-yellow shadow-brutal-sm transition btn-brutal" title="Bulan Berikutnya">
            <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-ink bg-surface-dim p-1 border-2 border-ink mb-2">
        {DAYS_SHORT.map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-mono font-bold">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayNum = format(day, 'd');
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const density = getDensityForDate(dateStr);

          if (!isCurrentMonth) {
            return (
              <span key={idx} className="p-1 text-ink/30 flex items-center justify-center">
                {dayNum}
              </span>
            );
          }

          const densityClass = getDensityColorClass(density.level);
          const hasEvents = density.eventCount > 0;

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(dateStr)}
              className={`mini-cal-day ${densityClass} ${!hasEvents ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'ring-2 ring-neo-blue' : ''}`}
              title={`${density.eventCount} Kegiatan (${formatDensityLabel(density.level)})`}
              style={density.level === 'PADAT' ? { color: 'white' } : undefined}
            >
              {dayNum}
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-neo-yellow border border-ink absolute -bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t-2 border-ink flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] text-ink font-bold">
        <span>Kepadatan:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-ink bg-white inline-block"></span> Kosong</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-ink bg-neo-mint inline-block"></span> Ringan</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-ink bg-neo-yellow inline-block"></span> Sedang</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-ink bg-neo-red inline-block"></span> Padat</span>
      </div>
    </div>
  );
}