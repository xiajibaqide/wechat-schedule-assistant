import { isConfirmedEvent } from './workflow.js';

const DEFAULT_EVENT_DURATION_MINUTES = 60;

export function buildIcsCalendar(events) {
  const exportableEvents = events.filter((eventItem) => {
    return isConfirmedEvent(eventItem) && eventItem.date;
  });
  const icsEvents = exportableEvents.map(buildIcsEvent).filter(Boolean);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WeChat Schedule Assistant//Local MVP//CN',
    'CALSCALE:GREGORIAN',
    ...icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildIcsEvent(eventItem) {
  if (!isConfirmedEvent(eventItem) || !eventItem.date) {
    return '';
  }

  const lines = [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(eventItem.id)}`,
    `DTSTAMP:${formatIcsTimestamp(new Date())}`,
    `SUMMARY:${escapeIcsText(eventItem.title || '未命名日程')}`,
    'STATUS:CONFIRMED',
  ];

  if (eventItem.time) {
    lines.push(`DTSTART:${formatIcsDateTime(eventItem.date, eventItem.time)}`);
    lines.push(`DTEND:${formatIcsDateTime(eventItem.date, eventItem.time, DEFAULT_EVENT_DURATION_MINUTES)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(eventItem.date)}`);
    lines.push(`DTEND;VALUE=DATE:${formatIcsDate(addDaysToDateString(eventItem.date, 1))}`);
  }

  if (eventItem.location) {
    lines.push(`LOCATION:${escapeIcsText(eventItem.location)}`);
  }

  lines.push(`DESCRIPTION:${escapeIcsText(buildDescription(eventItem))}`);
  lines.push('END:VEVENT');

  return lines.join('\r\n');
}

export function downloadIcsFile(icsText, fileName) {
  const blob = new Blob([icsText], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function buildDescription(eventItem) {
  return [
    `原始消息：${eventItem.sourceText || ''}`,
    `置信度：${Math.round((eventItem.confidence || 0) * 100)}%`,
    `提取方式：${eventItem.extractionMethod || 'rules'}`,
  ].join('\n');
}

function formatIcsTimestamp(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function formatIcsDateTime(date, time, minutesToAdd = 0) {
  const dateTime = new Date(`${date}T${time}`);
  dateTime.setMinutes(dateTime.getMinutes() + minutesToAdd);

  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, '0');
  const day = String(dateTime.getDate()).padStart(2, '0');
  const hour = String(dateTime.getHours()).padStart(2, '0');
  const minute = String(dateTime.getMinutes()).padStart(2, '0');

  return `${year}${month}${day}T${hour}${minute}00`;
}

function formatIcsDate(date) {
  return date.replace(/-/g, '');
}

function addDaysToDateString(date, daysToAdd) {
  const nextDate = new Date(`${date}T00:00`);
  nextDate.setDate(nextDate.getDate() + daysToAdd);

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
