import { useState, useMemo } from 'react';
import { format, startOfMonth, addMonths, subMonths, parseISO } from 'date-fns';
import { useEvents } from './hooks/useEvents';
import { useGeminiAgent } from './hooks/useGeminiAgent';
import WeekView from './components/calendar/WeekView';
import MonthMiniCalendar from './components/calendar/MonthMiniCalendar';
import ChatPanel from './components/ai-agent/ChatPanel';

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
    sendMessage,
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
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

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
    const weekStart = startOfMonth(parseISO(dateStr));
  };

  const handleMonthChange = (date) => {
    setCurrentMonth(format(date, 'yyyy-MM'));
  };

  return (
    <div className="min-h-screen bg-surface grid-bg selection-highlight">
      <main className="relative z-10 w-full p-3 lg:p-5 max-w-[1920px] mx-auto min-h-screen flex flex-col gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-[calc(100vh-4rem)] overflow-hidden w-full">
          {/* Left Column - Main Calendar */}
          <WeekView
            events={events}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAddEvent={addEvent}
            onUpdateEvent={updateEvent}
            onDeleteEvent={deleteEvent}
            getDensityForDate={getDensityForDate}
          />

          {/* Right Column - Mini Calendar & AI Agent */}
          <aside className="xl:col-span-4 2xl:col-span-3 flex flex-col gap-4 min-h-0 overflow-hidden w-full">
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
              onSendMessage={sendMessage}
              onQuickAction={handleQuickAction}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;