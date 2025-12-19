import Link from "next/link";
import { useMemo } from "react";
import clsx from "clsx";

function getMonthMatrix(year, month) {
  const first = new Date(year, month-1, 1);
  const last = new Date(year, month, 0);
  const startDay = first.getDay();
  const days = last.getDate();
  const matrix = [];
  let dayCounter = 1 - startDay;
  for (let r = 0; r < 6; r++) {
    const week = [];
    for (let c = 0; c < 7; c++) {
      if (dayCounter < 1 || dayCounter > days) {
        week.push(null);
      } else {
        week.push(dayCounter);
      }
      dayCounter++;
    }
    matrix.push(week);
  }
  return matrix;
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({ year, month, monthData = {} }) {
  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const today = new Date();
  const isToday = (d) => d === today.getDate() && month === (today.getMonth()+1) && year === today.getFullYear();

  return (
    <div className="w-full">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayLabels.map((day, i) => (
          <div 
            key={i} 
            className={clsx(
              "text-center text-xs font-semibold py-2 rounded-lg",
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-indigo-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-rows-6 gap-2">
        {matrix.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-2">
            {week.map((d, j) => (
              <DayCell 
                key={j} 
                day={d} 
                year={year} 
                month={month} 
                monthData={monthData} 
                isToday={isToday(d)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayCell({ day, year, month, monthData, isToday }) {
  if (!day) return <div className="h-14"></div>;
  
  const dateKey = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const meta = monthData[dateKey] || {};
  const hasFestival = meta?.festivals?.length > 0;
  const hasEvent = meta?.has_event;
  
  return (
    <Link 
      href={`/day/${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`}
      className={clsx(
        "h-14 flex flex-col items-center justify-center rounded-xl transition-all duration-200 relative overflow-hidden group",
        isToday 
          ? "bg-gradient-to-br from-saffron-400 to-saffron-500 text-white shadow-lg scale-105 z-10" 
          : "bg-white hover:bg-saffron-50 hover:shadow-md active:scale-95 border border-gray-100"
      )}
    >
      {/* Day Number */}
      <div className={clsx(
        "text-sm font-semibold z-10",
        isToday ? "text-white" : "text-indigo-700"
      )}>
        {day}
      </div>
      
      {/* Event Indicators */}
      <div className="flex gap-1 mt-0.5 z-10">
        {hasFestival && (
          <span 
            className={clsx(
              "w-1.5 h-1.5 rounded-full",
              isToday ? "bg-white" : "bg-saffron-500"
            )}
            title="Festival"
          />
        )}
        {hasEvent && (
          <span 
            className={clsx(
              "w-1.5 h-1.5 rounded-full",
              isToday ? "bg-white/80" : "bg-indigo-500"
            )}
            title="Event"
          />
        )}
      </div>
      
      {/* Hover effect */}
      {!isToday && (
        <div className="absolute inset-0 bg-gradient-to-br from-saffron-400/0 to-saffron-500/0 group-hover:from-saffron-400/10 group-hover:to-saffron-500/10 transition-all duration-200 rounded-xl"></div>
      )}
    </Link>
  );
}
