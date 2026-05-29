import { useState } from 'react';

const emptyEditForm = {
  title: '',
  date: '',
  time: '',
  location: '',
};

function ScheduleList({ events, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const confirmedEvents = events.filter(
    (eventItem) => eventItem.status === 'confirmed'
  );

  function startEditing(eventItem) {
    setEditingId(eventItem.id);
    setEditForm({
      title: eventItem.title,
      date: eventItem.date,
      time: eventItem.time,
      location: eventItem.location,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(emptyEditForm);
  }

  function updateEditField(fieldName, value) {
    setEditForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  }

  function saveEditing(eventItem) {
    onUpdate({
      ...eventItem,
      ...editForm,
    });
    cancelEditing();
  }

  return (
    <section className="panel wide-panel">
      <h2>Local Schedule</h2>
      {confirmedEvents.length === 0 ? (
        <p className="muted">No saved events yet.</p>
      ) : (
        <ul className="event-list">
          {confirmedEvents.map((eventItem) => (
            <li key={eventItem.id} className="event-item">
              {editingId === eventItem.id ? (
                <EditEventForm
                  editForm={editForm}
                  onChange={updateEditField}
                  onSave={() => saveEditing(eventItem)}
                  onCancel={cancelEditing}
                />
              ) : (
                <>
                  <EventSummary eventItem={eventItem} />
                  <div className="button-row">
                    <button type="button" onClick={() => startEditing(eventItem)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(eventItem.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EventSummary({ eventItem }) {
  return (
    <div>
      <strong>{eventItem.title || 'Untitled event'}</strong>
      <p>
        {eventItem.date || 'No date'} {eventItem.time || ''}
        {eventItem.location ? ` - ${eventItem.location}` : ''}
      </p>
      <p className="muted">
        {eventItem.status} - confidence {Math.round(eventItem.confidence * 100)}%
      </p>
    </div>
  );
}

function EditEventForm({ editForm, onChange, onSave, onCancel }) {
  return (
    <div className="stack">
      <label>
        Title
        <input
          value={editForm.title}
          onChange={(event) => onChange('title', event.target.value)}
        />
      </label>
      <label>
        Date
        <input
          type="date"
          value={editForm.date}
          onChange={(event) => onChange('date', event.target.value)}
        />
      </label>
      <label>
        Time
        <input
          type="time"
          value={editForm.time}
          onChange={(event) => onChange('time', event.target.value)}
        />
      </label>
      <label>
        Location
        <input
          value={editForm.location}
          onChange={(event) => onChange('location', event.target.value)}
        />
      </label>
      <div className="button-row">
        <button type="button" onClick={onSave}>
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ScheduleList;
