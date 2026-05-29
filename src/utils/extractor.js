import { getTodayInputDate } from './dateHelpers.js';

export function extractEventDraft(messageText) {
  return {
    id: crypto.randomUUID(),
    title: 'Activity from WeChat message',
    date: getTodayInputDate(),
    time: '19:00',
    location: '',
    sourceText: messageText,
    status: 'pending',
    confidence: 0.35,
    createdAt: new Date().toISOString(),
  };
}
