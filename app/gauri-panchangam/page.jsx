'use client';

import { useState, useEffect, useRef } from 'react';
import { gowriData } from '../../data/gauriPanchangamData';
import { gowriValuesInfo } from '../../data/gauriPanchangInfo';
import IntervalTimer from '../../components/IntervalTimer';

export default function PanchangamPage() {
  const [activeDay, setActiveDay] = useState('sun');
  const [currentTime, setCurrentTime] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedStatusInfo, setSelectedStatusInfo] = useState(null);
  const scrollRef = useRef(null);
  const dayRefs = useRef({});
  const slotRefs = useRef({});

  // Auto-select current day on load and separate update timer
  useEffect(() => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayIndex = new Date().getDay();
    setActiveDay(days[currentDayIndex]);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000); 
    return () => clearInterval(timer);
  }, []);

  // Scroll active day into view
  useEffect(() => {
    if (activeDay && dayRefs.current[activeDay]) {
      dayRefs.current[activeDay].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeDay]);

  // Auto-scroll to current time slot
  useEffect(() => {
    const scrollToCurrentSlot = () => {
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const currentDayIndex = new Date().getDay();
      const currentDayKey = days[currentDayIndex];
      
      if (activeDay === currentDayKey && currentTime) {
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
  }, [activeDay, currentTime]);

  // Use the color from the info file directly if available, else fallback
  const getStatusStyle = (status) => {
    const info = gowriValuesInfo[status];
    if (info) {
       const levelMap = {
           'most_auspicious': 'bg-green-100 text-green-800 border-green-200',
           'auspicious': 'bg-green-50 text-green-700 border-green-100',
           'neutral': 'bg-blue-50 text-blue-700 border-blue-100',
           'inauspicious': 'bg-red-50 text-red-700 border-red-100',
           'highly_inauspicious': 'bg-gray-100 text-gray-800 border-gray-200'
       };
       return levelMap[info.level] || 'bg-gray-50 text-gray-600';
    }
    return 'bg-gray-50 text-gray-600';
  };
  
  const getStatusHexColor = (status) => {
      return gowriValuesInfo[status]?.color || '#000000';
  };

  const getDayGradient = (day) => {
    const gradients = {
      sun: 'bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-100', 
      mon: 'bg-gradient-to-br from-blue-50 via-white to-blue-100', 
      tue: 'bg-gradient-to-br from-red-50 via-white to-red-100', 
      wed: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100', 
      thu: 'bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-50', 
      fri: 'bg-gradient-to-br from-pink-50 via-white to-purple-50', 
      sat: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-200' 
    };
    return gradients[day] || 'bg-orange-50';
  };

  const handleStatusClick = (status) => {
      const info = gowriValuesInfo[status];
      if (info) {
          setSelectedStatusInfo({ ...info, name: status });
          setShowInfo(true);
      }
  };

  const formatTo12Hr = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getSlotCategory = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMins = h * 60 + m;
    
    if (totalMins >= 360 && totalMins < 720) return "ఉ";
    if (totalMins >= 720 && totalMins < 960) return "మ";
    if (totalMins >= 960 && totalMins < 1080) return "సా";
    return "రా";
  };

  return (
    <div className={`min-h-screen font-sans pb-10 transition-colors duration-500 ease-in-out ${getDayGradient(activeDay)}`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 md:p-8 pt-6 pb-2 text-center relative">

          <div className="flex flex-col items-center gap-2 mb-2">
            <img 
              src="/images/gowri-devi.png" 
              alt="Gauri Panchangam" 
              className="w-20 h-20 object-cover rounded-full shadow-md border-2 border-white mb-1" 
            />
            <h1 className="text-3xl font-bold text-orange-900">గౌరీ పంచాంగం</h1>
            <button 
              onClick={() => {
                setSelectedStatusInfo({
                  name: "గౌరీ పంచాంగం",
                  description: `
                    <div class="space-y-4">
                        <section>
                            <h4 class="text-orange-900 font-bold mb-2">గౌరీ పంచాంగం అంటే ఏమిటి?</h4>
                            <p>సాధారణ పంచాంగంలో మనం 'శుభ సమయం' కోసం రాహుకాలం, యమగండం ఎలా చూస్తామో, అదే విధంగా గౌరీ పంచాంగం కూడా రోజులో ఏ సమయం దేనికి అనుకూలమో తెలియజేస్తుంది. దీనిని ముఖ్యంగా దక్షిణ భారతదేశంలో (తమిళనాడు, ఆంధ్రప్రదేశ్) ఎక్కువగా ఉపయోగిస్తారు.</p>
                        </section>

                        <section>
                            <p>రోజులో (పగలు 12 గంటలు, రాత్రి 12 గంటలు) ప్రతి భాగాన్ని 8 విభాగాలుగా విభజించి, ఒక్కో భాగానికి ఒక పేరును కేటాయిస్తారు.</p>
                        </section>

                        <section>
                            <h4 class="text-indigo-900 font-bold mb-2">వివిధ ఫలాలు - వివరణ</h4>
                            
                            <div class="space-y-3">
                                <div class="p-3 bg-green-50 rounded-xl border border-green-100">
                                    <h5 class="font-bold text-green-800 mb-1">1. అత్యంత శుభప్రదమైనవి</h5>
                                    <ul class="list-disc list-inside space-y-1 text-xs text-green-700">
                                        <li><b>అమృతం:</b> అత్యుత్తమ సమయం. ఏ పని చేసినా విజయం లభిస్తుంది.</li>
                                        <li><b>ధనం:</b> వ్యాపార ప్రారంభాలకు, ఆర్థిక లావాదేవీలకు శ్రేష్టం.</li>
                                        <li><b>లాభం:</b> కొత్త వస్తువులు కొనడానికి, లాభదాయక పనులకు అనుకూలం.</li>
                                    </ul>
                                </div>

                                <div class="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <h5 class="font-bold text-blue-800 mb-1">2. సాధారణ శుభప్రదమైనవి</h5>
                                    <ul class="list-disc list-inside space-y-1 text-xs text-blue-700">
                                        <li><b>శుభం:</b> పెళ్లి సంబంధాలు, పూజలు వంటి పనులకు మంచిది.</li>
                                        <li><b>సుఖం:</b> ప్రయాణాలకు, కుటుంబంతో గడపడానికి అనుకూలం.</li>
                                    </ul>
                                </div>

                                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <h5 class="font-bold text-slate-800 mb-1">3. మధ్యస్థం / తటస్థం</h5>
                                    <ul class="list-disc list-inside space-y-1 text-xs text-slate-700">
                                        <li><b>ఉద్యోగ:</b> ఆఫీసు పనులు, దైనందిన పనులకు అనుకూలం.</li>
                                        <li><b>ఉతి:</b> సాదాసీదా సమయం. ముఖ్యమైన పనులకు వాడకపోవడమే మంచిది.</li>
                                    </ul>
                                </div>

                                <div class="p-3 bg-red-50 rounded-xl border border-red-100">
                                    <h5 class="font-bold text-red-800 mb-1">4. అశుభ సమయాలు (నివారించాలి)</h5>
                                    <ul class="list-disc list-inside space-y-1 text-xs text-red-700">
                                        <li><b>రోగం:</b> అనారోగ్యం లేదా పనుల్లో ఆటంకాలు కలిగే సమయం.</li>
                                        <li><b>విషం:</b> పని చెడిపోయే అవకాశం ఎక్కువ.</li>
                                        <li><b>సోరం/చోరం:</b> దొంగతనం లేదా నష్టపోయే భయం ఉంటుంది.</li>
                                        <li><b>కలహం:</b> వాదోపవాదాలు, గొడవలు జరిగే అవకాశం ఉంది.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                  `,
                  color: "#ea580c",
                  key: "సమాచారం",
                  allow: true
                });
                setShowInfo(true);
              }}
              className="p-1.5 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>
          <p className="text-sm font-medium text-orange-800/80 mb-1">గౌరీ పంచాంగం ద్వారా రోజువారీ శుభ సమయాలను తెలుసుకోవచ్చు</p>
 
        </div>

        {/* Info Modal */}
        {showInfo && selectedStatusInfo && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowInfo(false)}>
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-center mb-4 mt-2">
                <img 
                    src="/images/gowri-devi.png" 
                    alt="Gauri Panchangam" 
                    className="w-24 h-24 object-cover rounded-full shadow-lg border-4 border-white active:scale-110 transition-transform" 
                />
              </div>
              <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: selectedStatusInfo.color }}></div>
                    
                    <div className="mt-2 flex-grow overflow-y-auto sleek-scrollbar pr-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">{selectedStatusInfo.name}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border" 
                                  style={{ 
                                      borderColor: selectedStatusInfo.color, 
                                      color: selectedStatusInfo.color,
                                      backgroundColor: `${selectedStatusInfo.color}15` 
                                  }}>
                                {selectedStatusInfo.key}
                            </span>
                        </div>
                        
                        <div className="mb-6 prosetelugu text-gray-700 leading-relaxed">
                            {selectedStatusInfo.key === 'సమాచారం' ? (
                                <div 
                                    className="space-y-4 text-sm"
                                    dangerouslySetInnerHTML={{ __html: selectedStatusInfo.description }} 
                                />
                            ) : (
                                <p className="text-lg">
                                    {selectedStatusInfo.description}
                                </p>
                            )}
                        </div>
                        
                        {selectedStatusInfo.key !== 'సమాచారం' && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${selectedStatusInfo.allow ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <p className="text-sm font-semibold text-gray-700">ముఖ్య సూచన</p>
                                </div>
                                <p className={`text-sm ${selectedStatusInfo.allow ? 'text-green-700' : 'text-red-700'}`}>
                                    {selectedStatusInfo.allow ? 'కొత్త పనులు ప్రారంభించడానికి అనుకూలం.' : 'ముఖ్యమైన పనులు ప్రారంభించడం వాయిదా వేయండి.'}
                                </p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setShowInfo(false)} 
                        className="w-full py-3 mt-4 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex-shrink-0"
                        style={{ backgroundColor: selectedStatusInfo.color }}
                    >
                        సరే
                    </button>
                </div>
            </div>
        )}

        {/* Day Selection Tabs - Sticky */}
        <div className="sticky top-0 z-30 bg-white/30 backdrop-blur-md pt-2 pb-2 px-4 md:px-8 border-b border-white/20">
          <div 
            ref={scrollRef}
            className="flex space-x-2 overflow-x-auto sleek-scrollbar pb-2 scroll-smooth"
          >
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => (
              <button
                key={day}
                ref={(el) => (dayRefs.current[day] = el)}
                onClick={() => setActiveDay(day)}
                className={`flex-shrink-0 px-5 py-2 rounded-2xl capitalize font-semibold transition-all shadow-sm border ${
                  activeDay === day ? 'bg-orange-600 text-white border-orange-700 shadow-orange-200' : 'bg-white text-orange-900 border-orange-200 hover:bg-orange-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-4 px-4 md:px-8 mt-4">
          {gowriData.map((slot) => {
            const status = slot[activeDay];
            const info = gowriValuesInfo[status] || {};
            
            // Logic for active slot check - only if it is the current real-world day
            const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const realTodayDay = days[new Date().getDay()];
            const isToday = activeDay === realTodayDay;
            
            let isActive = false;
            if (isToday) {
                // Treating 00:00 as midnight crossover point for end time checks
                if (slot.end === "00:00") {
                     isActive = currentTime >= slot.start; 
                } else if (slot.start === "00:00") {
                     isActive = currentTime >= slot.start && currentTime < slot.end; // Standard check for early morning
                } else {
                     isActive = currentTime >= slot.start && currentTime < slot.end;
                }
                
                // Fixing the comparison logic for "00:00" end time
                if (slot.end === "00:00" && currentTime >= slot.start) {
                    isActive = true;
                }
            }

            // Progress calculation for active slot
            let progressFactor = 0;
            if (isActive) {
                const parseMin = (t) => {
                    const [h, m] = t.split(':').map(Number);
                    return h * 60 + m;
                };
                let st = parseMin(slot.start);
                let en = parseMin(slot.end === "00:00" ? "24:00" : slot.end);
                let cu = parseMin(currentTime);
                
                // Handle midnight crossover
                if (cu < st && en > 1440) {
                   cu += 1440; 
                }

                progressFactor = ((cu - st) / (en - st)) * 100;
            }

            return (
              <div 
                key={slot.id}
                ref={(el) => {
                  if (el) {
                    slotRefs.current[`${activeDay}-${slot.id}`] = el;
                    el.dataset.isActive = isActive ? 'true' : 'false';
                  }
                }}
                className={`relative flex items-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                  isActive ? 'scale-105 shadow-xl shadow-orange-100 z-10 border-orange-500 bg-white ring-4 ring-orange-400/30 animate-pulse' : 'bg-white/60 border-transparent shadow-sm hover:bg-white/80'
                }`}
              >
                <div className="flex-shrink-0 w-28 flex items-center gap-2">
                  <span className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    {getSlotCategory(slot.start)}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-none mb-1">
                      {formatTo12Hr(slot.start)} నుండి {formatTo12Hr(slot.end)}
                    </p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-gray-200 mx-3"></div>

                <div className="flex-grow flex items-center justify-between min-w-0">
                  <button 
                    onClick={() => handleStatusClick(status)}
                    className={`text-left group transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-200 overflow-hidden`}
                  >
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold border inline-flex items-center gap-2 transition-transform group-hover:scale-105 whitespace-nowrap ${getStatusStyle(status)}`}
                             style={{ borderColor: info.color ? `${info.color}40` : undefined }}
                        >
                            <span className="truncate">{status}</span>
                            <svg className="w-3 h-3 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                  </button>

                  {isActive && (
                    <div className="ml-2">
                        <IntervalTimer 
                            progress={progressFactor} 
                            size={48} 
                            strokeWidth={4} 
                            primaryColor={info.color || "#ea580c"}
                            label="పూర్తి"
                        />
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-4 h-4 bg-orange-500 rounded-full relative"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
