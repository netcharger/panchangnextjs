"use client";

import DailyPanchangamShare from '../../components/DailyPanchangamShare';

export default function SharePreviewPage() {
  // Mock data for preview
  // Mock data for preview matching the structure expected by DailyPanchangamShare
  const mockData = {
    sections: [
      {
        title: "సాంప్రదాయ పంచాంగం",
        items: [
           { label: "సారాంశం", value: "క్రోధి నామ నూతన సంవత్సర శుభాకాంక్షలు" }
        ]
      },
      {
        title: "సూర్య చంద్రోదయాలు",
        items: [
          { label: "సూర్యోదయం", value: "06:30 AM" },
          { label: "సూర్యాస్తమయం", value: "06:15 PM" },
          { label: "చంద్రోదయం", value: "07:00 PM" },
          { label: "చంద్రాస్తమయం", value: "06:00 AM" }
        ]
      },
      {
        title: "మూల పంచాంగం",
        items: [
          { 
            label: "తిథులు", 
            type: "event_list",
            events: [{ name: "శుక్ల పక్ష తదియ", end: "05:30 PM" }]
          },
          { 
            label: "నక్షత్రాలు", 
            type: "event_list",
            events: [{ name: "రోహిణి", end: "08:15 PM" }]
          }
        ]
      },
      {
        title: "శుభ సమయాలు",
        items: [
          { label: "అభిజిత్ ముహూర్తం", value: "11:55 AM - 12:45 PM" }
        ]
      },
      {
        title: "అశుభ సమయాలు",
        items: [
          { label: "రాహు కాలం", value: "01:30 PM - 03:00 PM" },
          { label: "యమగండం", value: "06:00 AM - 07:30 AM" },
          { label: "దుర్ముహూర్తం", value: "08:30 AM - 09:15 AM" }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <DailyPanchangamShare data={mockData} date="2024-02-06" />
    </div>
  );
}
