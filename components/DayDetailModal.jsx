"use client";

import { useRouter } from "next/navigation";
import DailyPanchangam from "./DailyPanchangam";

export default function DayDetailModal({ data, date }) {
  const router = useRouter();

  const handlePrevDate = () => {
    if (!date) return;
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDateStr = currentDate.toISOString().split('T')[0];
    router.push(`/day/${newDateStr}`);
  };

  const handleNextDate = () => {
    if (!date) return;
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDateStr = currentDate.toISOString().split('T')[0];
    router.push(`/day/${newDateStr}`);
  };

  return (
    <DailyPanchangam
      data={data}
      date={date}
      onPrevDate={handlePrevDate}
      onNextDate={handleNextDate}
    />
  );
}
