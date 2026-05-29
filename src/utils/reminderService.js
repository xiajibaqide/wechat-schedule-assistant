import { showNotification } from './notificationService.js';

// 正式使用：10分钟。开发测试时可临时改成 1 分钟。
export const REMINDER_LEAD_MINUTES = 10;

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
    .filter((eventItem) => eventItem.status === 'confirmed')
    .filter((eventItem) => eventItem.date && eventItem.time)
    .forEach((eventItem) => {
      if (notifiedEventIds.has(eventItem.id)) {
        return;
      }

      const startTime = new Date(`${eventItem.date}T${eventItem.time}`);
      const minutesUntilStart = (startTime - now) / (60 * 1000);

      if (
        minutesUntilStart > 0 &&
        minutesUntilStart <= REMINDER_LEAD_MINUTES
      ) {
        const didNotify = showNotification(eventItem.title || '未命名日程', {
          body: buildNotificationBody(eventItem),
        });

        if (didNotify) {
          notifiedEventIds.add(eventItem.id);
        }
      }
    });
}

function buildNotificationBody(eventItem) {
  const body = `将在${REMINDER_LEAD_MINUTES}分钟内开始`;

  if (!eventItem.location) {
    return body;
  }

  return `${body}\n地点：${eventItem.location}`;
}
