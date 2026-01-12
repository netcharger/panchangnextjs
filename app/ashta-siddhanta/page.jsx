'use client';

import { useState, useEffect, useRef } from 'react';
import { getAshtaStatus, getAllAshtaSlots } from '../../lib/ashtaSiddhanta.js';
import ashtaData from '../../data/ashtaSiddhanta.json';
import ashtaMetadata from '../../data/ashtaMetadata.json';
import { FaMoon, FaSun, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import IntervalTimer from '../../components/IntervalTimer';

export default function AshtaSiddhantaPage() {
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const [isNightView, setIsNightView] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [selectedSlotInfo, setSelectedSlotInfo] = useState(null);
    const dayRefs = useRef({});
    const slotRefs = useRef({});

    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const teluguDays = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];

    useEffect(() => {
        const now = new Date();
        setActiveDayIndex(now.getDay());

        const updateTime = () => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            setCurrentTime(timeStr);
            
            const status = getAshtaStatus();
            setCurrentStatus(status);
            setIsNightView(status.isNight);
        };

        updateTime();
        const timer = setInterval(updateTime, 60000); 
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (dayRefs.current[activeDayIndex]) {
            dayRefs.current[activeDayIndex].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }, [activeDayIndex]);

    // Auto-scroll to current time slot
    useEffect(() => {
        const scrollToCurrentSlot = () => {
            const realTodayIndex = new Date().getDay();
            
            if (activeDayIndex === realTodayIndex && currentTime) {
                // Find the active slot ref
                const activeSlotKey = Object.keys(slotRefs.current).find(key => {
                    const slot = slotRefs.current[key];
                    if (slot && slot.dataset.isActive === 'true') {
                        return true;
                    }
                    return false;
                });
                
                if (activeSlotKey && slotRefs.current[activeSlotKey]) {
                    setTimeout(() => {
                        slotRefs.current[activeSlotKey].scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 500);
                }
            }
        };
        
        scrollToCurrentSlot();
    }, [activeDayIndex, currentTime, isNightView]);

    const getStatusType = (label) => {
        if (!label) return 'neutral';
        return ashtaData.labels[label]?.type || 'neutral';
    };

    const getStatusStyle = (label) => {
        const type = getStatusType(label);
        const styles = {
            good: 'bg-green-50 text-green-700 border-green-200 shadow-green-50',
            bad: 'bg-red-50 text-red-700 border-red-200 shadow-red-50',
            neutral: 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-50'
        };
        return styles[type] || styles.neutral;
    };

    const handleSlotClick = (label, slot, dayIdx) => {
        if (!label) return;
        setSelectedSlotInfo({
            label,
            start: formatTo12Hr(slot.start),
            end: formatTo12Hr(slot.end),
            day: teluguDays[dayIdx],
            type: getStatusType(label)
        });
        setShowInfo(true);
    };

    const formatTo12Hr = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const slots = getAllAshtaSlots(isNightView);

    return (
        <div className={`min-h-screen font-sans pb-10 bg-gradient-to-br transition-colors duration-500 ${isNightView ? 'from-indigo-100 via-slate-50 to-blue-200' : 'from-orange-100 via-white to-yellow-100'}`}>
            <div className="max-w-md mx-auto relative px-4">
                {/* Header */}
                <div className="pt-8 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <Link href="/">
                            <button className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white shadow-soft">
                                <FaArrowLeft size={16} />
                            </button>
                        </Link>
                        <button 
                            onClick={() => setShowInfo(true)}
                            className="p-2 rounded-full bg-white/80 text-indigo-600 hover:bg-white shadow-soft"
                        >
                            <FaInfoCircle size={20} />
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <img 
                            src="/images/ashta-siddantha.png" 
                            alt="Ashta Siddhanta" 
                            className=" shadow-md border-2 border-white mb-1" 
                        />
                        <h1 className="text-3xl font-bold text-indigo-900 text-center mb-1">అష్ట సిద్ధాంతం</h1>
                    </div>
                    <p className="text-center text-indigo-700/70 text-sm font-medium">భార్గవ సిద్ధాంతం ప్రకారం శుభాశుభ ఫలితాలు</p>
                </div>

                {/* Day/Night Toggle */}
                <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-2xl mb-6 shadow-soft border border-white">
                    <button 
                        onClick={() => setIsNightView(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${!isNightView ? 'bg-orange-500 text-white shadow-lg' : 'text-orange-900'}`}
                    >
                        <FaSun /> పగలు
                    </button>
                    <button 
                        onClick={() => setIsNightView(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isNightView ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-900'}`}
                    >
                        <FaMoon /> రాత్రి
                    </button>
                </div>

                {/* Day Selection Tabs */}
                <div className="sticky top-0 z-30 bg-white/30 backdrop-blur-md pt-2 pb-2 mb-4 -mx-4 px-4 border-b border-white/20">
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                        {teluguDays.map((label, idx) => (
                            <button
                                key={idx}
                                ref={(el) => (dayRefs.current[idx] = el)}
                                onClick={() => setActiveDayIndex(idx)}
                                className={`flex-shrink-0 px-6 py-2.5 rounded-2xl font-bold transition-all shadow-sm border ${
                                    activeDayIndex === idx 
                                    ? (isNightView ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-200' : 'bg-orange-600 text-white border-orange-700 shadow-orange-200') 
                                    : 'bg-white text-indigo-900 border-indigo-100 hover:bg-indigo-50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4 pt-2">
                    {slots.map((slot) => {
                        const label = ashtaData.table[slot.index][activeDayIndex];
                        const realTodayIndex = new Date().getDay();
                        const isToday = activeDayIndex === realTodayIndex;
                        const isActive = isToday && currentStatus && currentStatus.intervalIndex === slot.index && currentStatus.isNight === isNightView;
                        
                        return (
                            <div 
                                key={slot.index}
                                ref={(el) => {
                                    if (el) {
                                        slotRefs.current[`${activeDayIndex}-${slot.index}-${isNightView}`] = el;
                                        el.dataset.isActive = isActive ? 'true' : 'false';
                                    }
                                }}
                                onClick={() => handleSlotClick(label, slot, activeDayIndex)}
                                className={`group relative flex flex-col p-4 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                                    isActive 
                                    ? `scale-[1.03] shadow-xl ${isNightView ? 'shadow-indigo-100 border-indigo-500 ring-indigo-400/30 animate-pulse' : 'shadow-orange-100 border-orange-500 ring-orange-400/30 animate-pulse'} z-10 bg-white ring-4` 
                                    : 'bg-white/60 border-transparent shadow-soft hover:bg-white/90'
                                }`}
                            >
                                <div className="flex items-center w-full">
                                    <div className="flex-shrink-0 w-28 flex items-center gap-2">
                                        <span className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold ${isActive ? (isNightView ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600') : 'bg-gray-100 text-gray-500'}`}>
                                            {slot.category}
                                        </span>
                                        <div>
                                            <p className={`text-xs font-bold leading-none ${isActive ? (isNightView ? 'text-indigo-600' : 'text-orange-600') : 'text-gray-900'}`}>
                                                {formatTo12Hr(slot.start)} నుండి {formatTo12Hr(slot.end)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="h-10 w-px bg-gray-200 mx-3"></div>

                                    <div className="flex-grow flex items-center justify-between min-w-0">
                                        <div className={`px-4 py-2 rounded-xl text-sm font-bold border inline-flex items-center gap-2 transition-transform group-hover:translate-x-1 whitespace-nowrap overflow-hidden ${getStatusStyle(label)}`}>
                                            <span className="truncate">{label || "వివరం లేదు"}</span>
                                        </div>

                                        {isActive && (
                                            <div className="ml-2">
                                                <IntervalTimer 
                                                    progress={currentStatus.progressPercent} 
                                                    size={48} 
                                                    strokeWidth={4} 
                                                    primaryColor={isNightView ? "#4f46e5" : "#f97316"}
                                                    label="పూర్తి"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {isActive && (
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className={`w-4 h-4 ${isNightView ? 'bg-indigo-500' : 'bg-orange-500'} rounded-full animate-ping absolute opacity-75`}></div>
                                            <div className={`w-4 h-4 ${isNightView ? 'bg-indigo-500' : 'bg-orange-500'} rounded-full relative shadow-lg`}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in" onClick={() => { setShowInfo(false); setSelectedSlotInfo(null); }}>
                    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-indigo-600"></div>
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {selectedSlotInfo ? selectedSlotInfo.label : "అష్ట సిద్ధాంతం అంటే?"}
                            </h3>
                            <button onClick={() => { setShowInfo(false); setSelectedSlotInfo(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4 text-gray-700 leading-relaxed text-sm mb-8 overflow-y-auto max-h-[60vh] pr-2 sleek-scrollbar">
                            {selectedSlotInfo ? (
                                <div className="space-y-4">
                                    <p className="text-lg leading-relaxed">
                                        <span className="font-bold text-indigo-900">{selectedSlotInfo.day}</span> రోజున 
                                        <span className="font-bold text-indigo-900 mx-1">{selectedSlotInfo.start} నుండి {selectedSlotInfo.end}</span> వరకు 
                                        <span className={`px-2 py-0.5 rounded-lg font-bold mx-1 ${getStatusStyle(selectedSlotInfo.label)}`}>{selectedSlotInfo.label}</span> 
                                        ఉంది.
                                    </p>
                                    
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-sm italic text-slate-600">
                                            {ashtaMetadata[selectedSlotInfo.label]?.description || "ఈ సమయం గురించి మరిన్ని వివరాలు త్వరలో వస్తాయి."}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-2xl border ${selectedSlotInfo.type === 'good' ? 'bg-green-50 border-green-100 text-green-800' : selectedSlotInfo.type === 'bad' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                                        <h4 className="font-bold mb-2 flex items-center gap-2">
                                            <FaInfoCircle size={14} /> సూచన:
                                        </h4>
                                        <p className="text-sm">
                                            {ashtaMetadata[selectedSlotInfo.label]?.advice || (
                                                selectedSlotInfo.type === 'good' 
                                                ? "ఈ సమయం చాలా అనుకూలమైనది. మీ ముఖ్యమైన పనులు, ప్రయాణాలు లేదా కొత్త ప్రారంభాలకు ఇది శ్రేష్టం."
                                                : selectedSlotInfo.type === 'bad'
                                                ? "ఈ సమయంలో పనుల్లో ఆటంకాలు కలిగే అవకాశం ఉంది. వీలైనంత వరకు ముఖ్యమైన నిర్ణయాలు, పనులు వాయిదా వేసుకోవడం మంచిది."
                                                : "ఇది సాధారణ సమయం. దైనందిన పనులు చేసుకోవడానికి ఎటువంటి ఇబ్బంది లేదు."
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p>
                                        <b>అష్ట సిద్ధాంతం</b> (దీనినే భార్గవ సిద్ధాంతం లేదా శుక్ర సిద్ధాంతం అని కూడా అంటారు) అనేది ప్రాచీన తెలుగు పంచాంగ పద్ధతి. 
                                    </p>
                                    <p>
                                        ఇది రోజులోని ప్రతి కాలాన్ని (పగలు మరియు రాత్రి) 30 సమాన భాగాలుగా విభజిస్తుంది. ఒక్కో భాగం <b>24 నిమిషాల</b> నిడివి కలిగి ఉంటుంది.
                                    </p>
                                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                        <h4 className="font-bold text-blue-900 mb-2">ముఖ్య గమనిక:</h4>
                                        <ul className="space-y-2 list-disc list-inside text-blue-800 text-xs">
                                            <li>సూర్యోదయం నుండి సూర్యాస్తమయం వరకు పగటి కాలం (ఉ, మ, సా).</li>
                                            <li>సూర్యాస్తమయం నుండి మరుసటి రోజు సూర్యోదయం వరకు రాత్రి కాలం (రా).</li>
                                            <li>వారము మరియు సమయాన్ని బట్టి ఫలితాలు మారుతుంటాయి.</li>
                                        </ul>
                                    </div>
                                    <p>
                                        ప్రయాణాలు, అప్పులు ఇవ్వడం, కొత్త పనులు ప్రారంభించడం వంటి పనులకు ఈ పట్టికను ప్రామాణికంగా తీసుకుంటారు.
                                    </p>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={() => { setShowInfo(false); setSelectedSlotInfo(null); }} 
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                        >
                            సరే, అర్థమైంది
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
