import { isConfirmedEvent } from './workflow.js';

export function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getUpcomingEvents(events) {
  const now = new Date();

  return events
    .filter(isConfirmedEvent)
    .filter((eventItem) => eventItem.date && eventItem.time)
    .filter((eventItem) => new Date(`${eventItem.date}T${eventItem.time}`) >= now)
    .sort((firstEvent, secondEvent) => {
      const firstDate = new Date(`${firstEvent.date}T${firstEvent.time}`);
      const secondDate = new Date(`${secondEvent.date}T${secondEvent.time}`);

      return firstDate - secondDate;
    })
    .slice(0, 3);
}
