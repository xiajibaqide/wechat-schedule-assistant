const STORAGE_KEY = 'wechat-schedule-assistant-events';

export function loadEvents() {
  const savedValue = localStorage.getItem(STORAGE_KEY);

  if (!savedValue) {
    return [];
  }

  try {
    return JSON.parse(savedValue);
  } catch {
    return [];
  }
}

export function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
