"use client";

import { FaSun, FaMoon, FaChevronDown } from "react-icons/fa";

import { Dhurjati } from "next/font/google";

const dhurjati = Dhurjati({
  subsets: ["telugu"],
  weight: "400",
});

// Reusing the same helper components for consistency, but defined locally or imported if shared.
// For simplicity in this standalone file, I will inline the necessary minimal helpers or props.

export default function DailyPanchangamShare({ data, date }) {
  // --- Helpers & Logic (Simplified from DailyPanchangam) ---
  
  // Telugu mapping (Same as main component)
  const teluguDays = { "Sunday": "ఆదివారము", "Monday": "సోమవారము", "Tuesday": "మంగళవారము", "Wednesday": "బుధవారము", "Thursday": "గురువారము", "Friday": "శుక్రవారము", "Saturday": "శనివారము" };
  const teluguMonths = { "January": "జనవరి", "February": "ఫిబ్రవరి", "March": "మార్చి", "April": "ఏప్రిల్", "May": "మే", "June": "జూన్", "July": "జూలై", "August": "ఆగస్టు", "September": "సెప్టెంబర్", "October": "అక్టోబర్", "November": "నవంబర్", "December": "డిసెంబర్" };

  const findSection = (sections, title) => sections?.find(section => section.title === title);
  const findItem = (section, label) => section?.items?.find(item => item.label === label);
  const formatEventTime = (event) => {
    if (!event) return "";
    const startMatch = (event.start || "").match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/);
    const endMatch = (event.end || "").match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/);
    if (startMatch && endMatch) return `${startMatch[1]} నుండి ${endMatch[1]}`;
    return event.start || "";
  };
  const getCurrentEvent = (events) => events?.[0]; // For share, just take first or logic if avail (simplified)

  // -- Data Parsing --
  if (!data || !data.sections) return <div className="p-4">Loading Share Card...</div>;

  let dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const teluguDay = teluguDays[dayName] || dayName;
  const teluguMonth = teluguMonths[monthName] || monthName;

  const traditionalPanchangamSection = findSection(data.sections, "సాంప్రదాయ పంచాంగం") || data.sections?.find(s => s.title?.includes("సాంప్రదాయ"));
  const lunarMonthSection = findSection(data.sections, "చంద్ర మాస సమాచారం");
  const sunMoonSection = findSection(data.sections, "సూర్య చంద్రోదయాలు");
  const panchangamSection = findSection(data.sections, "మూల పంచాంగం");
  const auspiciousSection = findSection(data.sections, "శుభ సమయాలు");
  
  // Collect inauspicious timings by scanning all items across all sections
  const mergedInauspiciousItems = [];
  data.sections?.forEach(section => {
    section.items?.forEach(item => {
      // Basic type detection for share (inline if needed or from label)
      const labelLower = (item.label || "").toLowerCase();
      const isInauspicious = ['రాహు', 'rahu', 'యమ', 'yama', 'గులిక', 'gulika', 'దుర్ముహూర్త', 'durmuhurtham', 'వర్జ్య', 'vargyam'].some(keyword => labelLower.includes(keyword));
      
      if (isInauspicious) {
        const val = String(item.value || "").trim();
        const isPlaceholder = !val || val.toLowerCase() === "none" || val.toLowerCase() === "n/a";
        
        const existingIdx = mergedInauspiciousItems.findIndex(existing => existing.label === item.label);
        
        if (existingIdx === -1) {
          if (!isPlaceholder) {
            mergedInauspiciousItems.push(item);
          }
        } else if (!isPlaceholder) {
          mergedInauspiciousItems[existingIdx] = item;
        }
      }
    });
  });

  const inauspiciousSection = {
    title: "అశుభ సమయాలు",
    items: mergedInauspiciousItems
  };

  // Items
  const sunriseItem = findItem(sunMoonSection, "సూర్యోదయం");
  const sunsetItem = findItem(sunMoonSection, "సూర్యాస్తమయం");
  const moonriseItem = findItem(sunMoonSection, "చంద్రోదయం");
  const moonsetItem = findItem(sunMoonSection, "చంద్రాస్తమయం");

  const tithiItem = findItem(panchangamSection, "తిథులు");
  const nakshatramItem = findItem(panchangamSection, "నక్షత్రాలు");
  const yogamItem = findItem(panchangamSection, "యోగాలు");
  const karanamItem = findItem(panchangamSection, "కరణాలు");

  // For share view, we just show the first active one or primary one
  const getVal = (item) => item?.type === "event_list" ? (item.events[0]?.name) : null;
  const getTime = (item) => item?.type === "event_list" ? formatEventTime(item.events[0]) : null;

  const currentTithiName = getVal(tithiItem);
  const currentNakshatramName = getVal(nakshatramItem);
  const currentYogamName = getVal(yogamItem);
  const currentKaranamName = getVal(karanamItem);

  const tithiTime = getTime(tithiItem);
  const nakshatramTime = getTime(nakshatramItem);
  const yogamTime = getTime(yogamItem);
  const karanamTime = getTime(karanamItem);
  
  const summary = findItem(traditionalPanchangamSection, "సారాంశం")?.value || "";
  const summary_array = summary.split(';');

  const AstroCardShare = ({ title, value, time, color, icon }) => {
     const colorMap = {
        indigo: "from-indigo-500 to-blue-600",
        purple: "from-purple-500 to-fuchsia-600",
        teal: "from-teal-400 to-emerald-500",
        rose: "from-rose-500 to-red-600",
     };
     const gradient = colorMap[color];
     
     return (
       <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm relative overflow-hidden">
         <div className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-xl`}></div>
         <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <div className="text-[10px] font-bold text-gray-500 uppercase">{title}</div>
         </div>
         <div className="font-bold text-gray-900 text-sm leading-tight">{value}</div>
         {time && <div className="text-[10px] text-gray-500 mt-0.5">{time}</div>}
       </div>
     );
  };

  const TimeRowShare = ({ label, value, isGood }) => (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
         <div className={`w-1 h-1 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`}></div>
         <span className="text-xs font-semibold text-gray-700">{label}</span>
      </div>
      <div className="text-xs font-bold text-gray-900 text-right">
        {value.split('|').map((part, pIdx) => (
          <div key={pIdx}>{part.trim()}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div id="panchangam-share-card" className="bg-white w-[400px] min-h-[800px] p-0 relative overflow-hidden flex flex-col font-sans">
      
      {/* --- APP HEADER (Branding) --- */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-6 text-white text-center rounded-b-[2rem] shadow-xl relative z-10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col items-center">
             <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-lg mb-3 flex items-center justify-center transform rotate-3">
                 <img src="/logo_icon.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
             
             <h2 className={`${dhurjati.className} text-3xl font-bold text-white mb-1 drop-shadow-md`}>
                స్వస్తిక్
             </h2>
             <p className={`${dhurjati.className} text-xl text-orange-100 font-medium tracking-wide`}>పంచాంగం</p>
        </div>
      </div>

      <div className="p-5 flex-1 space-y-5 bg-gradient-to-b from-white to-orange-50/30">
        
        {/* Date Display */}
        <div className="text-center">
            <div className="text-orange-600 font-bold text-lg">{teluguMonth} - {teluguDay}</div>
            <div className="text-3xl font-black text-gray-800 tracking-tight mt-1">
               {dateObj.getDate().toString().padStart(2, '0')}-{String(dateObj.getMonth() + 1).padStart(2, '0')}-{dateObj.getFullYear()}
            </div>
            
            {/* Summary */}
             {summary_array.length > 0 && (
                <div className="mt-3 text-xs text-gray-500 font-medium px-4 leading-relaxed">
                   {summary_array.join(" • ")}
                </div>
            )}
        </div>

        {/* Sun & Moon Grid */}
        <div className="grid grid-cols-2 gap-3 bg-orange-50 rounded-xl p-3 border border-orange-100">
           <div className="flex items-center gap-2">
              <FaSun className="text-orange-500" size={14} />
              <div className="flex flex-col">
                 <span className="text-[9px] text-orange-800/60 font-bold uppercase">Sunrise</span>
                 <span className="text-xs font-bold text-gray-800">{sunriseItem?.value}</span>
              </div>
           </div>
           <div className="flex items-center gap-2 justify-end">
              <div className="flex flex-col text-right">
                 <span className="text-[9px] text-indigo-800/60 font-bold uppercase">Sunset</span>
                 <span className="text-xs font-bold text-gray-800">{sunsetItem?.value}</span>
              </div>
              <FaSun className="text-indigo-400" size={14} />
           </div>
           
           <div className="col-span-2 h-[1px] bg-orange-200/50"></div>

           <div className="flex items-center gap-2">
              <FaMoon className="text-indigo-500" size={12} />
              <div className="flex flex-col">
                 <span className="text-[9px] text-indigo-800/60 font-bold uppercase">Moonrise</span>
                 <span className="text-xs font-bold text-gray-800">{moonriseItem?.value}</span>
              </div>
           </div>
           <div className="flex items-center gap-2 justify-end">
              <div className="flex flex-col text-right">
                 <span className="text-[9px] text-indigo-800/60 font-bold uppercase">Moonset</span>
                 <span className="text-xs font-bold text-gray-800">{moonsetItem?.value}</span>
              </div>
              <FaMoon className="text-indigo-400" size={12} />
           </div>
        </div>

        {/* Astro Grid */}
        <div>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Panchangam Details</h3>
           <div className="grid grid-cols-2 gap-3">
              <AstroCardShare icon="🌙" title="Tithi" value={currentTithiName} time={tithiTime} color="indigo" />
              <AstroCardShare icon="⭐" title="Nakshatram" value={currentNakshatramName} time={nakshatramTime} color="purple" />
              <AstroCardShare icon="🧘" title="Yogam" value={currentYogamName} time={yogamTime} color="teal" />
              <AstroCardShare icon="🐾" title="Karanam" value={currentKaranamName} time={karanamTime} color="rose" />
           </div>
        </div>

        {/* Timings - Side by Side Columns for compactness */}
        <div className="grid grid-cols-1 gap-4">
           {auspiciousSection?.items?.length > 0 && (
               <div className="bg-green-50/50 rounded-xl p-3 border border-green-100">
                  <h3 className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Good Times
                  </h3>
                  <div>
                     {auspiciousSection.items.slice(0, 4).map((item, i) => ( // Limit to 4 for space
                        <TimeRowShare key={i} label={item.label} value={item.value} isGood={true} />
                     ))}
                  </div>
               </div>
           )}

           {inauspiciousSection?.items?.length > 0 && (
               <div className="bg-red-50/50 rounded-xl p-3 border border-red-100">
                  <h3 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Avoid Times
                  </h3>
                  <div>
                     {inauspiciousSection.items.slice(0, 6).map((item, i) => (
                        <TimeRowShare key={i} label={item.label} value={item.value} isGood={false} />
                     ))}
                  </div>
               </div>
           )}
        </div>

      </div>

      {/* --- APP FOOTER (Branding) --- */}
      <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
         <div className="text-xs text-gray-500 font-medium">Shared via</div>
         <div className="text-sm font-bold text-orange-600 mt-0.5">Sri Subhapradam App</div>
         <div className="text-[10px] text-gray-400 mt-1">Available on Android Play Store</div>
      </div>

    </div>
  );
}
