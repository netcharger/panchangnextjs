"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Event type to color mapping
const getEventColor = (type, isInauspicious = false) => {
  // Inauspicious events always red
  if (isInauspicious) {
    return "#EF4444"; // Red for inauspicious
  }
  // Auspicious events always green
  return "#10B981"; // Green for auspicious
};

// Parse time string like "11:44 AM - 12:32 PM" or "01:34 PM - 02:59 PM"
const parseTimeRange = (timeString, dateStr) => {
  if (!timeString) return null;
  
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  
  const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = match;
  
  // Convert to 24-hour format
  let startH = parseInt(startHour);
  let endH = parseInt(endHour);
  
  if (startPeriod.toUpperCase() === 'PM' && startH !== 12) startH += 12;
  if (startPeriod.toUpperCase() === 'AM' && startH === 12) startH = 0;
  
  if (endPeriod.toUpperCase() === 'PM' && endH !== 12) endH += 12;
  if (endPeriod.toUpperCase() === 'AM' && endH === 12) endH = 0;
  
  // Create date objects in Asia/Kolkata timezone
  // Format: YYYY-MM-DD HH:mm:ss
  const startTimeStr = `${dateStr} ${String(startH).padStart(2, '0')}:${startMin}:00`;
  const endTimeStr = `${dateStr} ${String(endH).padStart(2, '0')}:${endMin}:00`;
  const startTime = dayjs.tz(startTimeStr, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
  const endTime = dayjs.tz(endTimeStr, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
  
  return { start: startTime, end: endTime };
};

// Detect event type from label
const detectEventType = (label) => {
  const labelLower = label.toLowerCase();
  if (labelLower.includes('రాహు') || labelLower.includes('rahu')) return 'rahu';
  if (labelLower.includes('యమ') || labelLower.includes('yama')) return 'yama';
  if (labelLower.includes('గులిక') || labelLower.includes('గుళిక') || labelLower.includes('gulika')) return 'gulika';
  if (labelLower.includes('దుర్ముహూర్త') || labelLower.includes('durmuhurtham')) return 'durmuhurtham';
  if (labelLower.includes('వర్జ్యం') || labelLower.includes('vargyam')) return 'vargyam';
  if (labelLower.includes('అభిజిత్') || labelLower.includes('abhijit')) return 'abhijit';
  if (labelLower.includes('అమృత') || labelLower.includes('amrit')) return 'amrit';
  if (labelLower.includes('బ్రహ్మ') || labelLower.includes('brahma')) return 'brahma';
  if (labelLower.includes('విజయ') || labelLower.includes('vijaya')) return 'vijaya';
  if (labelLower.includes('గోదూలి') || labelLower.includes('godhuli')) return 'godhuli';
  if (labelLower.includes('ప్రాత') || labelLower.includes('సంధ్య') || labelLower.includes('prata')) return 'sandhya';
  if (labelLower.includes('నిశీత') || labelLower.includes('nishita')) return 'nishita';
  if (labelLower.includes('ముహూర్త') || labelLower.includes('muhurtham')) return 'muhurtham';
  return 'muhurtham'; // Default to good muhurtham
};

// Calculate progress percentage (0-100)
const calculateProgress = (start, end, now) => {
  if (!start || !end || !now) return 0;
  if (now.isBefore(start)) return 0;
  if (now.isAfter(end)) return 100;
  
  const total = end.diff(start);
  const elapsed = now.diff(start);
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

// Format remaining time with seconds
const formatRemainingTime = (endTime, now) => {
  const diff = endTime.diff(now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// Active Timer Component
function ActiveTimer({ event, dateStr, isInauspicious = false }) {
  const [now, setNow] = useState(() => dayjs().tz('Asia/Kolkata'));
  const timeRange = parseTimeRange(event.value, dateStr);
  
  useEffect(() => {
    if (!timeRange) return;
    
    const interval = setInterval(() => {
      setNow(dayjs().tz('Asia/Kolkata'));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeRange]);
  
  if (!timeRange) return null;
  
  const progress = calculateProgress(timeRange.start, timeRange.end, now);
  const remaining = formatRemainingTime(timeRange.end, now);
  const endTimeStr = timeRange.end.format('h:mm A');
  const color = getEventColor(event.type || detectEventType(event.label), isInauspicious);
  
  // SVG circle parameters
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="glass rounded-2xl p-5 shadow-soft border border-white/50 overflow-hidden relative">
      <div className="flex items-center gap-4">
        {/* Circular Progress with breathing effect */}
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90 animate-breathe">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle with breathing effect */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: `drop-shadow(0 0 12px ${color}60)`,
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs font-bold" style={{ color }}>
              {Math.round(progress)}%
            </div>
          </div>
        </div>
        
        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold mb-1 ${isInauspicious ? 'text-red-700' : 'text-green-700'}`}>
            {event.label} Active
          </div>
          <div className={`text-xs mb-2 ${isInauspicious ? 'text-red-500' : 'text-green-500'}`}>
            {remaining} left
          </div>
          <div className="text-xs text-indigo-400">
            Ends {endTimeStr}
          </div>
        </div>
      </div>
    </div>
  );
}

// Upcoming Timer Component
function UpcomingTimer({ event, dateStr }) {
  const [now, setNow] = useState(() => dayjs().tz('Asia/Kolkata'));
  const timeRange = parseTimeRange(event.value, dateStr);
  
  useEffect(() => {
    if (!timeRange) return;
    
    const interval = setInterval(() => {
      setNow(dayjs().tz('Asia/Kolkata'));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeRange]);
  
  if (!timeRange) return null;
  
  const timeUntilStart = timeRange.start.diff(now);
  const hoursUntil = Math.floor(timeUntilStart / 3600000);
  const minutesUntil = Math.floor((timeUntilStart % 3600000) / 60000);
  
  const timeUntilStr = hoursUntil > 0 
    ? `${hoursUntil}h ${minutesUntil}m`
    : `${minutesUntil}m`;
  
  // Calculate progress for upcoming (how close we are to start time, max 2 hours)
  const twoHoursBefore = timeRange.start.subtract(2, 'hour');
  const maxDuration = 2 * 60 * 60 * 1000; // 2 hours in ms
  const timeSinceTwoHoursBefore = now.diff(twoHoursBefore);
  const upcomingProgress = Math.min(100, Math.max(0, (timeSinceTwoHoursBefore / maxDuration) * 100));
  
  return (
    <div className="glass rounded-2xl p-4 shadow-soft border border-white/50">
      <div className="mb-2">
        <div className="text-xs font-semibold text-indigo-500 mb-1">Upcoming Time</div>
        <div className="text-sm font-bold text-indigo-700">
          {event.label} starts in {timeUntilStr}
        </div>
      </div>
      
      {/* Time range */}
      <div className="text-xs text-indigo-500 mb-3">
        {timeRange.start.format('h:mm A')} – {timeRange.end.format('h:mm A')}
      </div>
      
      {/* Horizontal progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-1000"
          style={{ width: `${upcomingProgress}%` }}
        />
      </div>
    </div>
  );
}

// Main TimeIndicator Component
export default function TimeIndicator({ events = [], dateStr }) {
  const [now, setNow] = useState(() => dayjs().tz('Asia/Kolkata'));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs().tz('Asia/Kolkata'));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!events || events.length === 0 || !dateStr) return null;
  
  // Find active event
  let activeEvent = null;
  let activeIsInauspicious = false;
  let upcomingEvent = null;
  
  for (const event of events) {
    const value = event.value || "";
    const ranges = value.split('|');
    
    for (const range of ranges) {
      const timeRange = parseTimeRange(range.trim(), dateStr);
      if (!timeRange) continue;
      
      // Check if currently active
      if (now.isAfter(timeRange.start) && now.isBefore(timeRange.end)) {
        // Use isInauspicious flag if available, otherwise determine from event type
        const eventType = event.type || detectEventType(event.label);
        activeIsInauspicious = event.isInauspicious !== undefined 
          ? event.isInauspicious 
          : ['rahu', 'yama', 'gulika', 'durmuhurtham', 'vargyam'].includes(eventType);
        activeEvent = { ...event, value: range.trim(), type: eventType };
        break; // Show only the first active event found
      }
      
      // Check if upcoming (within next 2 hours)
      if (!upcomingEvent && now.isBefore(timeRange.start)) {
        const timeUntilStart = timeRange.start.diff(now);
        const twoHours = 2 * 60 * 60 * 1000;
        if (timeUntilStart <= twoHours && timeUntilStart > 0) {
          upcomingEvent = { ...event, value: range.trim(), type: event.type || detectEventType(event.label) };
        }
      }
    }
    if (activeEvent) break;
  }
  
  // Show active event first, then upcoming
  if (activeEvent) {
    return <ActiveTimer event={activeEvent} dateStr={dateStr} isInauspicious={activeIsInauspicious} />;
  }
  
  if (upcomingEvent) {
    return <UpcomingTimer event={upcomingEvent} dateStr={dateStr} />;
  }
  
  return null;
}

