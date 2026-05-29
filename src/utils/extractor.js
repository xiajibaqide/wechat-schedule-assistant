export function extractEventDraft(messageText) {
  const cleanText = normalizeMessage(messageText);
  const dateResult = parseDate(cleanText);
  const timeResult = parseTime(cleanText);
  const textWithoutDateTime = removeKnownParts(cleanText, [
    dateResult.matchedText,
    timeResult.matchedText,
  ]);
  const locationResult = parseLocation(textWithoutDateTime);
  const title = parseTitle(locationResult.remainingText);

  return {
    id: crypto.randomUUID(),
    title,
    date: dateResult.value,
    time: timeResult.value,
    location: locationResult.value,
    sourceText: messageText,
    status: 'pending',
    confidence: calculateConfidence({
      date: dateResult.value,
      time: timeResult.value,
      title,
      location: locationResult.value,
    }),
    createdAt: new Date().toISOString(),
  };
}

function normalizeMessage(messageText) {
  return messageText
    .trim()
    .replace(/^.*?[：]/, '')
    .replace(/\s+/g, '');
}

function parseDate(text) {
  const today = new Date();
  const explicitDateMatch = text.match(/(\d{1,2})月(\d{1,2})日/);

  if (explicitDateMatch) {
    const month = Number(explicitDateMatch[1]);
    const day = Number(explicitDateMatch[2]);
    const date = new Date(today.getFullYear(), month - 1, day);

    return {
      value: formatInputDate(date),
      matchedText: explicitDateMatch[0],
    };
  }

  const relativeDayMatch = text.match(/今天|今晚|明天|后天/);

  if (relativeDayMatch) {
    const daysToAdd = {
      今天: 0,
      今晚: 0,
      明天: 1,
      后天: 2,
    };
    const date = addDays(today, daysToAdd[relativeDayMatch[0]]);

    return {
      value: formatInputDate(date),
      matchedText: relativeDayMatch[0],
    };
  }

  const weekdayMatch = text.match(/周([一二三四五六日天])/);

  if (weekdayMatch) {
    const targetWeekday = {
      日: 0,
      天: 0,
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
    }[weekdayMatch[1]];
    const date = getNextWeekday(today, targetWeekday);

    return {
      value: formatInputDate(date),
      matchedText: weekdayMatch[0],
    };
  }

  return {
    value: '',
    matchedText: '',
  };
}

function parseTime(text) {
  const clockTimeMatch = text.match(/([01]?\d|2[0-3]):([0-5]\d)/);

  if (clockTimeMatch) {
    return {
      value: `${clockTimeMatch[1].padStart(2, '0')}:${clockTimeMatch[2]}`,
      matchedText: clockTimeMatch[0],
    };
  }

  const chineseTimeMatch = text.match(/(凌晨|早上|上午|中午|下午|晚上|今晚)?(\d{1,2})点/);

  if (chineseTimeMatch) {
    const period = chineseTimeMatch[1] || '';
    let hour = Number(chineseTimeMatch[2]);

    // Keep the first version predictable: only common day periods are adjusted.
    if ((period === '下午' || period === '晚上' || period === '今晚') && hour < 12) {
      hour += 12;
    }

    if (period === '中午' && hour < 11) {
      hour += 12;
    }

    return {
      value: `${String(hour).padStart(2, '0')}:00`,
      matchedText: chineseTimeMatch[0],
    };
  }

  return {
    value: '',
    matchedText: '',
  };
}

function parseLocation(text) {
  const locationMatch = text.match(/在(.+?)(开|进行|集合|上|参加|讨论|训练)/);

  if (!locationMatch) {
    return {
      value: '',
      remainingText: text,
    };
  }

  return {
    value: locationMatch[1],
    remainingText: text.replace(`在${locationMatch[1]}`, ''),
  };
}

function parseTitle(text) {
  const title = text.replace(/^在/, '').trim();

  return title || '待确认活动';
}

function removeKnownParts(text, parts) {
  const sortedParts = [...parts].sort((firstPart, secondPart) => {
    return secondPart.length - firstPart.length;
  });

  return sortedParts.reduce((nextText, part) => {
    if (!part) {
      return nextText;
    }

    return nextText.replace(part, '');
  }, text);
}

function calculateConfidence({ date, time, title, location }) {
  let confidence = 0.15;

  if (date) {
    confidence += 0.3;
  }

  if (time) {
    confidence += 0.3;
  }

  if (title && title !== '待确认活动') {
    confidence += 0.2;
  }

  if (location) {
    confidence += 0.05;
  }

  return Math.min(confidence, 1);
}

function addDays(date, daysToAdd) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + daysToAdd);

  return nextDate;
}

function getNextWeekday(date, targetWeekday) {
  const currentWeekday = date.getDay();
  let daysToAdd = targetWeekday - currentWeekday;

  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  return addDays(date, daysToAdd);
}

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
