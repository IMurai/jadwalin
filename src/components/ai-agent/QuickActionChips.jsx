const QUICK_ACTIONS = [
  { label: 'Cari slot kosong', icon: '📅', action: 'find_slot' },
  { label: 'Reschedule jadwal', icon: '⚡', action: 'reschedule' },
  { label: 'Analisis kepadatan', icon: '📊', action: 'analyze' },
];

export default function QuickActionChips({ onAction, disabled }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-headline font-bold">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.action}
          onClick={() => onAction(action.action)}
          disabled={disabled}
          className="px-2 py-1 bg-white hover:bg-neo-yellow border-2 border-ink shadow-brutal-sm text-ink shrink-0 transition flex items-center gap-1 btn-brutal disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{action.icon}</span> {action.label}
        </button>
      ))}
    </div>
  );
}