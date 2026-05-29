import { useEffect, useState } from 'react';

const emptyForm = {
  title: '',
  date: '',
  time: '',
  location: '',
};

function EventConfirmation({ draftEvent, onConfirm, onDismiss }) {
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!draftEvent) {
      setFormData(emptyForm);
      return;
    }

    setFormData({
      title: draftEvent.title,
      date: draftEvent.date,
      time: draftEvent.time,
      location: draftEvent.location,
    });
  }, [draftEvent]);

  function updateField(fieldName, value) {
    setFormData((currentData) => ({
      ...currentData,
      [fieldName]: value,
    }));
  }

  if (!draftEvent) {
    return (
      <section className="panel">
        <h2>Confirm Event</h2>
        <p className="muted">Paste a message and extract a draft event first.</p>
      </section>
    );
  }

  const updatedEvent = {
    ...draftEvent,
    ...formData,
  };

  return (
    <section className="panel">
      <h2>Confirm Event</h2>
      <div className="status-line">
        <span>Status: {draftEvent.status}</span>
        <span>Confidence: {Math.round(draftEvent.confidence * 100)}%</span>
      </div>

      <div className="stack">
        <label>
          Title
          <input
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={formData.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
        </label>
        <label>
          Time
          <input
            type="time"
            value={formData.time}
            onChange={(event) => updateField('time', event.target.value)}
          />
        </label>
        <label>
          Location
          <input
            value={formData.location}
            onChange={(event) => updateField('location', event.target.value)}
          />
        </label>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => onConfirm(updatedEvent)}>
          Confirm
        </button>
        <button type="button" onClick={() => onDismiss(updatedEvent)}>
          Dismiss
        </button>
      </div>
    </section>
  );
}

export default EventConfirmation;
