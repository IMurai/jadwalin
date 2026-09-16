const CATEGORY_COLORS = {
  sekolah: { bg: 'bg-neo-blue', text: 'text-white', timeBg: 'bg-white', timeText: 'text-ink' },
  futsal: { bg: 'bg-neo-mint', text: 'text-ink', timeBg: 'bg-ink', timeText: 'text-white' },
  belajar: { bg: 'bg-neo-purple', text: 'text-ink', timeBg: 'bg-ink', timeText: 'text-white' },
  main: { bg: 'bg-neo-peach', text: 'text-ink', timeBg: 'bg-ink', timeText: 'text-white' },
  lainnya: { bg: 'bg-white', text: 'text-ink', timeBg: 'bg-ink', timeText: 'text-white' },
};

const CATEGORY_LABELS = {
  sekolah: 'Sekolah',
  futsal: 'Futsal',
  belajar: 'Belajar',
  main: 'Main',
  lainnya: 'Lainnya',
};

export default function EventCard({ event, onClick }) {
  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.lainnya;

  return (
    <div
      className={`h-full border-2 border-ink shadow-brutal-sm p-2 cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${colors.bg} ${colors.text}`}
      onClick={onClick}
    >
      <span className={`font-mono text-[9px] font-bold uppercase px-1 ${colors.timeBg} ${colors.timeText}`}>
        {event.startTime}-{event.endTime}
      </span>
      <h4 className="font-headline text-xs font-extrabold text-ink leading-tight mt-1 truncate">
        {event.title}
      </h4>
      {event.location && (
        <p className="text-[10px] font-bold text-ink/80 mt-0.5 truncate">
          📍 {event.location}
        </p>
      )}
      <div className="flex items-center justify-between mt-1 text-[9px] font-mono font-bold">
        <span>{CATEGORY_LABELS[event.category] || event.category}</span>
        {event.createdBy === 'ai' && (
          <span className="bg-neo-yellow text-ink px-1 border border-ink">AI</span>
        )}
      </div>
    </div>
  );
}
