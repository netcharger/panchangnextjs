const React = require('react');

/**
 * Parses Telugu Tithi names and returns moon phase info.
 * @param {string} tithiName - The Telugu Tithi name (e.g., "శుక్ల పాడ్యమి").
 * @returns {object} Object containing visibility (0-1), isWaxing (boolean), and color.
 */
exports.getMoonPhaseInfo = (tithiName) => {
  if (!tithiName) return { visibility: 0, isWaxing: true, color: "#fde047" };
  
  const isShukla = tithiName.includes('శుక్ల');
  const isKrishna = tithiName.includes('కృష్ణ') || tithiName.includes('బహుళ');
  
  // Tithi rankings 1 to 15 with common variations
  const tithiMap = {
    'పాడ్యమి': 1, 'ప్రథమ': 1,
    'విదియ': 2, 'ద్వితీయ': 2,
    'తదియ': 3, 'తృతీయ': 3,
    'చవితి': 4, 'చతుర్థి': 4,
    'పంచమి': 5,
    'షష్ఠి': 6,
    'సప్తమి': 7,
    'అష్టమి': 8,
    'నవమి': 9,
    'దశమి': 10,
    'ఏకాదశి': 11,
    'ద్వాదశి': 12,
    'త్రయోదశి': 13,
    'చతుర్దశి': 14,
    'పూర్ణిమ': 15, 'పౌర్ణమి': 15, 'పున్నమి': 15,
    'అమావాస్య': 15
  };
  
  let rank = 1;
  // Use a more robust matching: check for each key in the string
  for (const [key, value] of Object.entries(tithiMap)) {
    if (tithiName.includes(key)) {
      rank = value;
      break;
    }
  }
  
  // Visibility calculation:
  // Shukla: increases from 0 to 1. Krishna: decreases from 1 to 0.
  let visibility = 0.5; // Default for mid-phase
  
  if (tithiName.includes('పూర్ణిమ') || tithiName.includes('పౌర్ణమి') || tithiName.includes('పున్నమి')) {
    visibility = 1.0;
  } else if (tithiName.includes('అమావాస్య')) {
    visibility = 0.0;
  } else if (isShukla) {
    visibility = rank / 15;
  } else if (isKrishna) {
    visibility = (15 - rank) / 15;
  }
  
  return {
    visibility,
    isWaxing: isShukla || (!isKrishna && rank <= 15), // Fallback if paksha not explicitly mentioned
    color: isShukla ? "#fde047" : "#cbd5e1" // Bright yellow for Shukla, Light slate for Krishna
  };
};

/**
 * MoonIcon component to render a dynamic SVG moon phase.
 */
exports.MoonIcon = ({ visibility, isWaxing, color, size = 24 }) => {
  const center = size / 2;
  const radius = center - 2;
  
  // Calculate inner arc width
  // rx represents the x-radius of the inner ellipse that creates the crescent/gibbous effect
  const rx = radius * Math.abs(1 - 2 * visibility);
  const sweep = visibility < 0.5 ? 1 : 0;
  
  // Path for the illuminated part
  const d = visibility === 1
    ? `M ${center},${center-radius} A ${radius},${radius} 0 1,1 ${center},${center+radius} A ${radius},${radius} 0 1,1 ${center},${center-radius}`
    : visibility <= 0
      ? ""
      : `M ${center},${center-radius} A ${radius},${radius} 0 0,1 ${center},${center+radius} A ${rx},${radius} 0 0,${sweep} ${center},${center-radius}`;

  return (
    <div className="relative inline-flex items-center justify-center pointer-events-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
        {/* Dark background (always there) */}
        <circle cx={center} cy={center} r={radius} fill="#1e293b" />
        
        {/* Illuminated portion */}
        {d && (
          <path 
            d={d}
            fill={color}
            transform={!isWaxing ? `scale(-1, 1) translate(${-size}, 0)` : ""}
          />
        )}
      </svg>
    </div>
  );
};
