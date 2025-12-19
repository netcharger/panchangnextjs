// Time intervals and greetings configuration
const timeIntervals = {
  "dawn": {
    "label_te": "ప్రభాత వేళ",
    "label_en": "Dawn Time",
    "range": "04:00-06:00"
  },
  "morning": {
    "label_te": "ఉదయం సమయం",
    "label_en": "Morning Time",
    "range": "06:00-12:00"
  },
  "noon": {
    "label_te": "మధ్యాహ్న వేళ",
    "label_en": "Noon Time",
    "range": "12:00-16:00"
  },
  "evening": {
    "label_te": "సాయంత్ర వేళ",
    "label_en": "Evening Time",
    "range": "16:00-19:00"
  },
  "night": {
    "label_te": "రాత్రి సమయం",
    "label_en": "Night Time",
    "range": "19:00-24:00"
  },
  "midnight": {
    "label_te": "అర్ధరాత్రి వేళ",
    "label_en": "Midnight Time",
    "range": "00:00-04:00"
  }
};

const greetings = {
  "good_morning": {
    "text_te": "శుభోదయం",
    "text_en": "Good Morning",
    "active_range": "06:00-12:00"
  },
  "good_afternoon": {
    "text_te": "శుభ మధ్యాహ్నం",
    "text_en": "Good Afternoon",
    "active_range": "12:00-16:00"
  },
  "good_evening": {
    "text_te": "శుభ సాయంత్రం",
    "text_en": "Good Evening",
    "active_range": "16:00-19:00"
  },
  "good_night": {
    "text_te": "శుభ రాత్రి",
    "text_en": "Good Night",
    "active_range": "19:00-24:00"
  }
};

// Parse time range string "HH:MM-HH:MM" and check if current time is within range
const isTimeInRange = (timeStr, rangeStr) => {
  const [startStr, endStr] = rangeStr.split('-');
  const [startHour, startMin] = startStr.split(':').map(Number);
  let [endHour, endMin] = endStr.split(':').map(Number);
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTime = currentHour * 60 + currentMin;
  
  const startTime = startHour * 60 + startMin;
  // Handle 24:00 as midnight (00:00 next day)
  if (endHour === 24) {
    endHour = 0;
  }
  let endTime = endHour * 60 + endMin;
  
  // Handle midnight crossover (e.g., 19:00-24:00 becomes 19:00-00:00 or 00:00-04:00)
  if (endTime <= startTime) {
    // Range crosses midnight (endTime is next day)
    if (currentTime >= startTime || currentTime < endTime) {
      return true;
    }
  } else {
    // Normal range within same day
    if (currentTime >= startTime && currentTime < endTime) {
      return true;
    }
  }
  
  return false;
};

// Get current greeting based on time
export const getCurrentGreeting = (language = 'en') => {
  for (const [key, greeting] of Object.entries(greetings)) {
    if (isTimeInRange(new Date(), greeting.active_range)) {
      return {
        text: greeting[`text_${language}`] || greeting.text_en,
        key: key
      };
    }
  }
  // Default to morning greeting
  return {
    text: greetings.good_morning[`text_${language}`] || greetings.good_morning.text_en,
    key: 'good_morning'
  };
};

// Get current time interval based on time
export const getCurrentTimeInterval = (language = 'en') => {
  for (const [key, interval] of Object.entries(timeIntervals)) {
    if (isTimeInRange(new Date(), interval.range)) {
      return {
        label: interval[`label_${language}`] || interval.label_en,
        key: key,
        range: interval.range
      };
    }
  }
  // Default to morning
  return {
    label: timeIntervals.morning[`label_${language}`] || timeIntervals.morning.label_en,
    key: 'morning',
    range: timeIntervals.morning.range
  };
};

// Get all time intervals
export const getAllTimeIntervals = () => timeIntervals;

// Get all greetings
export const getAllGreetings = () => greetings;

