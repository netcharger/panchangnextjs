"use client";

import useDayData from "../../../hooks/useDayData";
import DayDetailModal from "../../../components/DayDetailModal";

export default function DayPage({ params }) {
  const date = params.date;
  const { data, isLoading } = useDayData(date);

  return (
    <div className="animate-fade-in pb-14">
      {isLoading ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-white/50">
          <p className="text-indigo-500">Loading panchangam details...</p>
        </div>
      ) : (
        <DayDetailModal data={data} date={date} />
      )}

    </div>
  );
}
