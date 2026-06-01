import { useState } from 'react';
import { buildIcsCalendar, downloadIcsFile } from '../utils/icsExporter.js';
import { showNotification } from '../utils/notificationService.js';
import {
  getReminderMinutes,
  hasBeenReminded,
  hasEnded,
  isConfirmedEvent,
  normalizeEvent,
  STATUS_LABELS,
} from '../utils/workflow.js';

const reminderOptions = [
  { value: 0, label: '不提醒' },
  { value: 5, label: '5分钟' },
  { value: 10, label: '10分钟' },
  { value: 30, label: '30分钟' },
  { value: 60, label: '1小时' },
];

const emptyEditForm = {
  title: '',
  date: '',
  time: '',
  location: '',
  reminderMinutes: 10,
};

function ScheduleList({ events, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const confirmedEvents = events.filter(isConfirmedEvent);
  const exportableEvents = confirmedEvents.filter((eventItem) => eventItem.date);

  function startEditing(eventItem) {
    setEditingId(eventItem.id);
    setEditForm({
      title: eventItem.title,
      date: eventItem.date,
      time: eventItem.time,
      location: eventItem.location,
      reminderMinutes: getReminderMinutes(eventItem),
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
      reminderMinutes: Number(editForm.reminderMinutes),
    });
    cancelEditing();
  }

  function handleExportIcs() {
    const icsText = buildIcsCalendar(events);
    const fileName = `wechat-schedule-${getTodayFileDate()}.ics`;

    downloadIcsFile(icsText, fileName);
  }

  function handleTestNotification() {
    showNotification('微信日程助手', {
      body: '浏览器通知测试成功',
    });
  }

  return (
    <section className="panel wide-panel">
      <div className="button-row">
        <h2>本地日程</h2>
        <button
          type="button"
          onClick={handleExportIcs}
          disabled={exportableEvents.length === 0}
        >
          导出 .ics
        </button>
        <button type="button" onClick={handleTestNotification}>
          测试通知
        </button>
      </div>
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
  const normalizedEvent = normalizeEvent(eventItem);
  const lifecycleText = getLifecycleText(normalizedEvent);

  return (
    <div>
      <strong>{eventItem.title || '未命名日程'}</strong>
      <p>
        {eventItem.date || '未设置日期'} {eventItem.time || ''}
        {eventItem.location ? ` - ${eventItem.location}` : ''}
      </p>
      <p className="muted">
        {STATUS_LABELS[eventItem.status] || eventItem.status} - 置信度{' '}
        {Math.round(eventItem.confidence * 100)}% - 提醒：
        {formatReminderText(eventItem)}
        {lifecycleText ? ` - ${lifecycleText}` : ''}
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
      <label>
        提醒设置
        <select
          value={editForm.reminderMinutes}
          onChange={(event) =>
            onChange('reminderMinutes', Number(event.target.value))
          }
        >
          {reminderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

function getLifecycleText(eventItem) {
  const labels = [];

  if (hasBeenReminded(eventItem)) {
    labels.push('🔔 已提醒');
  }

  if (hasEnded(eventItem)) {
    labels.push('🏁 已结束');
  }

  return labels.join(' · ');
}

function formatReminderText(eventItem) {
  const minutes = getReminderMinutes(eventItem);

  if (minutes === 0) {
    return '不提醒';
  }

  if (minutes === 60) {
    return '提前1小时';
  }

  return `提前${minutes}分钟`;
}

function getTodayFileDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default ScheduleList;
