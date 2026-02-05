"use client";

import { useState, useEffect } from 'react';
import useDayData from "../../../hooks/useDayData";
import DayDetailModal from "../../../components/DayDetailModal";

export default function DayPage({ params }) {
  const date = params.date;
  const { data, isLoading } = useDayData(date);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    console.log('DayPage Render:', { date, isLoading, hasData: !!data, dataSource: data?._dataSource, showToast });
  });

  useEffect(() => {
    if (data?._dataSource) {
      console.log('Toast Triggered:', data._dataSource);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <div className="animate-fade-in pb-14 relative">
      {/* Data Source Toast */}
      {showToast && data?._dataSource && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md shadow-lg animate-fade-in-up">
          📡 Source: {data._dataSource}
        </div>
      )}

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
