"use client";

import { useState } from 'react';
import { MARRIAGE_COMPATIBILITY_DATA } from '../../lib/marriageData';
import { FaSearch, FaHeart } from 'react-icons/fa';
import { sendToNative } from '../../lib/webviewBridge';

export default function MarriageMatchingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const data = MARRIAGE_COMPATIBILITY_DATA["వివాహ_నక్షత్ర_అనుకూల_పట్టిక"];
  const nakshatras = data["డేటా"];
  
  // Mapping of Telugu nakshatra names to English for search
  const nakshatraMapping = {
    "అశ్విని": "Ashwini",
    "భరణి": "Bharani",
    "కృత్తిక": "Krittika",
    "రోహిణి": "Rohini",
    "మృగశిర": "Mrigashira",
    "ఆర్ద్ర": "Ardra",
    "పునర్వసు": "Punarvasu",
    "పుష్యమి": "Pushyami",
    "ఆశ్లేష": "Ashlesha",
    "మఖ": "Makha Magha",
    "పుబ్బ": "Pubba Purva Phalguni",
    "ఉత్తర": "Uttara Phalguni",
    "హస్త": "Hasta",
    "చిత్ర": "Chitra",
    "స్వాతి": "Swati",
    "విశాఖ": "Vishakha",
    "అనూరాధ": "Anuradha",
    "జ్యేష్ఠ": "Jyeshtha",
    "మూల": "Moola Mula",
    "పూర్వాషాఢ": "Purvashada",
    "ఉత్తరాషాఢ": "Uttarashada",
    "శ్రవణం": "Shravana",
    "ధనిష్ఠ": "Dhanishta",
    "శతభిషం": "Shatabhisha",
    "పూర్వాభాద్ర": "Purvabhadra",
    "ఉత్తరాభాద్ర": "Uttarabhadra",
    "రేవతి": "Revati"
  };

  // Helper to check if a nakshatra key matches the search term (in Telugu or English)
  const matchesSearch = (key, term) => {
    if (!term) return true;
    const lowerTerm = term.toLowerCase().trim();
    
    // Check Telugu key directly
    if (key.includes(lowerTerm)) return true; // Direct Telugu match
    
    // Check English mapping
    // Extract the base nakshatra name (e.g., "కృత్తిక_1వ_పాదం" -> "కృత్తిక")
    const baseName = key.split('_')[0];
    const englishName = nakshatraMapping[baseName];
    
    if (englishName && englishName.toLowerCase().includes(lowerTerm)) {
      return true;
    }
    
    return false;
  };

  // Filter nakshatras based on search term
  const filteredNakshatras = Object.keys(nakshatras).filter(key => 
    matchesSearch(key, searchTerm)
  );

  // Function to remove underscores and clean up keys for display
  const formatName = (name) => {
    return name.replace(/_/g, ' ');
  };

  // Pre-defined colorful gradients for cards to make it vibrant
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-pink-600',
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex flex-col mb-4">
            <h1 className="text-xl font-bold text-pink-600 flex items-center gap-2 mb-1">
              <FaHeart className="animate-pulse" />
              వివాహ నక్షత్రం
            </h1>
            <h3 className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
              జన్మ నక్షత్ర వారిగా వివాహమునకు అనుకూల నక్షత్రాలు
            </h3>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition duration-150 ease-in-out sm:text-sm"
              placeholder="నక్షత్రం పేరు (ఉదా: అశ్విని / Ashwini)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {filteredNakshatras.length > 0 ? (
          filteredNakshatras.map((nakshatra, index) => {
            const compatibleStars = nakshatras[nakshatra];
            const gradientClass = gradients[index % gradients.length];
            
            return (
              <div 
                key={nakshatra} 
                className="bg-white rounded-3xl shadow-soft overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`p-5 bg-gradient-to-r ${gradientClass} text-white relative overflow-hidden`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">జన్మ నక్షత్రం</div>
                    <div className="text-2xl font-bold">{formatName(nakshatra)}</div>
                    <div className="mt-2 text-sm opacity-90 font-medium">
                      {compatibleStars.length} అనుకూల నక్షత్రాలు
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-white">
                  <div className="flex flex-wrap gap-2">
                    {compatibleStars.map((star, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-100 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-100 transition-colors"
                      >
                       <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2"></span>
                       {star}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-300 text-6xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">ఫలితాలు కనిపించలేదు</p>
            <p className="text-gray-400 text-sm mt-1">దయచేసి మరొక నక్షత్రం పేరుతో ప్రయత్నించండి</p>
          </div>
        )}
        
        <div className="h-10"></div>
      </div>
    </div>
  );
}
