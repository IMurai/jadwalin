import { useState } from 'react';
import { format } from 'date-fns';
import { useEvents } from './hooks/useEvents';
import { useGeminiAgent } from './hooks/useGeminiAgent';
import WeekView from './components/calendar/WeekView';
import MonthMiniCalendar from './components/calendar/MonthMiniCalendar';
import ChatPanel from './components/ai-agent/ChatPanel';
import { getTodayStr, addDaysStr } from './lib/date';

function App() {
  const {
    events,
    selectedDate,
    setSelectedDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getDensityForDate,
    getDensityForRange,
    getFreeSlots,
    getEventsForRange,
    addEventFromAI,
    updateEventFromAI,
    deleteEventFromAI,
  } = useEvents();

  const [currentMonth, setCurrentMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useGeminiAgent({
    events,
    addEventFromAI,
    updateEventFromAI,
    deleteEventFromAI,
    getEventsForRange,
    getFreeSlots,
    getDensityForRange,
  });

  const handleQuickAction = (action) => {
    const today = getTodayStr();
    const nextWeekStr = addDaysStr(today, 7);

    switch (action) {
      case 'find_slot':
        sendMessage('Cari slot kosong 1 jam besok sore setelah jam 14:00');
        break;
      case 'reschedule':
        sendMessage('Bantu reschedule jadwal yang bentrok hari ini');
        break;
      case 'analyze':
        sendMessage(`Analisis kepadatan minggu ini (${today} s.d. ${nextWeekStr})`);
        break;
    }
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setCurrentMonth(dateStr.slice(0, 7));
  };

  const handleMonthChange = (date) => {
    setCurrentMonth(format(date, 'yyyy-MM'));
  };

  return (
    <div className="min-h-screen bg-surface selection-highlight">
      <main className="relative z-10 p-3 lg:p-5 max-w-[1920px] mx-auto h-screen flex flex-col gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 h-[calc(100vh-2rem)] overflow-hidden">
          {/* Left Column - Main Calendar Workspace */}
          <section className="xl:col-span-8 2xl:col-span-9 flex flex-col h-full bg-canvas border-[3px] border-ink shadow-brutal-xl rounded-none p-4 lg:p-6 relative overflow-hidden">
            <WeekView
              events={events}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onAddEvent={addEvent}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
            />
          </section>

          {/* Right Column - Mini Calendar & AI Agent */}
          <aside className="xl:col-span-4 2xl:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
            <MonthMiniCalendar
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              getDensityForDate={getDensityForDate}
            />
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSendMessage={sendMessage}
              onQuickAction={handleQuickAction}
              onClear={clearMessages}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
