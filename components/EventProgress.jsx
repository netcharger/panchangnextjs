"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Parse time string like "11:44 AM - 12:32 PM"
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
  const startTimeStr = `${dateStr} ${String(startH).padStart(2, '0')}:${startMin}:00`;
  const endTimeStr = `${dateStr} ${String(endH).padStart(2, '0')}:${endMin}:00`;
  const startTime = dayjs.tz(startTimeStr, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
  const endTime = dayjs.tz(endTimeStr, 'YYYY-MM-DD HH:mm:ss', 'Asia/Kolkata');
  
  return { start: startTime, end: endTime };
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

// Format remaining time
const formatRemainingTime = (endTime, now) => {
  const diff = endTime.diff(now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export default function EventProgress({ event, dateStr, size = 80, strokeWidth = 6 }) {
  const [now, setNow] = useState(() => dayjs().tz('Asia/Kolkata'));
  const [timeRange, setTimeRange] = useState(null);

  useEffect(() => {
    setTimeRange(parseTimeRange(event.value, dateStr));
  }, [event.value, dateStr]);

  useEffect(() => {
    const interval = setInterval(() => {
        setNow(dayjs().tz('Asia/Kolkata'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeRange) return null;

  // Check if active
  const isActive = now.isAfter(timeRange.start) && now.isBefore(timeRange.end);
  if (!isActive) return null;

  const progress = calculateProgress(timeRange.start, timeRange.end, now);
  const remaining = formatRemainingTime(timeRange.end, now);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Color logic (defaulting to red for inauspicious as this component is primarily for that)
  const color = "#EF4444"; 

  return (
    <div className="flex flex-col items-center animate-fade-in mx-2">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(239, 68, 68, 0.1)"
            strokeWidth={strokeWidth}
          />
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
            style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-red-600 truncate max-w-[90%] text-center leading-tight">
                {event.label}
            </span>
             <span className="text-[10px] font-medium text-red-400">
                {Math.round(progress)}%
            </span>
        </div>
      </div>
      <div className="mt-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
         {remaining} left
      </div>
    </div>
  );
}
