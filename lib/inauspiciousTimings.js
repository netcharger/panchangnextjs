const FIXED_INAUSPICIOUS_TIMINGS = {
  Monday: {
    rahu: "07:30 AM నుండి 09:00 AM",
    yama: "10:30 AM నుండి 12:00 PM",
    gulika: "01:30 PM నుండి 03:00 PM"
  },
  Tuesday: {
    rahu: "03:00 PM నుండి 04:30 PM",
    yama: "09:00 AM నుండి 10:30 AM",
    gulika: "12:00 PM నుండి 01:30 PM"
  },
  Wednesday: {
    rahu: "12:00 PM నుండి 01:30 PM",
    yama: "07:30 AM నుండి 09:00 AM",
    gulika: "10:30 AM నుండి 12:00 PM"
  },
  Thursday: {
    rahu: "01:30 PM నుండి 03:00 PM",
    yama: "06:00 AM నుండి 07:30 AM",
    gulika: "09:00 AM నుండి 10:30 AM"
  },
  Friday: {
    rahu: "10:30 AM నుండి 12:00 PM",
    yama: "03:00 PM నుండి 04:30 PM",
    gulika: "07:30 AM నుండి 09:00 AM"
  },
  Saturday: {
    rahu: "09:00 AM నుండి 10:30 AM",
    yama: "01:30 PM నుండి 03:00 PM",
    gulika: "06:00 AM నుండి 07:30 AM"
  },
  Sunday: {
    rahu: "04:30 PM నుండి 06:00 PM",
    yama: "12:00 PM నుండి 01:30 PM",
    gulika: "03:00 PM నుండి 04:30 PM"
  }
};

exports.FIXED_INAUSPICIOUS_TIMINGS = FIXED_INAUSPICIOUS_TIMINGS;

exports.getFixedTimingsForDay = (dayName) => {
  // Ensure dayName is capitalized correctly (e.g., "Monday")
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
  return FIXED_INAUSPICIOUS_TIMINGS[capitalizedDay] || null;
};
