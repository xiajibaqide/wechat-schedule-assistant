const ACTIVITY_KEYWORDS = [
  '班会',
  '开会',
  '会议',
  '考试',
  '作业',
  '提交',
  'DDL',
  '答疑',
  '训练',
  '讨论',
  '集合',
  '活动',
  '比赛',
  '报名',
  '讲座',
];

const WEEKDAY_MAP = {
  日: 0,
  天: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
};

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
      sourceText: cleanText,
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
  const explicitDateResult = parseExplicitDate(text, today);

  if (explicitDateResult.value) {
    return explicitDateResult;
  }

  const relativeDateResult = parseRelativeDate(text, today);

  if (relativeDateResult.value) {
    return relativeDateResult;
  }

  const weekDateResult = parseWeekDate(text, today);

  if (weekDateResult.value) {
    return weekDateResult;
  }

  return {
    value: '',
    matchedText: '',
  };
}

function parseExplicitDate(text, today) {
  const explicitDateMatch = text.match(/(\d{1,2})月(\d{1,2})日/);

  if (!explicitDateMatch) {
    return {
      value: '',
      matchedText: '',
    };
  }

  const month = Number(explicitDateMatch[1]);
  const day = Number(explicitDateMatch[2]);
  const date = new Date(today.getFullYear(), month - 1, day);

  return {
    value: formatInputDate(date),
    matchedText: explicitDateMatch[0],
  };
}

function parseRelativeDate(text, today) {
  const relativeDayMatch = text.match(/今天|今晚|明天|明晚|后天/);

  if (!relativeDayMatch) {
    return {
      value: '',
      matchedText: '',
    };
  }

  const matchedText = relativeDayMatch[0];
  const daysToAdd = matchedText.startsWith('后天')
    ? 2
    : matchedText.startsWith('明')
      ? 1
      : 0;

  return {
    value: formatInputDate(addDays(today, daysToAdd)),
    matchedText,
  };
}

function parseWeekDate(text, today) {
  // 本周 and 下周 use the Chinese Monday-Sunday week habit.
  const weekMatch = text.match(/(?:(本周|下周)([一二三四五六日天])|周([一二三四五六日天]))/);

  if (!weekMatch) {
    return {
      value: '',
      matchedText: '',
    };
  }

  const weekPrefix = weekMatch[1] || '';
  const weekdayText = weekMatch[2] || weekMatch[3];
  const targetWeekday = WEEKDAY_MAP[weekdayText];
  let date;

  if (weekPrefix === '本周') {
    date = getWeekdayInCurrentWeek(today, targetWeekday);
  } else if (weekPrefix === '下周') {
    date = getWeekdayInNextWeek(today, targetWeekday);
  } else {
    date = getNextWeekday(today, targetWeekday);
  }

  return {
    value: formatInputDate(date),
    matchedText: weekMatch[0],
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

  const chineseTimeMatch = text.match(/(凌晨|早上|上午|中午|下午|晚上|今晚|明晚)?(\d{1,2})点/);

  if (chineseTimeMatch) {
    const period = chineseTimeMatch[1] || '';
    let hour = Number(chineseTimeMatch[2]);

    // Afternoon and evening words usually mean PM for 1-11 点.
    if (['下午', '晚上', '今晚', '明晚'].includes(period) && hour < 12) {
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
  const locationMatch = text.match(/在(.+?)(开|进行|集合|上|参加|讨论|训练|考试|活动|比赛|报名|讲座)/);

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
  const cleanTitle = text.replace(/^在/, '').trim();

  if (hasActivityKeyword(cleanTitle)) {
    return cleanTitle;
  }

  return cleanTitle || '待确认活动';
}

function hasActivityKeyword(text) {
  return ACTIVITY_KEYWORDS.some((keyword) => {
    return text.toUpperCase().includes(keyword.toUpperCase());
  });
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

function calculateConfidence({ sourceText, date, time, title, location }) {
  const hasKeyword = hasActivityKeyword(sourceText);
  let confidence = 0.1;

  if (date) {
    confidence += 0.2;
  }

  if (time) {
    confidence += 0.3;
  }

  if (hasKeyword) {
    confidence += 0.25;
  }

  if (location) {
    confidence += 0.1;
  }

  if (title && title !== '待确认活动') {
    confidence += 0.05;
  }

  // Ordinary chat often contains words like 今天/明天. Without time, place, or
  // activity keywords, it should stay low-confidence and wait for user review.
  if (date && !time && !location && !hasKeyword) {
    confidence -= 0.15;
  }

  if (!time && !location && !hasKeyword) {
    confidence = Math.min(confidence, 0.35);
  }

  return clampConfidence(confidence);
}

function clampConfidence(confidence) {
  return Math.max(0, Math.min(confidence, 1));
}

function addDays(date, daysToAdd) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + daysToAdd);

  return nextDate;
}

function getWeekdayInCurrentWeek(date, targetWeekday) {
  const currentWeekday = getChineseWeekdayNumber(date.getDay());
  const targetChineseWeekday = getChineseWeekdayNumber(targetWeekday);

  return addDays(date, targetChineseWeekday - currentWeekday);
}

function getWeekdayInNextWeek(date, targetWeekday) {
  const currentWeekday = getChineseWeekdayNumber(date.getDay());
  const targetChineseWeekday = getChineseWeekdayNumber(targetWeekday);
  const daysUntilNextWeekday = 7 - currentWeekday + targetChineseWeekday;

  return addDays(date, daysUntilNextWeekday);
}

function getChineseWeekdayNumber(weekday) {
  return weekday === 0 ? 7 : weekday;
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
