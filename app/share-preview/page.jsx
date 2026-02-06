"use client";

import DailyPanchangamShare from '../../components/DailyPanchangamShare';

export default function SharePreviewPage() {
  // Mock data for preview
  const mockData = {
    date: "2024-02-06",
    tithi: {
      name: " శుక్ల పక్ష దర్శ",
      end_time: "2024-02-06T15:30:00"
    },
    nakshatram: {
      name: "శ్రవణం",
      end_time: "2024-02-06T18:45:00"
    },
    varjyam: {
      time: "రాత్రి 08:12 నుండి 09:45 వరకు"
    },
    rahukalam: {
      time: "మధ్యాహ్నం 01:30 నుండి 03:00 వరకు"
    },
    yamagandam: {
      time: "ఉదయం 06:00 నుండి 07:30 వరకు"
    },
    durmuhurtham: {
      time: "ఉదయం 08:30 నుండి 09:15 వరకు"
    },
    abhijit_muhurtham: {
      time: "మధ్యాహ్నం 12:00 నుండి 12:45 వరకు"
    },
    sunrise: "06:30 AM",
    sunset: "06:15 PM",
    sakala_gu_pt: "శుభ సమయం",
    thidi: "త్రయోదశి",
    vaaram: "మంగళవారం"
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <DailyPanchangamShare data={mockData} date="2024-02-06" />
    </div>
  );
}
