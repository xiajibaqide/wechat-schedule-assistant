import { getUpcomingEvents } from '../utils/dateHelpers.js';

function ReminderPanel({ events }) {
  const upcomingEvents = getUpcomingEvents(events);

  return (
    <section className="panel">
      <h2>即将开始</h2>
      {upcomingEvents.length === 0 ? (
        <p className="muted">暂无即将开始的已确认日程。</p>
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
