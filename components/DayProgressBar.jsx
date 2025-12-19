"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function DayProgressBar({ targetDate }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const now = dayjs().tz('Asia/Kolkata');
      const startOfDay = dayjs.tz(targetDate, 'Asia/Kolkata').startOf('day');
      const endOfDay = dayjs.tz(targetDate, 'Asia/Kolkata').endOf('day');

      const totalDuration = endOfDay.diff(startOfDay);
      const elapsed = now.diff(startOfDay);

      if (elapsed < 0) {
        return 0; // Day hasn't started yet
      }
      if (elapsed > totalDuration) {
        return 100; // Day has ended
      }

      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    };

    // Calculate immediately
    setProgress(calculateProgress());

    // Update every second
    const interval = setInterval(() => {
      setProgress(calculateProgress());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // SVG circle parameters
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0, 0, 0, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gradient-progress)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.3))',
            }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-indigo-700">
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-indigo-500 mt-0.5">
            రోజు పూర్తి
          </div>
        </div>
      </div>
  );
}

