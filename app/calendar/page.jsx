"use client";
import { useState } from "react";
import CalendarGrid from "../../components/CalendarGrid";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // Define allowed date range: December 2025 to December 2026
  const minYear = 2025;
  const minMonth = 12;
  const maxYear = 2026;
  const maxMonth = 12;

  function prevMonth() {
    let m = month - 1;
    let y = year;
    if (m < 1) { m = 12; y = year - 1; }
    
    // Check if the new date is within allowed range
    if (y < minYear || (y === minYear && m < minMonth)) {
      return; // Don't allow navigation before December 2025
    }
    
    setMonth(m); setYear(y);
  }
  
  function nextMonth() {
    let m = month + 1;
    let y = year;
    if (m > 12) { m = 1; y = year + 1; }
    
    // Check if the new date is within allowed range
    if (y > maxYear || (y === maxYear && m > maxMonth)) {
      return; // Don't allow navigation after December 2026
    }
    
    setMonth(m); setYear(y);
  }

  // Check if previous button should be disabled
  const canGoPrev = !(year === minYear && month === minMonth);
  
  // Check if next button should be disabled
  const canGoNext = !(year === maxYear && month === maxMonth);

  return (
    <div className="animate-fade-in">
      {/* Beautiful Header with Gradient */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={prevMonth}
            disabled={!canGoPrev}
            className={`p-3 rounded-xl shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center ${
              canGoPrev
                ? 'bg-gradient-to-r from-saffron-400 to-saffron-500 text-white hover:shadow-glow cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
            aria-label="Previous month"
          >
            <FaChevronLeft size={16} />
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-saffron-600 to-indigo-600 bg-clip-text text-transparent">
              {monthNames[month - 1]}
            </h1>
            <p className="text-sm text-indigo-500 font-medium mt-1">{year}</p>
          </div>
          
          <button 
            onClick={nextMonth}
            disabled={!canGoNext}
            className={`p-3 rounded-xl shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center ${
              canGoNext
                ? 'bg-gradient-to-r from-saffron-400 to-saffron-500 text-white hover:shadow-glow cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
            aria-label="Next month"
          >
            <FaChevronRight size={16} />
          </button>
        </div>
        
        {/* Today's date indicator */}
        <div className="text-center pt-3 border-t border-gray-200">
          <p className="text-xs text-indigo-400">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-2xl p-4 shadow-soft border border-white/50">
        <CalendarGrid year={year} month={month} monthData={{}} />
      </div>
    </div>
  );
}
