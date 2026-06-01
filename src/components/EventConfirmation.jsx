import { useEffect, useState } from 'react';

const DEFAULT_REMINDER_MINUTES = 10;

const reminderOptions = [
  { value: 0, label: '不提醒' },
  { value: 5, label: '5分钟' },
  { value: 10, label: '10分钟' },
  { value: 30, label: '30分钟' },
  { value: 60, label: '1小时' },
];

const emptyForm = {
  title: '',
  date: '',
  time: '',
  location: '',
  reminderMinutes: DEFAULT_REMINDER_MINUTES,
};

const statusText = {
  pending: '待确认',
  confirmed: '已确认',
  dismissed: '已忽略',
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
      reminderMinutes: draftEvent.reminderMinutes ?? DEFAULT_REMINDER_MINUTES,
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
        <h2>确认日程</h2>
        <p className="muted">请先粘贴消息并提取日程草稿。</p>
      </section>
    );
  }

  const updatedEvent = {
    ...draftEvent,
    ...formData,
    reminderMinutes: Number(formData.reminderMinutes),
  };

  return (
    <section className="panel">
      <h2>确认日程</h2>
      <div className="status-line">
        <span>状态：{statusText[draftEvent.status] || draftEvent.status}</span>
        <span>置信度：{Math.round(draftEvent.confidence * 100)}%</span>
      </div>

      <div className="stack">
        <label>
          活动标题
          <input
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="例如：数据库课程答疑"
          />
        </label>
        <label>
          日期
          <input
            type="date"
            value={formData.date}
            onChange={(event) => updateField('date', event.target.value)}
            placeholder="选择日期"
          />
        </label>
        <label>
          时间
          <input
            type="time"
            value={formData.time}
            onChange={(event) => updateField('time', event.target.value)}
            placeholder="选择时间"
          />
        </label>
        <label>
          地点
          <input
            value={formData.location}
            onChange={(event) => updateField('location', event.target.value)}
            placeholder="例如：A203"
          />
        </label>
        <label>
          提醒设置
          <select
            value={formData.reminderMinutes}
            onChange={(event) =>
              updateField('reminderMinutes', Number(event.target.value))
            }
          >
            {reminderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => onConfirm(updatedEvent)}>
          确认保存
        </button>
        <button type="button" onClick={() => onDismiss(updatedEvent)}>
          忽略
        </button>
      </div>
    </section>
  );
}

export default EventConfirmation;
