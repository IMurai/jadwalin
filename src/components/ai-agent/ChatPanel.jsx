import { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import QuickActionChips from './QuickActionChips';

export default function ChatPanel({ messages, isLoading, onSendMessage, onQuickAction }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInputValue('');
  };

  const handleQuickAction = (action) => {
    onQuickAction(action);
  };

  return (
    <div className="bg-white border-3 border-ink shadow-brutal-xl p-4 flex-1 flex flex-col justify-between overflow-hidden panel-brutal">
      {/* AI Agent Header */}
      <div className="flex items-center justify-between pb-3 border-b-3 border-ink bg-surface-dim -m-4 mb-3 p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-neo-blue border-2 border-ink shadow-brutal-sm flex items-center justify-center text-white font-mono font-black text-sm">
            AI
          </div>
          <div>
            <h4 className="font-headline font-black text-xs text-ink uppercase flex items-center gap-1.5">
              AI Schedule Agent
              <span className="bg-neo-yellow text-ink border border-ink px-1 font-mono text-[9px] font-bold">PRO</span>
            </h4>
            <p className="font-mono text-[10px] font-bold text-ink/80 flex items-center gap-1">
              <span className="w-2 h-2 bg-neo-mint border border-ink inline-block"></span>
              Siap membantu kelola waktu Anda
            </p>
          </div>
        </div>
        <button className="w-7 h-7 bg-white border-2 border-ink text-ink font-bold flex items-center justify-center hover:bg-neo-yellow shadow-brutal-sm transition btn-brutal" title="Menu Opsi">
          ⋮
        </button>
      </div>

      {/* Chat History Stream */}
      <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1 text-xs" ref={chatContainerRef}>
        {messages.length === 0 && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-neo-blue text-white border-2 border-ink shrink-0 font-mono font-bold text-[10px] flex items-center justify-center shadow-brutal-sm">
              AI
            </div>
            <div className="chat-bubble-ai">
              Halo! Saya siap membantu mengatur jadwal Anda. Coba tanyakan:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                <li>"Cari slot kosong besok sore untuk belajar 1 jam"</li>
                <li>"Tambah jadwal futsal hari Senin jam 16:00"</li>
                <li>"Analisis kepadatan minggu ini"</li>
              </ul>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-neo-blue text-white border-2 border-ink shrink-0 font-mono font-bold text-[10px] flex items-center justify-center shadow-brutal-sm">
              AI
            </div>
            <div className="chat-bubble-ai animate-pulse">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-ink/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-ink/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-ink/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Chat Controls & Input */}
      <div className="pt-2 border-t-2 border-ink space-y-2">
        <QuickActionChips onAction={handleQuickAction} disabled={isLoading} />

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full pl-3 pr-12 py-2.5 text-xs font-sans font-medium bg-canvas text-ink placeholder-ink/50 border-2 border-ink focus:outline-none focus:bg-white shadow-brutal-sm input-brutal"
            placeholder="Instruksikan AI, e.g. 'Atur meeting besok jam 10 pagi'..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-1.5 p-1.5 bg-neo-yellow hover:bg-yellow-300 text-ink border-2 border-ink shadow-brutal-sm transition hover:scale-105 active:scale-95 btn-brutal"
            title="Kirim pesan"
          >
            <svg className="w-4 h-4 transform rotate-90 stroke-[2.5]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}