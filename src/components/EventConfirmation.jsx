import { useEffect, useState } from 'react';

const emptyForm = {
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
        <h2>确认日程</h2>
        <p className="muted">请先粘贴消息并提取日程草稿。</p>
      </section>
    );
  }

  const updatedEvent = {
    ...draftEvent,
    ...formData,
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
