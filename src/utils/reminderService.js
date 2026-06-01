import { showNotification } from './notificationService.js';
import { getReminderMinutes, isConfirmedEvent } from './workflow.js';

let intervalId = null;
const notifiedEventIds = new Set();

export function startReminderLoop(eventsProvider) {
  stopReminderLoop();
  checkEvents(eventsProvider);
  intervalId = setInterval(() => {
    checkEvents(eventsProvider);
  }, 60 * 1000);
}

export function stopReminderLoop() {
  if (!intervalId) {
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
}

function checkEvents(eventsProvider) {
  const events = eventsProvider();
  const now = new Date();

  events
    .filter(isConfirmedEvent)
    .filter((eventItem) => eventItem.date && eventItem.time)
    .forEach((eventItem) => {
      const reminderMinutes = getReminderMinutes(eventItem);

      if (reminderMinutes === 0 || notifiedEventIds.has(eventItem.id)) {
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
