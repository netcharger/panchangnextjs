"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaSun, FaMoon, FaChevronLeft, FaChevronRight, FaWhatsapp, FaChevronDown, FaChevronUp, FaInfoCircle } from "react-icons/fa";
import html2canvas from "html2canvas";
import TimeIndicator from "./TimeIndicator";
import CountdownTimer from "./CountdownTimer";
import DayProgressBar from "./DayProgressBar";
import { getFixedTimingsForDay } from "../lib/inauspiciousTimings.js";
import { sendToNative } from "../lib/webviewBridge.js";
import DailyPanchangamShare from "./DailyPanchangamShare";
import MoonPhase from "./MoonPhase";
import EventProgress from "./EventProgress";
import AshtaSiddhantaWidget from "./AshtaSiddhantaWidget";
import { gowriData } from "../data/gauriPanchangamData";
import { gowriValuesInfo } from "../data/gauriPanchangInfo";

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

// Helper to convert time to Telugu format with shorthands
const toTeluguTime = (timeStr) => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeStr;
  
  let [_, hourStr, min, period] = match;
  let hour = parseInt(hourStr);
  const isPM = period.toUpperCase() === 'PM';
  
  // 24-hour conversion for logic
  let hour24 = hour;
  if (isPM && hour !== 12) hour24 += 12;
  if (!isPM && hour === 12) hour24 = 0;
  
  // Determine prefix based on time of day
  // 04:00 to 11:59 -> ఉ (Udayam)
  // 12:00 to 15:59 -> మ (Madhyahnam)
  // 16:00 to 18:59 -> సా (Sayam)
  // 19:00 to 03:59 -> రా (Ratri)
  let prefix = "రా"; 
  if (hour24 >= 4 && hour24 < 12) prefix = "ఉ";
  else if (hour24 >= 12 && hour24 < 16) prefix = "మ";
  else if (hour24 >= 16 && hour24 < 19) prefix = "సా";
  
  return `${prefix} ${hourStr}:${min}`;
};

// Helper function to format time from event
const formatEventTime = (event) => {
  if (!event) return "";
  const endTime = event.end || "";

  // Extract time from "Dec 25 12:00 AM" format
  const endMatch = endTime.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);

  if (endMatch) {
    return `${toTeluguTime(endMatch[1])} వరకు`;
  }
  return endTime;
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
  if (labelLower.includes('గులిక') || labelLower.includes('గుళిక') || labelLower.includes('gulika')) return 'gulika';
  if (labelLower.includes('దుర్ముహూర్త') || labelLower.includes('durmuhurtham')) return 'durmuhurtham';
  if (labelLower.includes('వర్జ్య') || labelLower.includes('vargyam')) return 'vargyam';
  if (labelLower.includes('అభిజిత్') || labelLower.includes('abhijit')) return 'abhijit';
  if (labelLower.includes('అమృత') || labelLower.includes('amrit')) return 'amrit';
  if (labelLower.includes('బ్రహ్మ') || labelLower.includes('brahma')) return 'brahma';
  if (labelLower.includes('విజయ') || labelLower.includes('vijaya')) return 'vijaya';
  if (labelLower.includes('గోదూలి') || labelLower.includes('godhuli')) return 'godhuli';
  if (labelLower.includes('ప్రాత') || labelLower.includes('సంధ్య') || labelLower.includes('prata')) return 'sandhya';
  if (labelLower.includes('నిశీత') || labelLower.includes('nishita')) return 'nishita';
  if (labelLower.includes('ముహూర్త') || labelLower.includes('muhurtham')) return 'muhurtham';
  return 'muhurtham'; // Default to good muhurtham
};


export default function DailyPanchangam({ data, date, onPrevDate, onNextDate }) {
  const [showAllAuspicious, setShowAllAuspicious] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTimingInfo, setSelectedTimingInfo] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [currentGowriStatus, setCurrentGowriStatus] = useState(null);
  const contentRef = useRef(null);
  const shareRef = useRef(null); // Ref for the hidden share card

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return; // Use shareRef instead
    
    try {
      setIsSharing(true);
      
      // Small delay to ensure any UI updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(shareRef.current, { // Capture shareRef
        scale: 3, // Higher quality (3x resolution)
        useCORS: true, // Handle cross-origin images
        logging: false,
        backgroundColor: '#ffffff', // White background for share card
        // windowWidth removed to allow full responsive width capture
      });

      const base64Image = canvas.toDataURL('image/png');
      
      // Remove data:image/png;base64, prefix
      const base64Data = base64Image.split(',')[1];

      sendToNative({ 
        type: 'SHARE_IMAGE', 
        payload: { base64: base64Data } 
      });

    } catch (error) {
      console.error('Error generating screenshot:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Calculate Gauri Panchangam Status
  useEffect(() => {
    if (!mounted) return;
    
    const checkGowriStatus = () => {
       const now = new Date();
       const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
       const dayKey = days[now.getDay()];
       const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
       
       const slot = gowriData.find(s => {
          if (s.end === "00:00") return timeStr >= s.start;
          if (s.start === "00:00") return timeStr >= s.start && timeStr < s.end;
          return timeStr >= s.start && timeStr < s.end;
       });

       if (slot) {
           const status = slot[dayKey];
           const info = gowriValuesInfo[status];
           setCurrentGowriStatus({ name: status, ...info });
       }
    };

    checkGowriStatus();
    const timer = setInterval(checkGowriStatus, 60000);
    return () => clearInterval(timer);
  }, [mounted]);

  // Timing information mapping (Auspicious, Inauspicious and general)
  const timingDetailMapping = {
    rahu: {
      title: "రాహుకాలం",
      effects: "ఆటంకాలు, ఆకస్మిక నష్టాలు సంభవించే అవకాశం ఉంటుంది. ఇది ఏ పనికైనా అశుభమైన కాలంగా పరిగణించబడుతుంది.",
      advice: "కొత్త ప్రయాణాలు, ముఖ్యమైన ఒప్పందాలు, మరియు కొత్త పనుల ప్రారంభం నివారించాలి.",
      type: "bad"
    },
    yama: {
      title: "యమగండం",
      effects: "పనులలో అపజయం లేదా పనుల నాణ్యత దెబ్బతినే అవకాశం ఉంటుంది. కార్యక్షుద్రతకు ఇది హానికరం.",
      advice: "శుభకార్యాలు, శుభప్రయాణాలు, మరియు సాహస కృత్యాలను నివారించాలి.",
      type: "bad"
    },
    gulika: {
      title: "గులిక కాలం",
      effects: "ఈ సమయంలో చేసే పనులు చాలా కాలం నిలిచిపోయే లేదా పునరావృతం అయ్యే అవకాశం ఉంటుంది. దీనిని శని పుత్రుడిగా కూడా పేర్కొంటారు.",
      advice: "అప్పులు ఇవ్వడం, అంత్యక్రియలు, మరియు ముఖ్యమైన శుభకార్యాల ప్రారంభం నివారించడం మంచిది.",
      type: "bad"
    },
    durmuhurtham: {
      title: "దుర్ముహూర్తం",
      effects: "అపశకునాలు మరియు అడ్డంకులు కలిగే అవకాశం ఉండే సమయం.",
      advice: "ముఖ్యమైన శుభకార్యాలు, ప్రయాణాలు నివారించాలి.",
      type: "bad"
    },
    vargyam: {
      title: "వర్జ్యం",
      effects: "ఈ సమయంలో చేసే పనులు విఫలమయ్యే అవకాశం ఉంటుంది. ఇది అశుభప్రదమైన కాలంగా భావిస్తారు.",
      advice: "ముఖ్యమైన పనులు, ప్రయాణాలు మరియు శుభకార్యాలు నివారించడం శ్రేయస్కరం.",
      type: "bad"
    },
    abhijit: {
      title: "అభిజిత్ ముహూర్తం",
      effects: "మధ్యాహ్నం సమయంలో వచ్చే అత్యంత శుభప్రదమైన ముహూర్తం. ఏక కాలంలో రాహువు దోషాలను తొలగించగల శక్తి దీనికి ఉంది.",
      advice: "అన్ని రకాల శుభకార్యాలకు, ముఖ్యంగా కొత్త పనులు మరియు వ్యాపార ప్రారంభాలకు ఇది శ్రేష్టం.",
      type: "good"
    },
    amrit: {
      title: "అమృత కాలం",
      effects: "అమృతం వలె ఫలనిచ్చే అత్యంత పవిత్రమైన సమయం. దేవతలు ఈ సమయంలో అనుగ్రహం చూపిస్తారని ప్రసిద్ది.",
      advice: "జపాలు, హోమాలు, ముఖ్యమైన చర్చలు మరియు పుణ్య కార్యక్రమాలకు అత్యంత అనుకూలం.",
      type: "good"
    },
    brahma: {
      title: "బ్రహ్మ ముహూర్తం",
      effects: "సూర్యోదయానికి ముందు వచ్చే అత్యంత పవిత్ర సమయం. ఈ సమయంలో మెదడు చురుకుగా ఉండి పాజిటివ్ ఎనర్జీ ఎక్కువగా ఉంటుంది.",
      advice: "యోగా, ధ్యానం, విద్యాభ్యాసం మరియు దైవ చింతనకు ఇది ఉత్తమ సమయం.",
      type: "good"
    },
    vijaya: {
      title: "విజయ ముహూర్తం",
      effects: "పనులలో విజయసాధనకు అనువైన సమయం. ఏ కార్యమైనా ఈ సమయంలో మొదలుపెడితే విజయం సిద్ధిస్తుందని పురాణాల కథనం.",
      advice: "పెద్ద ఒప్పందాలు, కొత్త సవాళ్ళు మరియు ముఖ్యమైన పనుల విజయానికి అనుకూలం.",
      type: "good"
    },
    godhuli: {
      title: "గోదూలి ముహూర్తం",
      effects: "సూర్యాస్తమయ సమయంలో శాంతి మరియు మంగళకరమైన వాతావరణం ఉంటుంది.",
      advice: "వివాహాలు, ప్రయాణాలు మరియు గృహ ప్రవేశాలకు ఈ ముహూర్తం చాలా ప్రశస్తమైనది.",
      type: "good"
    },
    sandhya: {
      title: "సంధ్యా కాలం",
      effects: "పగలు మరియు రాత్రి కలిసే పవిత్ర సమయం (ప్రాతః సాంధ్య / సాయంసాంధ్య).",
      advice: "సూర్య నమస్కారాలు, గాయత్రీ మంత్రం, మరియు దీపారాధన వంటి ఆధ్యాత్మిక కార్యాలకు శ్రేష్టం.",
      type: "neutral"
    },
    nishita: {
      title: "నిశీత ముహూర్తం",
      effects: "అర్ధరాత్రి సమయంలో వచ్చే అత్యంత శక్తివంతమైన సమయం. శివ పూజకు మరియు తపస్సులకు ఇది ప్రత్యేకమైనది.",
      advice: "శివరాత్రి పూజలు, ధ్యానం మరియు ఆధ్యాత్మిక సాధనకు ప్రాధాన్యత ఇవ్వండి.",
      type: "neutral"
    }
  };

  const handleInfoClick = (label) => {
    const type = detectEventType(label);
    if (timingDetailMapping[type]) {
      setSelectedTimingInfo(timingDetailMapping[type]);
    }
  };

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
  // Collect inauspicious timings by scanning all items across all sections
  // This is more robust than matching section titles
  const mergedInauspiciousItems = [];
  data.sections?.forEach(section => {
    section.items?.forEach(item => {
      const type = detectEventType(item.label);
      if (['rahu', 'yama', 'gulika', 'durmuhurtham', 'vargyam'].includes(type)) {
        console.log(`🔎 Found potential inauspicious item: ${item.label} = ${item.value} (Type: ${type})`);
        
        const val = String(item.value || "").trim();
        const isPlaceholder = !val || val.toLowerCase() === "none" || val.toLowerCase() === "n/a";
        
        const existingIdx = mergedInauspiciousItems.findIndex(existing => existing.label === item.label);
        
        if (existingIdx === -1) {
          if (!isPlaceholder) {
            console.log(`✅ Adding ${item.label} to merged list`);
            mergedInauspiciousItems.push(item);
          } else {
            console.log(`⚠️ Skipping placeholder for ${item.label}`);
          }
        } else if (!isPlaceholder) {
          console.log(`♻️ Overwriting ${item.label} placeholder with real value: ${val}`);
          mergedInauspiciousItems[existingIdx] = item;
        }
      }
    });
  });
  
  console.log('📦 Merged Inauspicious Items Total:', mergedInauspiciousItems.length);

  const inauspiciousSection = {
    title: "అశుభ సమయాలు",
    items: mergedInauspiciousItems
  };

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

  // Get fixed inauspicious timings for the day
  const fixedTimings = getFixedTimingsForDay(dayName);

  // Helper to get fixed value for a label
  const getFixedValue = (label, originalValue) => {
    if (!fixedTimings) return originalValue;
    const labelLower = label.toLowerCase();
    if (labelLower.includes('రాహు') || labelLower.includes('rahu')) return fixedTimings.rahu;
    if (labelLower.includes('యమ') || labelLower.includes('yama')) return fixedTimings.yama;
    if (labelLower.includes('గులిక') || labelLower.includes('gulika')) return fixedTimings.gulika;
    return originalValue;
  };

  // Prepare events for TimeIndicator (combine auspicious and inauspicious)
  const dateStr = data.date || (date ? (typeof date === 'string' ? date : date.toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]);
  const isToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) === dateStr;

  const allEvents = [
    ...(auspiciousSection?.items || []).map(item => ({
      ...item,
      type: detectEventType(item.label),
      isInauspicious: false
    })),
    ...(inauspiciousSection?.items || []).map(item => ({
      ...item,
      value: getFixedValue(item.label, item.value),
      type: detectEventType(item.label),
      isInauspicious: true
    }))
  ];
  const summary = findItem(traditionalPanchangamSection, "సారాంశం").value
  const summary_array = summary.split(';');

  // Determine dynamic year name based on Ugadi dates
  const yearName = (() => {
    const ugadiDates = [
      { start: "2025-03-30", end: "2026-03-18", name: "శ్రీ విశ్వావసు నామ సంవత్సరం" },
      { start: "2026-03-19", end: "2027-04-06", name: "శ్రీ పరాభవ నామ సంవత్సరం" },
      { start: "2027-04-07", end: "2028-03-26", name: "శ్రీ ప్లవంగ నామ సంవత్సరం" },
      { start: "2028-03-27", end: "2029-03-16", name: "శ్రీ కీలక నామ సంవత్సరం" } 
    ];
    // Date comparison using ISO string part YYYY-MM-DD
    const currentDateStr = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD local time
    const yearInfo = ugadiDates.find(y => currentDateStr >= y.start && currentDateStr <= y.end);
    return yearInfo ? yearInfo.name : summary_array[0];
  })();
  return (
    <div ref={contentRef} className="space-y-4 animate-fade-in p-1">
      {/* Top Section - Date and Navigation */}
      <div className="glass rounded-3xl p-6 shadow-xl border border-white/60 relative overflow-hidden bg-gradient-to-b from-white to-orange-50/50">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full -mr-20 -mt-20 blur-3xl rounded-bl-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-400/20 to-orange-300/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>

        <div className="relative z-10">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onPrevDate}
              className="p-3 rounded-full bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-all text-orange-600 border border-orange-100"
              aria-label="Previous day"
            >
              <FaChevronLeft size={14} />
            </button>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 tracking-wide mb-1">
                {teluguMonth} - {teluguDay}
              </h2>
              <div className="inline-block bg-gradient-to-r from-orange-500 to-pink-600 text-transparent bg-clip-text text-3xl font-black">
                {dateObj.getDate().toString().padStart(2, '0')}-{String(dateObj.getMonth() + 1).padStart(2, '0')}-{dateObj.getFullYear()}
              </div>
            </div>

            <button
              onClick={onNextDate}
              className="p-3 rounded-full bg-white shadow-sm hover:shadow-md hover:bg-orange-50 transition-all text-orange-600 border border-orange-100"
              aria-label="Next day"
            >
              <FaChevronRight size={14} />
            </button>
          </div>

          {/* Daily Summary Card */}
          {traditionalPanchangamSection && findItem(traditionalPanchangamSection, "సారాంశం") && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-orange-100/50 text-center mb-6">
              <div className="text-orange-700 font-bold text-lg mb-2 tracking-wide font-telugu">
                {yearName}
              </div>
              <div className="text-gray-600 text-sm leading-relaxed font-medium">
                {summary_array.slice(1).join(" • ")}
              </div>
              
              {lunarMonthSection && findItem(lunarMonthSection, "పక్షం") && (
                <div className="mt-3 inline-flex items-center justify-center px-4 py-1.5 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-200">
                  {findItem(lunarMonthSection, "పక్షం").value}
                </div>
              )}
            </div>
          )}

          {/* Sunrise / Sunset / Moonrise / Moonset Compact Row */}
          <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-100/50">
             {/* Sunrise */}
             <div className="flex items-center gap-3">
                <img src="/icons/sunrise.svg" alt="Sunrise" className="w-10 h-10 object-contain drop-shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-xs text-orange-900/60 font-bold uppercase tracking-wide">సూర్యోదయం</span>
                  <span className="text-gray-800 font-bold text-sm">{sunriseItem?.value || "-"}</span>
                </div>
             </div>

             {/* Sunset */}
             <div className="flex items-center gap-3 justify-end">
                <div className="flex flex-col text-right">
                  <span className="text-xs text-orange-900/60 font-bold uppercase tracking-wide">సూర్యాస్తమయం</span>
                  <span className="text-gray-800 font-bold text-sm">{sunsetItem?.value || "-"}</span>
                </div>
                <img src="/icons/sunset.svg" alt="Sunset" className="w-10 h-10 object-contain drop-shadow-sm" />
             </div>

             {/* Moonrise */}
             <div className="flex items-center gap-3 pt-2 border-t border-orange-200/50">
                <img src="/icons/moonrise.svg" alt="Moonrise" className="w-10 h-10 object-contain drop-shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-xs text-indigo-900/60 font-bold uppercase tracking-wide">చంద్రోదయం</span>
                  <span className="text-gray-800 font-bold text-sm">{moonriseItem?.value || "-"}</span>
                </div>
             </div>

             {/* Moonset */}
             <div className="flex items-center gap-3 justify-end pt-2 border-t border-orange-200/50">
                <div className="flex flex-col text-right">
                  <span className="text-xs text-indigo-900/60 font-bold uppercase tracking-wide">చంద్రాస్తమయం</span>
                  <span className="text-gray-800 font-bold text-sm">{moonsetItem?.value || "-"}</span>
                </div>
                <img src="/icons/moonset.svg" alt="Moonset" className="w-10 h-10 object-contain drop-shadow-sm" />
             </div>
          </div>
        </div>
      </div>

      {/* Status Highlights - Only for Today */}
      {isToday && (
        <div className="space-y-4 mt-4">
          {/* Gauri Panchangam Status */}
          {currentGowriStatus && (
            <Link href="/gauri-panchangam">
              <div className="glass rounded-2xl p-6 shadow-soft border border-white/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={"/images/gowri-devi.png"} alt="Gauri Panchangam" className="w-16 h-16 object-cover rounded-full shadow-md border-2 border-white" />
                    <div>
                      <h3 className="text-lg font-bold text-orange-900 mb-1">గౌరీ పంచాంగం ప్రకారం</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-orange-700/80"> ఇప్పుడు నడుస్తున్న కాలం</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-white flex items-center gap-2"
                              style={{ 
                                  color: currentGowriStatus.color || '#ea580c',
                                  borderColor: currentGowriStatus.color || '#ea580c'
                              }}>
                          {currentGowriStatus.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Ashta Siddhanta Status */}
         <div className="mb-4"         >
          <AshtaSiddhantaWidget /></div>
        </div>
      )}

      {/* Day Progress Bar and Countdown Timer - Side by Side */}
      {isToday && (
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
      )}

      {/* Time Indicator - Active/Upcoming Events */}
      {isToday && <TimeIndicator events={allEvents} dateStr={dateStr} />}

      {/* Astro Grid - Key Panchangam Details */}
      <h3 className="text-lg font-bold text-gray-800 ml-2 mt-6 mb-3 flex items-center gap-2">
        <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
        పంచాంగ వివరాలు
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {(() => {
          const currentPaksham = lunarMonthSection ? findItem(lunarMonthSection, "పక్షం")?.value : "";
          return (
            <AstroCardImproved 
              icon={<div className="transform scale-125"><MoonPhase tithiName={currentTithi?.name} paksham={currentPaksham} size={40} /></div>} 
              title="తిథి" 
              value={currentTithi?.name} 
              time={currentTithi ? formatEventTime(currentTithi) : ""} 
              color="indigo" 
            />
          );
        })()}
        <AstroCardImproved icon="⭐" title="నక్షత్రం" value={currentNakshatram?.name} time={currentNakshatram ? formatEventTime(currentNakshatram) : ""} color="purple" />
        <AstroCardImproved icon="🧘" title="యోగం" value={currentYogam?.name} time={currentYogam ? formatEventTime(currentYogam) : ""} color="teal" />
        <AstroCardImproved icon="🐾" title="కరణం" value={currentKaranam?.name} time={currentKaranam ? formatEventTime(currentKaranam) : ""} color="rose" />
      </div>

      {/* Auspicious Times */}
      {/* Auspicious Times Section with View More */}
      {auspiciousSection && auspiciousSection.items && auspiciousSection.items.length > 0 && (
        <div className="glass rounded-2xl p-5 shadow-soft border border-white/50 mt-6">
          <h3 className="text-lg font-bold text-pink-700 mb-4">శుభ సమయములు</h3>
          <div className="space-y-3">
            {/* Show first 3 items */}
            {auspiciousSection.items.slice(0, 3).map((item, idx) => (
              <TimeItem
                key={idx}
                label={item.label}
                value={item.value}
                isInauspicious={false}
                onInfoClick={() => handleInfoClick(item.label)}
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
                      onInfoClick={() => handleInfoClick(item.label)}
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

 
      {/* Share Button (Sticky Bottom) */}
      <div className="fixed bottom-28 left-0 right-0 z-40 flex justify-center pointer-events-none fade-in-up">
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className={`pointer-events-auto flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-lg shadow-orange-900/20 hover:scale-105 active:scale-95 transition-all font-bold text-sm border border-orange-400/50 ${isSharing ? 'opacity-75 cursor-wait' : ''}`}
        >
          <FaWhatsapp size={18} className="animate-pulse" />
          <span>Share Panchangam</span>
        </button>
      </div>

      {/* Active Inauspicious Events Progress */}
      {(() => {
         // Filter for active inauspicious events
         // We need a way to check if an event is active without duplicating logic too much.
         // Ideally EventProgress checks itself, but we need to know IF there are any to render the container.
         // For now, let's just render the container and let EventProgress handle its own visibility? 
         // No, better to filter here so we don't render empty containers.
         // Actually, let's just pass all inauspicious events to a container and map them.
         // The issue is we don't have the parsing logic exposed here easily without duplicating.
         // Let's assume we want to show ALL inauspicious items found in `inauspiciousSection`.
         // We can map them all and let EventProgress decide if it should render (it returns null if not active).
         // However, this might clutter if we have many.
         // Let's try to map them.
      })()}
      
      {inauspiciousSection && inauspiciousSection.items && inauspiciousSection.items.length > 0 && isToday && (
         <div className="flex flex-wrap justify-center gap-4 mb-4">
            {inauspiciousSection.items.map((item, idx) => {
               const value = getFixedValue(item.label, item.value);
               const ranges = value.split('|');
               return ranges.map((range, rIdx) => (
                  <EventProgress 
                     key={`inauspicious-progress-${idx}-${rIdx}`} 
                     event={{...item, value: range.trim()}} 
                     dateStr={dateStr} 
                  />
               ));
            })}
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
                value={getFixedValue(item.label, item.value)}
                isInauspicious={true}
                onInfoClick={() => handleInfoClick(item.label)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timing Info Modal */}
      {selectedTimingInfo && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedTimingInfo(null)}
        >
          <div 
            className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className={`absolute top-0 left-0 right-0 h-2 ${selectedTimingInfo.type === 'bad' ? 'bg-red-500' : selectedTimingInfo.type === 'good' ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaInfoCircle className={selectedTimingInfo.type === 'bad' ? 'text-red-500' : selectedTimingInfo.type === 'good' ? 'text-green-500' : 'text-indigo-500'} size={24} />
                {selectedTimingInfo.title}
              </h3>
              <button 
                onClick={() => setSelectedTimingInfo(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm mb-8">
              <div>
                <h4 className={`font-bold text-base mb-2 ${selectedTimingInfo.type === 'bad' ? 'text-red-700' : selectedTimingInfo.type === 'good' ? 'text-green-700' : 'text-indigo-700'}`}>ప్రభావం:</h4>
                <p>{selectedTimingInfo.effects}</p>
              </div>
              
              <div className={`p-4 rounded-2xl border ${selectedTimingInfo.type === 'bad' ? 'bg-red-50 border-red-100' : selectedTimingInfo.type === 'good' ? 'bg-green-50 border-green-100' : 'bg-indigo-50 border-indigo-100'}`}>
                <h4 className={`font-bold text-base mb-2 ${selectedTimingInfo.type === 'bad' ? 'text-red-800' : selectedTimingInfo.type === 'good' ? 'text-green-800' : 'text-indigo-800'}`}>{selectedTimingInfo.type === 'bad' ? 'ఏమి నివారించాలి?' : 'ఎప్పుడు అనుకూలం?'}</h4>
                <p className={selectedTimingInfo.type === 'bad' ? 'text-red-900' : selectedTimingInfo.type === 'good' ? 'text-green-900' : 'text-indigo-900'}>{selectedTimingInfo.advice}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedTimingInfo(null)} 
              className={`w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all text-center ${selectedTimingInfo.type === 'bad' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : selectedTimingInfo.type === 'good' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
            >
              సరే, అర్థమైంది
            </button>
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

      {/* HIDDEN SHARE CARD - Rendered off-screen for screenshotting */}
      <div style={{ position: 'absolute', top: -9999, left: -9999, visibility: 'visible' }}> 
          <div ref={shareRef}>
             <DailyPanchangamShare data={data} date={dateStr} />
          </div>
      </div>
    </div>
  );
}

// --- Reduced & Improved Helper Components ---

const AstroCardImproved = ({ title, value, time, color, icon }) => {
  const colorMap = {
    indigo: "from-indigo-500 to-blue-600 shadow-indigo-200",
    purple: "from-purple-500 to-fuchsia-600 shadow-purple-200",
    teal: "from-teal-400 to-emerald-500 shadow-teal-200",
    rose: "from-rose-500 to-red-600 shadow-rose-200",
    orange: "from-orange-400 to-amber-500 shadow-orange-200"
  };

  const gradient = colorMap[color] || colorMap.indigo;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110`}></div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
      </div>
      
      <div className="font-bold text-gray-800 text-lg leading-tight mb-1">
        {value || "-"}
      </div>
      
      {time && (
        <div className="text-xs font-medium text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded-md border border-gray-200/50">
          {time}
        </div>
      )}
    </div>
  );
};

const CollapsibleSection = ({ title, children, isOpenDefault = false, color = "gray" }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  const titleColors = {
    green: "text-green-800",
    red: "text-red-800",
    gray: "text-gray-800"
  };
  
  const bgColors = {
      green: "bg-green-50 border-green-100",
      red: "bg-red-50 border-red-100",
      gray: "bg-gray-50 border-gray-200"
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${bgColors[color] || bgColors.gray}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-bold text-left"
      >
        <span className={`text-lg ${titleColors[color]}`}>{title}</span>
        <span className={`p-2 rounded-full bg-white/50 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
           <FaChevronDown size={12} />
        </span>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const TimeRow = ({ label, value, isGood, onClick }) => (
  <div onClick={onClick} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white active:scale-[99%] transition-all cursor-pointer">
    <div className="flex items-center gap-3">
       <div className={`w-1.5 h-8 rounded-full ${isGood ? 'bg-green-400' : 'bg-red-400'}`}></div>
       <span className="font-medium text-gray-700">{label}</span>
    </div>
    <span className="font-bold text-gray-900 text-sm">{value}</span>
  </div>
);

function AstroCard({ title, value, time, gradient, icon }) {
  return (
    <div className="glass rounded-xl p-4 shadow-soft border border-white/50 overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="text-xs font-bold text-pink-600">{title}</div>
          {icon && <div className="flex-shrink-0 ml-2">{icon}</div>}
        </div>
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

function TimeItem({ label, value, isInauspicious, onInfoClick }) {
  const showInfoIcon = ['rahu', 'yama', 'gulika', 'durmuhurtham', 'vargyam', 'abhijit', 'amrit', 'brahma', 'vijaya', 'godhuli', 'sandhya', 'nishita'].includes(detectEventType(label));

  // Format value to use Telugu shorthands
  const formattedValue = value ? value.replace(/(\d{1,2}:\d{2}\s*(?:AM|PM))/gi, (match) => toTeluguTime(match)) : value;

  return (
    <div className={`p-3 rounded-lg border ${
      isInauspicious
        ? "bg-red-50 border-red-200/50"
        : "bg-green-50 border-green-200/50"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-indigo-700">{label}</span>
          {showInfoIcon && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              className={`${isInauspicious ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'} transition-colors`}
            >
              <FaInfoCircle size={14} />
            </button>
          )}
        </div>
        <div className={`text-sm font-semibold text-right ${
          isInauspicious ? "text-red-600" : "text-green-600"
        }`}>
          {formattedValue.split('|').map((part, pIdx) => (
            <div key={pIdx}>{part.trim()}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
