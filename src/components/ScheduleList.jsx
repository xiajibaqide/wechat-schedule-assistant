function ScheduleList({ events, onDelete }) {
  return (
    <section className="panel wide-panel">
      <h2>Local Schedule</h2>
      {events.length === 0 ? (
        <p className="muted">No saved events yet.</p>
      ) : (
        <ul className="event-list">
          {events.map((eventItem) => (
            <li key={eventItem.id} className="event-item">
              <div>
                <strong>{eventItem.title || 'Untitled event'}</strong>
                <p>
                  {eventItem.date || 'No date'} {eventItem.time || ''}
                  {eventItem.location ? ` · ${eventItem.location}` : ''}
                </p>
                <p className="muted">
                  {eventItem.status} · confidence{' '}
                  {Math.round(eventItem.confidence * 100)}%
                </p>
              </div>
              <button type="button" onClick={() => onDelete(eventItem.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ScheduleList;
