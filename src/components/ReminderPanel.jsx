import { getUpcomingEvents } from '../utils/dateHelpers.js';

function ReminderPanel({ events }) {
  const upcomingEvents = getUpcomingEvents(events);

  return (
    <section className="panel">
      <h2>Upcoming</h2>
      {upcomingEvents.length === 0 ? (
        <p className="muted">No upcoming confirmed events.</p>
      ) : (
        <ul className="compact-list">
          {upcomingEvents.map((eventItem) => (
            <li key={eventItem.id}>
              <strong>{eventItem.title}</strong>
              <span>
                {eventItem.date} {eventItem.time}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ReminderPanel;
