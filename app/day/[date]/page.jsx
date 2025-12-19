"use client";

import useDayData from "../../../hooks/useDayData";
import DayDetailModal from "../../../components/DayDetailModal";
import { sendToNative } from "../../../lib/webviewBridge";
import { FaBell } from "react-icons/fa";

export default function DayPage({ params }) {
  const date = params.date;
  const { data, isLoading } = useDayData(date);

  function handleSetAlarm() {
    sendToNative({ type: "SET_ALARM", date });
  }

  return (
    <div className="animate-fade-in pb-32">
      {isLoading ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-white/50">
          <p className="text-indigo-500">Loading panchangam details...</p>
        </div>
      ) : (
        <DayDetailModal data={data} date={date} />
      )}

      {/* Sticky Alarm Button */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center z-40 px-4">
        <div className="w-full max-w-[420px]">
          <button
            onClick={handleSetAlarm}
            className="w-full glass rounded-xl bg-gradient-to-r from-saffron-400 to-saffron-500 text-white py-4 px-6 shadow-lg hover:shadow-glow active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 font-semibold border border-white/20"
          >
            <FaBell size={18} />
            <span>Set Alarm for this Day</span>
          </button>
        </div>
      </div>
    </div>
  );
}
