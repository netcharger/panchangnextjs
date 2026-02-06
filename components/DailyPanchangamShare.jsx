"use client";

import { FaSun, FaMoon, FaChevronDown, FaCalendarAlt } from "react-icons/fa";
import { Dhurjati } from "next/font/google";
import { Noto_Sans_Telugu } from "next/font/google";

const dhurjati = Dhurjati({
  subsets: ["telugu"],
  weight: "400",
});

const notoSans = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "700", "900"],
});

export default function DailyPanchangamShare({ data, date }) {
  // Telugu mapping
  const teluguDays = { "Sunday": "ఆదివారము", "Monday": "సోమవారము", "Tuesday": "మంగళవారము", "Wednesday": "బుధవారము", "Thursday": "గురువారము", "Friday": "శుక్రవారము", "Saturday": "శనివారము" };
  const teluguMonths = { "January": "జనవరి", "February": "ఫిబ్రవరి", "March": "మార్చి", "April": "ఏప్రిల్", "May": "మే", "June": "జూన్", "July": "జూలై", "August": "ఆగస్టు", "September": "సెప్టెంబర్", "October": "అక్టోబర్", "November": "నవంబర్", "December": "డిసెంబర్" };

  const findSection = (sections, title) => sections?.find(section => section.title === title);
  const findItem = (section, label) => section?.items?.find(item => item.label === label);

  // --- TIME FORMATTING LOGIC (Copied from DailyPanchangam for consistency) ---
  
  const toTeluguTime = (timeStr) => {
    // 1. Try AM/PM format
    let match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hour, min;
  
    if (match) {
      let [_, hourStr, minStr, period] = match;
      hour = parseInt(hourStr, 10);
      min = minStr;
      const isPM = period.toUpperCase() === 'PM';
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    } 
    // 2. Try 24-hour format (HH:MM or HH:MM:SS)
    else {
      match = timeStr.match(/(\d{1,2}):(\d{2})/); // Ignore seconds for parsing logic
      if (!match) return timeStr; // Return original if no time found
      let [_, hourStr, minStr] = match;
      hour = parseInt(hourStr, 10);
      min = minStr;
    }
    
    // Determine prefix based on time of day
    // 04:00 to 11:59 -> ఉ (Udayam)
    // 12:00 to 15:59 -> మ (Madhyahnam)
    // 16:00 to 19:59 -> సా (Sayam)
    // 20:00 to 03:59 -> రా (Ratri)
    let prefix = "రా"; 
    if (hour >= 4 && hour < 12) prefix = "ఉ";
    else if (hour >= 12 && hour < 16) prefix = "మ";
    else if (hour >= 16 && hour < 20) prefix = "సా"; // 4 PM to 8 PM is Sayam
    
    // Convert back to 12-hour format for display
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;
    
    // Pad with leading zero
    let displayHourStr = displayHour.toString().padStart(2, '0');
    
    return `${prefix} ${displayHourStr}:${min}`;
  };

  const formatEventTime = (event) => {
    if (!event) return "";
    const endTime = event.end || ""; 

    // Look for any time pattern ( HH:MM or HH:MM:SS or HH:MM AM/PM )
    const timeMatch = endTime.toString().match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)/); 

    if (timeMatch) {
      return `${toTeluguTime(timeMatch[1])} వరకు`;
    }
    return endTime;
  };

  // --- DATA PARSING ---

  if (!data || !data.sections) return <div className="p-4">Loading Share Card...</div>;

  let dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const teluguDay = teluguDays[dayName] || dayName;
  const teluguMonth = teluguMonths[monthName] || monthName;

  const traditionalPanchangamSection = findSection(data.sections, "సాంప్రదాయ పంచాంగం") || data.sections?.find(s => s.title?.includes("సాంప్రదాయ"));
  const sunMoonSection = findSection(data.sections, "సూర్య చంద్రోదయాలు");
  const panchangamSection = findSection(data.sections, "మూల పంచాంగం");
  const auspiciousSection = findSection(data.sections, "శుభ సమయాలు");
  
  // Collect inauspicious timings
  const mergedInauspiciousItems = [];
  data.sections?.forEach(section => {
    section.items?.forEach(item => {
      const labelLower = (item.label || "").toLowerCase();
      const isInauspicious = ['రాహు', 'rahu', 'యమ', 'yama', 'గులిక', 'gulika', 'దుర్ముహూర్త', 'durmuhurtham', 'వర్జ్య', 'vargyam'].some(keyword => labelLower.includes(keyword));
      
      if (isInauspicious) {
        const val = String(item.value || "").trim();
        const isPlaceholder = !val || val.toLowerCase() === "none" || val.toLowerCase() === "n/a";
        
        const existingIdx = mergedInauspiciousItems.findIndex(existing => existing.label === item.label);
        
        if (existingIdx === -1) {
          if (!isPlaceholder) mergedInauspiciousItems.push(item);
        } else if (!isPlaceholder) {
          mergedInauspiciousItems[existingIdx] = item;
        }
      }
    });
  });

  const inauspiciousSectionItems = mergedInauspiciousItems;

  const sunriseItem = findItem(sunMoonSection, "సూర్యోదయం");
  const sunsetItem = findItem(sunMoonSection, "సూర్యాస్తమయం");
  const moonriseItem = findItem(sunMoonSection, "చంద్రోదయం");
  const moonsetItem = findItem(sunMoonSection, "చంద్రాస్తమయం");

  const tithiItem = findItem(panchangamSection, "తిథులు");
  const nakshatramItem = findItem(panchangamSection, "నక్షత్రాలు");
  // Yogam and Karanam REMOVED as requested

  // Helper to extract CURRENT event from list
  const getCurrentEvent = (events) => {
      if (!events || events.length === 0) return null;
      // Ideally we would check current time, but for share card we just default to the first one (sunrise Tithi)
      // or we can try to find the one active at 6 AM or Noon. 
      // For simplicity and consistency with printed calendars, 1st item is usually "Sunrise Tithi"
      return events[0]; 
  };

  const currentTithi = tithiItem?.type === "event_list" ? getCurrentEvent(tithiItem.events) : null;
  const currentNakshatram = nakshatramItem?.type === "event_list" ? getCurrentEvent(nakshatramItem.events) : null;

  const currentTithiName = currentTithi?.name || "No Data";
  const currentNakshatramName = currentNakshatram?.name || "No Data";

  const tithiTime = currentTithi ? formatEventTime(currentTithi) : "";
  const nakshatramTime = currentNakshatram ? formatEventTime(currentNakshatram) : "";
  
  const summary = findItem(traditionalPanchangamSection, "సారాంశం")?.value || "";
  const summary_array = summary.split(';');

  // --- SUB-COMPONENTS ---

  const TimeRowShare = ({ label, value, isGood }) => (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
         <div className={`w-1.5 h-1.5 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`}></div>
         <span className={`text-xs font-bold ${isGood ? 'text-green-800' : 'text-red-800'}`}>{label}</span>
      </div>
      <div className="text-xs font-black text-gray-800 text-right">
        {value.replace(/(\d{1,2}:\d{2}\s*(?:AM|PM))/gi, (match) => toTeluguTime(match)).split('|').map((part, pIdx) => (
          <div key={pIdx}>{part.trim()}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div id="panchangam-share-card" className={`${notoSans.className} bg-white w-[400px] min-h-[850px] relative overflow-hidden flex flex-col`}>
      
      {/* --- APP HEADER --- */}
      <div className="bg-gradient-to-br from-orange-600 to-pink-600 p-6 pt-8 pb-10 text-white text-center rounded-b-[3rem] shadow-xl relative z-10 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-20 flex flex-col items-center">
             <div className="bg-white/95 rounded-2xl p-2.5 shadow-lg mb-4 flex items-center justify-center transform rotate-3">
                 <img src="/logo_icon.png" alt="Logo" className="w-12 h-12 object-contain" />
             </div>
             
             <h2 className={`${dhurjati.className} text-4xl font-bold text-white mb-0 drop-shadow-md`}>
                స్వస్తిక్
             </h2>
             <p className={`${dhurjati.className} text-2xl text-orange-100 font-medium tracking-wide opacity-90`}>పంచాంగం</p>
        </div>
      </div>

      <div className="px-6 -mt-8 flex-1 relative z-20 pb-6">
        
        {/* DATE CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-orange-100 text-center mb-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-orange-400"></div>
            <div className="text-orange-600 font-bold text-lg uppercase tracking-wider mb-1">{teluguMonth}</div>
            <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-black text-gray-800 tracking-tighter">
                   {dateObj.getDate().toString().padStart(2, '0')}
                </span>
                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-gray-400 uppercase">{dayName}</span>
                    <span className="text-sm font-bold text-gray-600">{dateObj.getFullYear()}</span>
                </div>
            </div>
             {/* Year Name Summary */}
             {summary_array.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-medium leading-relaxed">
                   {summary_array[0]}
                </div>
            )}
        </div>

        {/* TITHI & NAKSHATRAM (HERO) */}
        <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Tithi */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100 shadow-sm flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                        <FaMoon className="text-lg" />
                        <span className="text-xs font-bold uppercase tracking-wide">తిథి</span>
                    </div>
                    <div className="text-lg font-black text-gray-800 leading-tight mb-2">
                        {currentTithiName}
                    </div>
                </div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-100/50 px-2 py-1.5 rounded-lg inline-block">
                    {tithiTime || "రోజంతా"}
                </div>
            </div>

            {/* Nakshatram */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-4 border border-purple-100 shadow-sm flex flex-col justify-between h-full">
                <div>
                     <div className="flex items-center gap-2 mb-2 text-purple-600">
                        <FaSun className="text-lg" /> {/* Star icon replacement */}
                        <span className="text-xs font-bold uppercase tracking-wide">నక్షత్రం</span>
                    </div>
                    <div className="text-lg font-black text-gray-800 leading-tight mb-2">
                        {currentNakshatramName}
                    </div>
                </div>
                 <div className="text-xs font-bold text-purple-600 bg-purple-100/50 px-2 py-1.5 rounded-lg inline-block">
                    {nakshatramTime || "రోజంతా"}
                </div>
            </div>
        </div>

        {/* SUN & MOON */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-5 grid grid-cols-2 gap-y-2 gap-x-4">
           <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><FaSun className="text-orange-400"/> సూర్యోదయం</span>
              <span className="text-xs font-bold text-gray-800">{sunriseItem?.value}</span>
           </div>
           <div className="flex justify-between items-center">
               <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><FaSun className="text-gray-400"/> సూర్యాస్తమయం</span>
               <span className="text-xs font-bold text-gray-800">{sunsetItem?.value}</span>
           </div>
           {/* Line Separator */}
            <div className="col-span-2 h-[1px] bg-gray-200"></div>
           <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><FaMoon className="text-indigo-400"/> చంద్రోదయం</span>
              <span className="text-xs font-bold text-gray-800">{moonriseItem?.value}</span>
           </div>
           <div className="flex justify-between items-center">
               <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><FaMoon className="text-gray-400"/> చంద్రాస్తమయం</span>
               <span className="text-xs font-bold text-gray-800">{moonsetItem?.value}</span>
           </div>
        </div>

        {/* TIMINGS GRID */}
        <div className="grid grid-cols-1 gap-4">
           {/* Good Times */}
           {auspiciousSection?.items?.length > 0 && (
               <div className="bg-green-50/60 rounded-2xl p-4 border border-green-100">
                  <h3 className="text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-1.5">
                     <span className="w-2 h-2 bg-green-500 rounded-full"></span> శుభ సమయాలు
                  </h3>
                  <div>
                     {auspiciousSection.items.slice(0, 4).map((item, i) => ( 
                        <TimeRowShare key={i} label={item.label} value={item.value} isGood={true} />
                     ))}
                  </div>
               </div>
           )}

           {/* Bad Times */}
           {inauspiciousSectionItems?.length > 0 && (
               <div className="bg-red-50/60 rounded-2xl p-4 border border-red-100">
                  <h3 className="text-xs font-bold text-red-700 uppercase mb-3 flex items-center gap-1.5">
                     <span className="w-2 h-2 bg-red-500 rounded-full"></span> అశుభ సమయాలు
                  </h3>
                  <div>
                     {inauspiciousSectionItems.slice(0, 5).map((item, i) => (
                        <TimeRowShare key={i} label={item.label} value={item.value} isGood={false} />
                     ))}
                  </div>
               </div>
           )}
        </div>

      </div>

      {/* --- APP FOOTER --- */}
      <div className="bg-gradient-to-t from-orange-50 to-white pt-6 pb-6 text-center border-t border-orange-100/50">
         <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Shared via</div>
         <div className="text-lg font-black text-orange-600 font-sans">Swasthik Telugu Panchangam </div>
         <div className="text-[10px] text-gray-400 mt-1 font-medium">  Android playstore </div>
      </div>

    </div>
  );
}
