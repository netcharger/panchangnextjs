"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs().tz('Asia/Kolkata');
      const target = dayjs.tz(targetDate, 'Asia/Kolkata').endOf('day');
      const diff = target.diff(now);

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <div className="text-xs text-indigo-500 font-medium mb-2">
        రోజు ముగియడానికి మిగిలిన సమయం
      </div>
      <div className="flex items-center justify-center gap-2">
        <TimeUnit value={timeLeft.hours} label="గంటలు" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="నిమిషాలు" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="సెకన్లు" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-bold text-indigo-700 bg-white rounded-lg px-2 py-2 min-w-[40px] text-center shadow-sm">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-indigo-500 mt-1">{label}</div>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col items-center justify-center pb-6">
      <span className="text-xl font-bold text-indigo-400">:</span>
    </div>
  );
}

