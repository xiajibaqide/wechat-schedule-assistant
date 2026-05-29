import { useState } from 'react';

const emptyEditForm = {
  title: '',
  date: '',
  time: '',
  location: '',
};

const statusText = {
  pending: '待确认',
  confirmed: '已确认',
  dismissed: '已忽略',
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
      <h2>本地日程</h2>
      {confirmedEvents.length === 0 ? (
        <p className="muted">还没有保存的日程。</p>
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
                      编辑
                    </button>
                    <button type="button" onClick={() => onDelete(eventItem.id)}>
                      删除
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
      <strong>{eventItem.title || '未命名日程'}</strong>
      <p>
        {eventItem.date || '未设置日期'} {eventItem.time || ''}
        {eventItem.location ? ` - ${eventItem.location}` : ''}
      </p>
      <p className="muted">
        {statusText[eventItem.status] || eventItem.status} - 置信度{' '}
        {Math.round(eventItem.confidence * 100)}%
      </p>
    </div>
  );
}

function EditEventForm({ editForm, onChange, onSave, onCancel }) {
  return (
    <div className="stack">
      <label>
        活动标题
        <input
          value={editForm.title}
          onChange={(event) => onChange('title', event.target.value)}
          placeholder="例如：班会"
        />
      </label>
      <label>
        日期
        <input
          type="date"
          value={editForm.date}
          onChange={(event) => onChange('date', event.target.value)}
          placeholder="选择日期"
        />
      </label>
      <label>
        时间
        <input
          type="time"
          value={editForm.time}
          onChange={(event) => onChange('time', event.target.value)}
          placeholder="选择时间"
        />
      </label>
      <label>
        地点
        <input
          value={editForm.location}
          onChange={(event) => onChange('location', event.target.value)}
          placeholder="例如：图书馆门口"
        />
      </label>
      <div className="button-row">
        <button type="button" onClick={onSave}>
          保存
        </button>
        <button type="button" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

export default ScheduleList;
