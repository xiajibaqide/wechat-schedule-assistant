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
      confirmedAt: new Date().toISOString(),
    };

    setEvents((currentEvents) => [confirmedEvent, ...currentEvents]);
    setDraftEvent(null);
  }

  function handleDismiss() {
    // Dismissed drafts are ignored in the local schedule for this MVP.
    setDraftEvent(null);
  }

  function handleDelete(eventId) {
    setEvents((currentEvents) =>
      currentEvents.filter((eventItem) => eventItem.id !== eventId)
    );
  }

  function handleUpdateEvent(updatedEvent) {
    setEvents((currentEvents) =>
      currentEvents.map((eventItem) => {
        if (eventItem.id !== updatedEvent.id) {
          return eventItem;
        }

        return {
          ...eventItem,
          ...updatedEvent,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">本地演示版</p>
          <h1>微信日程助手</h1>
        </div>
        <ol className="workflow-list" aria-label="助手工作流">
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
        <ScheduleList
          events={events}
          onDelete={handleDelete}
          onUpdate={handleUpdateEvent}
        />
      </section>
    </main>
  );
}

export default App;
