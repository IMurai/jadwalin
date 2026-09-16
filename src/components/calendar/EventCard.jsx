import { format } from 'date-fns';

export default function EventCard({ event, onClick }) {
  const categoryLabels = {
    sekolah: 'Sekolah',
    futsal: 'Futsal',
    belajar: 'Belajar',
    main: 'Main',
    lainnya: 'Lainnya',
  };

  const categoryColors = {
    sekolah: 'bg-neo-blue text-white',
    futsal: 'bg-neo-mint text-ink',
    belajar: 'bg-neo-purple text-ink',
    main: 'bg-neo-peach text-ink',
    lainnya: 'bg-white text-ink',
  };

  return (
    <div
      className={`event-card h-full ${categoryColors[event.category] || categoryColors.lainnya} border-2 border-ink shadow-brutal-sm p-2 cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal`}
      style={{ backgroundColor: event.color, borderColor: '#1a1a1a' }}
      onClick={onClick}
    >
      <span className="font-mono text-[9px] font-bold uppercase bg-ink text-white px-1">
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
      <span className="text-[9px] font-mono font-bold uppercase text-ink/70 mt-1 inline-block">
        {categoryLabels[event.category] || event.category}
      </span>
      {event.createdBy === 'ai' && (
        <span className="text-[8px] font-mono font-bold bg-neo-yellow text-ink px-1 border border-ink mt-1 inline-block">
          AI
        </span>
      )}
    </div>
  );
}