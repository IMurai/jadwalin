function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function ChatBubble({ message }) {
  const { role, content, timestamp, toolCalls, isError } = message;

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderContent = (text) => {
    const safe = escapeHtml(text);
    return (
      <div dangerouslySetInnerHTML={{ __html: safe
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-neo-yellow px-1 font-mono text-xs border border-ink">$1</code>')
        .replace(/\n/g, '<br/>')
      }} />
    );
  };

  if (role === 'user') {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="chat-bubble-user">
          {escapeHtml(content)}
          <div className="flex justify-end mt-1 text-[9px] font-mono text-white/70">
            {formatTime(timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 bg-neo-blue text-white border-2 border-ink shrink-0 font-mono font-bold text-[10px] flex items-center justify-center shadow-brutal-sm">
        AI
      </div>
      <div className={`chat-bubble-ai ${isError ? 'border-neo-red bg-red-50' : ''}`}>
        {renderContent(content)}
        {toolCalls && toolCalls.length > 0 && (
          <div className="mt-2 space-y-2">
            {toolCalls.map((tc, idx) => {
              if (tc.name === 'find_free_slot' && tc.result?.slots?.length > 0) {
                const flatSlots = tc.result.slots.flatMap((slot) =>
                  slot.slots ? slot.slots.map(s => ({ date: slot.date, ...s })) : [slot]
                );
                return (
                  <div key={idx} className="p-2 bg-white border-2 border-ink shadow-brutal-sm">
                    <p className="font-mono text-[10px] font-bold text-ink mb-1">Slot kosong ditemukan:</p>
                    {flatSlots.map((slot, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between p-2 bg-canvas border border-ink/50 mb-1">
                        <div>
                          <span className="font-mono font-bold text-ink bg-neo-yellow px-1 text-xs border border-ink">
                            {slot.date ? `${slot.date} ` : ''}{slot.startTime} - {slot.endTime} WIB
                          </span>
                          <p className="font-mono text-[9px] text-ink/70 font-bold mt-0.5">Bebas bentrok — balas chat dengan &quot;booking {slot.date || ''} {slot.startTime}&quot; untuk menjadwalkan</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              if (tc.name === 'analyze_density' && tc.result?.density) {
                return (
                  <div key={idx} className="p-2 bg-white border-2 border-ink shadow-brutal-sm">
                    <p className="font-mono text-[10px] font-bold text-ink mb-1">Analisis Kepadatan:</p>
                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                      {Object.entries(tc.result.density).map(([date, d]) => (
                        <div
                          key={date}
                          className="p-1.5 rounded border border-ink/50"
                          style={{ backgroundColor: d.color?.fill || 'white', color: d.color?.text || '#1a1a1a' }}
                        >
                          <div className="font-bold">{date}</div>
                          <div>{formatDensityLabel(d.level)} ({d.hours} jam)</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              if (tc.name === 'get_schedule' && tc.result?.schedule?.length > 0) {
                return (
                  <div key={idx} className="p-2 bg-white border-2 border-ink shadow-brutal-sm max-h-48 overflow-y-auto">
                    <p className="font-mono text-[10px] font-bold text-ink mb-1">Jadwal:</p>
                    {tc.result.schedule.map((e, i) => (
                      <div key={i} className="text-[10px] font-mono mb-1 border-b border-ink/20 pb-1">
                        {e.date} {e.startTime}-{e.endTime} {e.title} ({e.category})
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        <div className="flex justify-between mt-2 text-[9px] font-mono text-ink/70">
          <span>{formatTime(timestamp)}</span>
          {toolCalls && toolCalls.length > 0 && (
            <span className="bg-neo-yellow px-1 border border-ink font-bold">Tool: {toolCalls.map(t => t.name).join(', ')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDensityLabel(level) {
  const labels = {
    KOSONG: 'Kosong',
    RINGAN: 'Ringan',
    SEDANG: 'Sedang',
    PADAT: 'Padat',
  };
  return labels[level] || level;
}
