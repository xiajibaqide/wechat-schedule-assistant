import { useEffect, useState } from 'react';
import MessageInput from './components/MessageInput.jsx';
import EventConfirmation from './components/EventConfirmation.jsx';
import ScheduleList from './components/ScheduleList.jsx';
import ReminderPanel from './components/ReminderPanel.jsx';
import { extractEventDraft } from './utils/extractor.js';
import { loadEvents, saveEvents } from './utils/storage.js';
import { WORKFLOW_STEPS } from './utils/workflow.js';

function App() {
  const [events, setEvents] = useState(() => loadEvents());
  const [draftEvent, setDraftEvent] = useState(null);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  function handleExtract(messageText) {
    const nextDraft = extractEventDraft(messageText);
    setDraftEvent(nextDraft);
  }

  function handleConfirm(updatedEvent) {
    const confirmedEvent = {
      ...updatedEvent,
      status: 'confirmed',
    };

    setEvents((currentEvents) => [confirmedEvent, ...currentEvents]);
    setDraftEvent(null);
  }

  function handleDismiss(eventToDismiss) {
    setEvents((currentEvents) => [
      {
        ...eventToDismiss,
        status: 'dismissed',
      },
      ...currentEvents,
    ]);
    setDraftEvent(null);
  }

  function handleDelete(eventId) {
    setEvents((currentEvents) =>
      currentEvents.filter((eventItem) => eventItem.id !== eventId)
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Local MVP</p>
          <h1>WeChat Schedule Assistant</h1>
        </div>
        <ol className="workflow-list" aria-label="Agent workflow">
          {WORKFLOW_STEPS.map((step) => (
            <li key={step.id}>{step.label}</li>
          ))}
        </ol>
      </header>

      <section className="layout-grid">
        <MessageInput onExtract={handleExtract} />
        <EventConfirmation
          draftEvent={draftEvent}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
        />
        <ReminderPanel events={events} />
        <ScheduleList events={events} onDelete={handleDelete} />
      </section>
    </main>
  );
}

export default App;
