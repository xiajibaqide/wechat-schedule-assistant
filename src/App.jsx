import { useEffect, useRef, useState } from 'react';
import MessageInput from './components/MessageInput.jsx';
import EventConfirmation from './components/EventConfirmation.jsx';
import ScheduleList from './components/ScheduleList.jsx';
import ReminderPanel from './components/ReminderPanel.jsx';
import { extractEventDraftHybrid } from './utils/hybridExtractor.js';
import { requestNotificationPermission } from './utils/notificationService.js';
import { startReminderLoop, stopReminderLoop } from './utils/reminderService.js';
import { loadEvents, saveEvents } from './utils/storage.js';
import { WORKFLOW_STEPS } from './utils/workflow.js';

function App() {
  const [events, setEvents] = useState(() => loadEvents());
  const [draftEvent, setDraftEvent] = useState(null);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    requestNotificationPermission().catch(() => {
      // Notification permission is optional. Rejection should not break the app.
    });
    startReminderLoop(
      () => eventsRef.current,
      handleEventReminded,
      handleEventEnded
    );

    return () => {
      stopReminderLoop();
    };
  }, []);

  function handleExtract(messageText) {
    const nextDraft = extractEventDraftHybrid(messageText);
    setDraftEvent(nextDraft);
  }

  function handleConfirm(updatedEvent) {
    const confirmedEvent = {
      ...updatedEvent,
      status: 'confirmed',
      reminderMinutes: updatedEvent.reminderMinutes ?? 10,
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

  function handleEventReminded(eventId) {
    setEvents((currentEvents) =>
      currentEvents.map((eventItem) => {
        if (eventItem.id !== eventId || eventItem.remindedAt) {
          return eventItem;
        }

        return {
          ...eventItem,
          remindedAt: new Date().toISOString(),
        };
      })
    );
  }

  function handleEventEnded(eventId) {
    setEvents((currentEvents) =>
      currentEvents.map((eventItem) => {
        if (eventItem.id !== eventId || eventItem.endedAt) {
          return eventItem;
        }

        return {
          ...eventItem,
          endedAt: new Date().toISOString(),
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
