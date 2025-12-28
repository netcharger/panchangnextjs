"use client";

import { useState, useEffect } from "react";
import { FaSun, FaMoon, FaChevronLeft, FaChevronRight, FaWhatsapp, FaChevronDown, FaChevronUp } from "react-icons/fa";
import TimeIndicator from "./TimeIndicator";
import CountdownTimer from "./CountdownTimer";
import DayProgressBar from "./DayProgressBar";

// Telugu day names mapping
const teluguDays = {
  "Sunday": "ఆదివారము",
  "Monday": "సోమవారము",
  "Tuesday": "మంగళవారము",
  "Wednesday": "బుధవారము",
  "Thursday": "గురువారము",
  "Friday": "శుక్రవారము",
  "Saturday": "శనివారము"
};

// Telugu month names mapping
const teluguMonths = {
  "January": "జనవరి",
  "February": "ఫిబ్రవరి",
  "March": "మార్చి",
  "April": "ఏప్రిల్",
  "May": "మే",
  "June": "జూన్",
  "July": "జూలై",
  "August": "ఆగస్టు",
  "September": "సెప్టెంబర్",
  "October": "అక్టోబర్",
  "November": "నవంబర్",
  "December": "డిసెంబర్"
};

// Helper function to find section by title
const findSection = (sections, title) => {
  return sections?.find(section => section.title === title);
};

// Helper function to find item by label
const findItem = (section, label) => {
  return section?.items?.find(item => item.label === label);
};

// Helper function to format time from event
const formatEventTime = (event) => {
  if (!event) return "";
  const startTime = event.start || "";
  const endTime = event.end || "";

  // Extract time from "Dec 25 12:00 AM" format
  const startMatch = startTime.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/);
  const endMatch = endTime.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/);

  if (startMatch && endMatch) {
    return `${startMatch[1]} - ${endMatch[1]}`;
  }
  return startTime;
};

// Helper function to get current event from event_list
const getCurrentEvent = (events) => {
  if (!events || events.length === 0) return null;

  const now = new Date();
  // Find the event that is currently active
  for (const event of events) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    if (now >= startDate && now <= endDate) {
      return event;
    }
  }
  // If no current event, return the first one
  return events[0];
};

// Detect event type from label (for TimeIndicator)
const detectEventType = (label) => {
  const labelLower = label.toLowerCase();
  if (labelLower.includes('రాహు') || labelLower.includes('rahu')) return 'rahu';
  if (labelLower.includes('యమ') || labelLower.includes('yama')) return 'yama';
  if (labelLower.includes('గులిక') || labelLower.includes('gulika')) return 'gulika';
  if (labelLower.includes('దుర్ముహూర్త') || labelLower.includes('durmuhurtham')) return 'durmuhurtham';
  if (labelLower.includes('అమృత') || labelLower.includes('amrit')) return 'amrit';
  if (labelLower.includes('ముహూర్త') || labelLower.includes('muhurtham')) return 'muhurtham';
  return 'muhurtham'; // Default to good muhurtham
};

export default function DailyPanchangam({ data, date, onPrevDate, onNextDate }) {
  const [showAllAuspicious, setShowAllAuspicious] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-8 shadow-soft text-center border border-white/50">
        <p className="text-indigo-500">Loading panchangam details...</p>
      </div>
    );
  }

  if (!data || !data.sections) {
    return (
      <div className="glass rounded-2xl p-8 shadow-soft text-center border border-white/50">
        <p className="text-indigo-500">Loading panchangam details...</p>
      </div>
    );
  }

  // Parse date - handle both YYYY-MM-DD string and Date object
  let dateObj;
  if (date) {
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = new Date(date);
    }
  } else if (data.date) {
    const [year, month, day] = data.date.split('-').map(Number);
    dateObj = new Date(year, month - 1, day);
  } else {
    dateObj = new Date();
  }

  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const teluguDay = teluguDays[dayName] || dayName;
  const teluguMonth = teluguMonths[monthName] || monthName;

  // Extract data from sections
  const nationalCalendarSection = findSection(data.sections, "భారత జాతీయ క్యాలెండర్");
  const lunarMonthSection = findSection(data.sections, "చంద్ర మాస సమాచారం");
  // Try different possible variations of the title
  let traditionalPanchangamSection = findSection(data.sections, "సాంప్రదాయ పంచాంగం") ||
                                   data.sections?.find(section =>
                                     section.title?.includes("సాంప్రదాయ") &&
                                     section.title?.includes("పంచాంగం")
                                   );

  // TEMPORARY: Force create the section if it doesn't exist (for testing)
  if (!traditionalPanchangamSection) {
    console.log('⚠️ Traditional Panchangam section not found, creating temporary test data');
    traditionalPanchangamSection = {
      title: "సాంప్రదాయ పంచాంగం",
      items: [
        {
          label: "సారాంశం",
          value: "శ్రీ విశ్వావసు నామ సంవత్సరం; దక్షిణాయనం; శిశిర ఋతువు; ఫాల్గుణం మాసం"
        }
      ]
    };
  }
  const sunMoonSection = findSection(data.sections, "సూర్య చంద్రోదయాలు");
  const panchangamSection = findSection(data.sections, "మూల పంచాంగం");
  const auspiciousSection = findSection(data.sections, "శుభ సమయాలు");
  const inauspiciousSection = findSection(data.sections, "అశుభ సమయాలు");
  const festivalsSection = findSection(data.sections, "పండుగలు");

  // Debug logging
  console.log('🔍 Data received:', data);
  console.log('🔍 Data sections:', data?.sections);
  if (data?.sections) {
    console.log('🔍 All section titles:', data.sections.map(s => s.title));
    console.log('🔍 Section details:', data.sections.map(s => ({ title: s.title, items: s.items?.length || 0 })));
  }
  console.log('🔍 Traditional Panchangam section:', traditionalPanchangamSection);
  console.log('🔍 Traditional Panchangam items:', traditionalPanchangamSection?.items);
  console.log('🔍 Traditional Panchangam summary:', findItem(traditionalPanchangamSection, "సారాంశం"));
  console.log('🔍 Panchangam section (మూల పంచాంగం):', panchangamSection);
  console.log('🔍 Tithulu item:', findItem(panchangamSection, "తిథులు"));

  // Additional debugging for exact title matching
  if (data?.sections) {
    const exactMatch = data.sections.find(s => s.title === "సాంప్రదాయ పంచాంగం");
    const partialMatch = data.sections.find(s => s.title && s.title.includes("సాంప్రదాయ"));
    console.log('🔍 Exact title match:', exactMatch);
    console.log('🔍 Partial title match:', partialMatch);
  }

  // Get sunrise/sunset and moonrise/moonset
  const sunriseItem = findItem(sunMoonSection, "సూర్యోదయం");
  const sunsetItem = findItem(sunMoonSection, "సూర్యాస్తమయం");
  const moonriseItem = findItem(sunMoonSection, "చంద్రోదయం");
  const moonsetItem = findItem(sunMoonSection, "చంద్రాస్తమయం");

  // Get panchangam events
  const tithiItem = findItem(panchangamSection, "తిథులు");
  const nakshatramItem = findItem(panchangamSection, "నక్షత్రాలు");
  const karanamItem = findItem(panchangamSection, "కరణాలు");
  const yogamItem = findItem(panchangamSection, "యోగాలు");

  const currentTithi = tithiItem?.type === "event_list" ? getCurrentEvent(tithiItem.events) : null;
  const currentNakshatram = nakshatramItem?.type === "event_list" ? getCurrentEvent(nakshatramItem.events) : null;
  const currentKaranam = karanamItem?.type === "event_list" ? getCurrentEvent(karanamItem.events) : null;
  const currentYogam = yogamItem?.type === "event_list" ? getCurrentEvent(yogamItem.events) : null;

  // Prepare events for TimeIndicator (combine auspicious and inauspicious)
  const dateStr = data.date || (date ? (typeof date === 'string' ? date : date.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]);
  const allEvents = [
    ...(auspiciousSection?.items || []).map(item => ({
      ...item,
      type: detectEventType(item.label),
      isInauspicious: false
    })),
    ...(inauspiciousSection?.items || []).map(item => ({
      ...item,
      type: detectEventType(item.label),
      isInauspicious: true
    }))
  ];
  const summary = findItem(traditionalPanchangamSection, "సారాంశం").value
  const summary_array = summary.split(';')
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Section - Date and General Information */}
      <div className="glass rounded-2xl p-6 shadow-soft border border-white/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-200/30 to-red-200/30 rounded-full -mr-20 -mt-20 blur-2xl"></div>

        <div className="relative z-10">
          {/* Navigation arrows */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onPrevDate}
              className="p-2 rounded-lg hover:bg-pink-50 transition-colors text-pink-600"
              aria-label="Previous day"
            >
              <FaChevronLeft size={16} />
            </button>

            <div className="text-center flex-1">
              <h2 className="text-lg font-bold text-pink-700 mb-1">
                {teluguMonth} - {teluguDay}
              </h2>
              <div className="text-2xl font-bold text-red-600 mt-2">
                {dateObj.getDate()}-{String(dateObj.getMonth() + 1).padStart(2, '0')}-{dateObj.getFullYear()}
              </div>
            </div>

            <button
              onClick={onNextDate}
              className="p-2 rounded-lg hover:bg-pink-50 transition-colors text-pink-600"
              aria-label="Next day"
            >
              <FaChevronRight size={16} />
            </button>
          </div>

          {/* Hindu Calendar Details */}
          <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
            {traditionalPanchangamSection && (
              <>
                {findItem(traditionalPanchangamSection, "సారాంశం") && (
                  <div className="text-sm">

                                        <div className="text-red-600 font-bold text-xl text-center mb-6 "> {summary_array[0]} </div>
<div>{summary_array[1]}, {summary_array[2]}, {summary_array[3]},

            {lunarMonthSection && (
              <>
                {findItem(lunarMonthSection, "పక్షం") && (

                    <span className="text-red-600  text-center font-bold">
                      {findItem(lunarMonthSection, "పక్షం").value}
                    </span>

                )}
              </>
            )}

            {/* Tithulu (తిథులు) from Basic Panchangam */}
            {panchangamSection && findItem(panchangamSection, "తిథులు") && (
              <div className="mt-4">
                <div className="text-sm  text-red-700 mb-2 font-bold">తిథులు</div>
                <div className="space-y-2">
                  {findItem(panchangamSection, "తిథులు").events?.map((event, index) => (
                    <div key={index} className="bg-white/50 rounded-lg p-3 border border-indigo-100">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-600 font-medium">{event.name}</span>

                        </div>
                        <div className="text-xs text-gray-600">
                          {event.start}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

</div>
                  </div>
                )}
              </>
            )}


          </div>

          {/* WhatsApp share button */}
          <div className="mt-4 flex justify-end">
            <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
              <FaWhatsapp size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Day Progress Bar and Countdown Timer - Side by Side */}
      <div className="glass rounded-xl p-4 shadow-soft border border-white/50 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex-1 flex justify-center">
            <DayProgressBar targetDate={dateStr} />
          </div>
          <div className="flex-1">
            <CountdownTimer targetDate={dateStr} />
          </div>
        </div>
      </div>

      {/* Time Indicator - Active/Upcoming Events */}
      <TimeIndicator events={allEvents} dateStr={dateStr} />



      {/* Sunrise/Sunset Section */}
      <div className="glass rounded-2xl p-5 shadow-soft border border-white/50">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-indigo-600 mb-3">సూర్య చంద్రోదయాలు</h3>
        </div>

        {/* Sun Times */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
              <FaSun className="text-white" size={20} />
            </div>
            <div>
              <div className="text-xs text-indigo-500 font-medium">సూర్యోదయం</div>
              <div className="text-lg font-bold text-indigo-700">{sunriseItem?.value || "-"}</div>
            </div>
          </div>

          <div className="flex-1 mx-4 h-px bg-gradient-to-r from-yellow-200 via-orange-200 to-blue-200"></div>

          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-indigo-500 font-medium text-right">సూర్యాస్తమయం</div>
              <div className="text-lg font-bold text-indigo-700 text-right">{sunsetItem?.value || "-"}</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
              <FaSun className="text-white" size={20} />
            </div>
          </div>
        </div>

        {/* Moon Times */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl">
              <FaMoon className="text-white" size={20} />
            </div>
            <div>
              <div className="text-xs text-indigo-500 font-medium">చంద్రోదయం</div>
              <div className="text-lg font-bold text-indigo-700">{moonriseItem?.value || "-"}</div>
            </div>
          </div>

          <div className="flex-1 mx-4 h-px bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200"></div>

          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-indigo-500 font-medium text-right">చంద్రాస్తమయం</div>
              <div className="text-lg font-bold text-indigo-700 text-right">{moonsetItem?.value || "-"}</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl">
              <FaMoon className="text-white" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Astrological Details - Tithi, Nakshatram, Yogam, Karanam */}
      <div className="grid grid-cols-2 gap-3">
        <AstroCard
          title="తిథి"
          value={currentTithi?.name || "-"}
          time={currentTithi ? formatEventTime(currentTithi) : ""}
          gradient="from-purple-400 to-pink-500"
        />
        <AstroCard
          title="నక్షత్రం"
          value={currentNakshatram?.name || "-"}
          time={currentNakshatram ? formatEventTime(currentNakshatram) : ""}
          gradient="from-indigo-400 to-purple-500"
        />
        <AstroCard
          title="యోగం"
          value={currentYogam?.name || "-"}
          time={currentYogam ? formatEventTime(currentYogam) : ""}
          gradient="from-green-400 to-teal-500"
        />
        <AstroCard
          title="కరణం"
          value={currentKaranam?.name || "-"}
          time={currentKaranam ? formatEventTime(currentKaranam) : ""}
          gradient="from-orange-400 to-red-500"
        />
      </div>

      {/* Auspicious Times Section */}
      {auspiciousSection && auspiciousSection.items && auspiciousSection.items.length > 0 && (
        <div className="glass rounded-2xl p-5 shadow-soft border border-white/50">
          <h3 className="text-lg font-bold text-pink-700 mb-4">శుభ సమయములు</h3>
          <div className="space-y-3">
            {/* Show first 3 items */}
            {auspiciousSection.items.slice(0, 3).map((item, idx) => (
              <TimeItem
                key={idx}
                label={item.label}
                value={item.value}
                isInauspicious={false}
              />
            ))}

            {/* Show remaining items if "View More" is clicked */}
            {showAllAuspicious && auspiciousSection.items.length > 3 && (
              <div className="space-y-3 mt-3 overflow-hidden animate-expand-down">
                {auspiciousSection.items.slice(3).map((item, idx) => (
                  <div
                    key={idx + 3}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <TimeItem
                      label={item.label}
                      value={item.value}
                      isInauspicious={false}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* View More / View Less Button */}
            {auspiciousSection.items.length > 3 && (
              <button
                onClick={() => setShowAllAuspicious(!showAllAuspicious)}
                className="w-full mt-3 py-2 px-4 rounded-lg bg-gradient-to-r from-pink-50 to-orange-50 hover:from-pink-100 hover:to-orange-100 border border-pink-200/50 text-pink-700 font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 hover:shadow-md"
              >
                <span className={`transition-transform duration-300 ${showAllAuspicious ? 'rotate-180' : 'rotate-0'}`}>
                  {showAllAuspicious ? (
                    <FaChevronUp size={14} />
                  ) : (
                    <FaChevronDown size={14} />
                  )}
                </span>
                <span className="transition-opacity duration-300">{showAllAuspicious ? 'కొన్ని మాత్రమే చూపండి' : 'మరిన్ని చూడండి'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inauspicious Times Section */}
      {inauspiciousSection && inauspiciousSection.items && inauspiciousSection.items.length > 0 && (
        <div className="glass rounded-2xl p-5 shadow-soft border border-white/50">
          <h3 className="text-lg font-bold text-red-700 mb-4">అశుభ సమయాలు</h3>
          <div className="space-y-3">
            {inauspiciousSection.items.map((item, idx) => (
              <TimeItem
                key={idx}
                label={item.label}
                value={item.value}
                isInauspicious={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Festivals Section */}
      {(data.festivals && data.festivals.length > 0) || (festivalsSection && festivalsSection.items && festivalsSection.items.length > 0) ? (
        <div className="glass rounded-2xl p-5 shadow-soft border border-white/50">
          <h3 className="text-lg font-bold text-pink-700 mb-4">పండుగలు మరియు శుభ సమయములు</h3>
          <div className="space-y-2">
            {data.festivals && data.festivals.length > 0 ? (
              data.festivals
                .filter(festival => {
                  // Filter only Major and Moderate importance festivals
                  if (typeof festival === 'string') return true; // Keep strings as they might be from sections
                  const importance = festival.importance;
                  return importance === 'Major' || importance === 'Moderate';
                })
                .map((festival, idx) => {
                  // Handle both object and string formats
                  const festivalName = typeof festival === 'string'
                    ? festival
                    : festival.festival_name || festival.name || 'Festival';
                  const festivalDescription = typeof festival === 'object'
                    ? (festival.description || festival.content)
                    : null;

                  return (
                    <div
                      key={festival.id || idx}
                      className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-200/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-indigo-800">{festivalName}</p>
                          {festivalDescription && (
                            <p className="text-sm text-indigo-600 mt-1">{festivalDescription}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : festivalsSection.items[0]?.value && festivalsSection.items[0].value !== "ఈ రోజు ముఖ్యమైన పండుగలు లేవు" ? (
              <div className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-200/50">
                <p className="font-semibold text-indigo-800">{festivalsSection.items[0].value}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-indigo-400">ఈ రోజు ముఖ్యమైన పండుగలు లేవు</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AstroCard({ title, value, time, gradient }) {
  return (
    <div className="glass rounded-xl p-4 shadow-soft border border-white/50 overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
      <div className="relative z-10">
        <div className="text-xs font-bold text-pink-600 mb-2">{title}</div>
        <div className="text-sm font-bold text-indigo-700 mb-1">{value}</div>
        {time && (
          <div className="text-xs text-indigo-500 mt-1">
            {time}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeItem({ label, value, isInauspicious }) {
  return (
    <div className={`p-3 rounded-lg border ${
      isInauspicious
        ? "bg-red-50 border-red-200/50"
        : "bg-green-50 border-green-200/50"
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-indigo-700">{label}</span>
        <span className={`text-sm font-semibold ${
          isInauspicious ? "text-red-600" : "text-green-600"
        }`}>
          {value}
        </span>
      </div>
    </div>
  );
}
