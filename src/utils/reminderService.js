import { showNotification } from './notificationService.js';
import {
  getReminderMinutes,
  hasBeenReminded,
  isConfirmedEvent,
  normalizeEvent,
} from './workflow.js';

let intervalId = null;
const notifiedEventIds = new Set();

export function startReminderLoop(eventsProvider, onEventReminded) {
  stopReminderLoop();
  checkEvents(eventsProvider, onEventReminded);
  intervalId = setInterval(() => {
    checkEvents(eventsProvider, onEventReminded);
  }, 60 * 1000);
}

export function stopReminderLoop() {
  if (!intervalId) {
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
}

function checkEvents(eventsProvider, onEventReminded) {
  const events = eventsProvider();
  const now = new Date();

  events
    .filter(isConfirmedEvent)
    .filter((eventItem) => eventItem.date && eventItem.time)
    .forEach((eventItem) => {
      const normalizedEvent = normalizeEvent(eventItem);
      const reminderMinutes = getReminderMinutes(normalizedEvent);

      if (
        reminderMinutes === 0 ||
        notifiedEventIds.has(eventItem.id) ||
        hasBeenReminded(normalizedEvent)
      ) {
        return;
      }

      const startTime = new Date(`${eventItem.date}T${eventItem.time}`);
      const minutesUntilStart = (startTime - now) / (60 * 1000);

      if (minutesUntilStart > 0 && minutesUntilStart <= reminderMinutes) {
        const didNotify = showNotification(eventItem.title || '未命名日程', {
          body: buildNotificationBody(eventItem, reminderMinutes),
        });

        if (didNotify) {
          notifiedEventIds.add(eventItem.id);
          onEventReminded(eventItem.id);
        }
      }
    });
}

function buildNotificationBody(eventItem, reminderMinutes) {
  const body = `将在${formatReminderLead(reminderMinutes)}内开始`;

  if (!eventItem.location) {
    return body;
  }

  return `${body}\n地点：${eventItem.location}`;
}

function formatReminderLead(reminderMinutes) {
  if (reminderMinutes === 60) {
    return '1小时';
  }

  return `${reminderMinutes}分钟`;
}
