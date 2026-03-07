"use client";

import { useEffect } from 'react';
import useDayData from "../../../hooks/useDayData";
import DayDetailModal from "../../../components/DayDetailModal";

export default function DayPage({ params }) {
  const date = params.date;
  const { data, isLoading } = useDayData(date);

  useEffect(() => {
    console.log('DayPage Render:', { date, isLoading, hasData: !!data, dataSource: data?._dataSource });
  });

  return (
    <div className="animate-fade-in pb-14 relative">

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
