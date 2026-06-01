const DEFAULT_REMINDER_MINUTES = 10;
const DEFAULT_EVENT_DURATION_MINUTES = 60;

// Event status describes the user's decision about an extracted event.
// It should not store UI-only workflow stages such as raw or extracted.
export const EVENT_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  dismissed: 'dismissed',
};

export const STATUS_LABELS = {
  [EVENT_STATUS.pending]: '待确认',
  [EVENT_STATUS.confirmed]: '已确认',
  [EVENT_STATUS.dismissed]: '已忽略',
};

// WORKFLOW_STEPS is for the top UI flow display. These steps are broader
// than event.status because some steps are input or lifecycle stages.
export const WORKFLOW_STEPS = [
  {
    id: 'raw-message',
    label: '原始消息',
    type: 'input',
  },
  {
    id: 'extracted',
    label: '已提取',
    type: 'extraction',
  },
  {
    id: EVENT_STATUS.pending,
    label: '待确认',
    type: 'status',
  },
  {
    id: EVENT_STATUS.confirmed,
    label: '已确认',
    type: 'status',
  },
  {
    id: 'reminded',
    label: '已提醒',
    type: 'lifecycle',
  },
  {
    id: 'ended',
    label: '已结束',
    type: 'lifecycle',
  },
];

export function isConfirmedEvent(eventItem) {
  return eventItem?.status === EVENT_STATUS.confirmed;
}

export function isDismissedEvent(eventItem) {
  return eventItem?.status === EVENT_STATUS.dismissed;
}

export function hasBeenReminded(eventItem) {
  return Boolean(eventItem?.remindedAt);
}

export function hasEnded(eventItem) {
  return Boolean(eventItem?.endedAt);
}

export function getReminderMinutes(eventItem) {
  return eventItem?.reminderMinutes ?? DEFAULT_REMINDER_MINUTES;
}

export function normalizeEvent(eventItem) {
  return {
    ...eventItem,
    reminderMinutes: getReminderMinutes(eventItem),
    remindedAt: eventItem?.remindedAt ?? null,
    endedAt: eventItem?.endedAt ?? null,
  };
}

export function isEventPast(eventItem) {
  const normalizedEvent = normalizeEvent(eventItem);

  if (!normalizedEvent.date || !normalizedEvent.time) {
    return false;
  }

  const startTime = new Date(`${normalizedEvent.date}T${normalizedEvent.time}`);
  const endTime = new Date(startTime);

  endTime.setMinutes(endTime.getMinutes() + DEFAULT_EVENT_DURATION_MINUTES);

  return new Date() > endTime;
}
