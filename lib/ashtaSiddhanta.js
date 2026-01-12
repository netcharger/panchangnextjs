const ashtaData = require('../data/ashtaSiddhanta.json');

exports.getAshtaStatus = (date) => {
  const now = date || new Date();
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayIndex = now.getDay();
  
  // Hours and minutes since midnight
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const totalMinutesSinceMidnight = currentHour * 60 + currentMinute;
  
  let relativeMinutes;
  let isNight = false;
  
  // Day: 6 AM to 6 PM (360 to 1080 minutes)
  // Night: 6 PM to 6 AM (1080 to 360 minutes next day)
  if (totalMinutesSinceMidnight >= 360 && totalMinutesSinceMidnight < 1080) {
    relativeMinutes = totalMinutesSinceMidnight - 360;
    isNight = false;
  } else {
    isNight = true;
    if (totalMinutesSinceMidnight >= 1080) {
      relativeMinutes = totalMinutesSinceMidnight - 1080;
    } else {
      relativeMinutes = totalMinutesSinceMidnight + (1440 - 1080);
    }
  }
  
  // Calculate slot index (30 slots of 24 mins each)
  const intervalIndex = Math.floor(relativeMinutes / 24);
  const safeIndex = Math.min(Math.max(intervalIndex, 0), 29);
  
  const label = ashtaData.table[safeIndex][dayIndex];
  
  // Time Category (ఉ, మ, సా, రా)
  let timeCategory = "";
  if (totalMinutesSinceMidnight >= 360 && totalMinutesSinceMidnight < 720) {
    timeCategory = "ఉ"; // ఉదయం (6 AM - 12 PM)
  } else if (totalMinutesSinceMidnight >= 720 && totalMinutesSinceMidnight < 960) {
    timeCategory = "మ"; // మధ్యాహ్నం (12 PM - 4 PM)
  } else if (totalMinutesSinceMidnight >= 960 && totalMinutesSinceMidnight < 1080) {
    timeCategory = "సా"; // సాయంత్రం (4 PM - 6 PM)
  } else {
    timeCategory = "రా"; // రాత్రి (6 PM - 6 AM)
  }

  // Handle the missing row 10 in the table (9:36 to 10:00)
  // If label is null, it means it's the missing row.
  // We can fallback to the previous row or show "Unknown".
  let finalLabel = label;
  if (label === null) {
      // Missing Row (9:36 to 10:00) - Row 10 in our 1-30 system
      // If we are in this slot, it was missing in the scan.
      finalLabel = "వివరం అందుబాటులో లేదు"; // "Details not available" in Telugu
  }

  const info = ashtaData.labels[finalLabel] || { type: 'neutral' };
  
  // Calculate progress within current interval (24 minutes)
  const minutesIntoCurrentInterval = relativeMinutes % 24;
  const progressPercent = (minutesIntoCurrentInterval / 24) * 100;

  return {
    name: finalLabel,
    type: info.type,
    isNight,
    intervalIndex: safeIndex,
    timeCategory,
    progressPercent,
    startTime: getSlotTime(safeIndex, isNight),
    endTime: getSlotTime(safeIndex + 1, isNight)
  };
};

// Helper to get time string for a slot index
const getSlotTime = (index, isNight) => {
    let baseMinutes = isNight ? 1080 : 360; // 6 PM or 6 AM
    let totalMinutes = (baseMinutes + (index * 24)) % 1440;
    
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const getSlotCategory = (index, isNight) => {
    let baseMinutes = isNight ? 1080 : 360;
    let totalMinutes = (baseMinutes + (index * 24)) % 1440;
    
    if (totalMinutes >= 360 && totalMinutes < 720) return "ఉ";
    if (totalMinutes >= 720 && totalMinutes < 960) return "మ";
    if (totalMinutes >= 960 && totalMinutes < 1080) return "సా";
    return "రా";
};

exports.getAllAshtaSlots = (isNight) => {
    const slots = [];
    for (let i = 0; i < 30; i++) {
        slots.push({
            index: i,
            start: getSlotTime(i, isNight),
            end: getSlotTime(i + 1, isNight),
            category: getSlotCategory(i, isNight),
            isNight
        });
    }
    return slots;
};
