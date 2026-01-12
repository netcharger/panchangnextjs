"use client";

import React, { useEffect, useRef } from 'react';

const MoonPhase = ({ tithiName, paksham, size = 120 }) => {
  const shadowRef = useRef(null);

  // Helper to normalize input text
  const normalize = (text) => text ? text.toLowerCase().trim() : "";

  // Get Tithi Number (1-15) and Phase Check
  const getTithiInfo = (name) => {
    const nName = normalize(name);
    
    // Direct Full/New Moon Check
    if (nName.includes("pournami") || nName.includes("purnima") || nName.includes("full moon") || nName.includes("పౌర్ణమి") || nName.includes("పూర్ణిమ")) {
        return { num: 15, type: 'full' };
    }
    if (nName.includes("amavasya") || nName.includes("new moon") || nName.includes("అమావాస్య")) {
        return { num: 0, type: 'new' };
    }

    // Tithi Number Map
    const tithiMap = {
        "padyami": 1, "pratipada": 1, "పాడ్యమి": 1, "ప్రతిపద": 1,
        "vidiya": 2, "dwitiya": 2, "విదియ": 2, "ద్వితీయ": 2,
        "thadiya": 3, "tritiya": 3, "తదియ": 3, "తృతీయ": 3,
        "chavithi": 4, "chaturthi": 4, "చవితి": 4, "చతుర్థి": 4,
        "panchami": 5, "పంచమి": 5,
        "shashti": 6, "షష్ఠి": 6,
        "saptami": 7, "సప్తమి": 7,
        "ashtami": 8, "అష్టమి": 8,
        "navami": 9, "నవమి": 9,
        "dashami": 10, "దశమి": 10,
        "ekadashi": 11, "ఏకాదశి": 11,
        "dwadashi": 12, "ద్వాదశి": 12,
        "trayodashi": 13, "త్రయోదశి": 13,
        "chaturdashi": 14, "చతుర్దశి": 14
    };

    // Find number from map
    let num = null;
    for (const [key, val] of Object.entries(tithiMap)) {
        if (nName.includes(key)) {
            num = val;
            break;
        }
    }
    
    return { num, type: 'normal' };
  };

  const getPhase = (tName, pName) => {
    const tInfo = getTithiInfo(tName);
    
    if (tInfo.type === 'full') return { pct: 100, dir: 'none' };
    if (tInfo.type === 'new') return { pct: 0, dir: 'none' };
    
    // Determine Waxing/Waning from Paksham or Tithi Name
    const normPaksham = normalize(pName);
    const normTithi = normalize(tName);
    
    let isWaxing = true; // Default to Shukla/Waxing
    
    // Check for Waning keywords
    if (normPaksham.includes("krishna") || normPaksham.includes("bahula") || normPaksham.includes("waning") || normPaksham.includes("కృష్ణ") || normPaksham.includes("బహుల") ||
        normTithi.includes("krishna") || normTithi.includes("bahula") || normTithi.includes("కృష్ణ")) {
        isWaxing = false;
    }
    
    // If not explicitly waning, assume waxing (Shukla/Sudha)
    // Calculate Percentage
    // Waxing: 0 -> 100
    // Waning: 100 -> 0
    
    const num = tInfo.num || 8; // Default to 8 (Half Moon) if unknown
    
    // Percentage logic: 
    // Waxing: Padyami (1) -> ~6.6%, Pournami (15) -> 100%
    // Waning: Padyami (1) -> ~93.3%, Amavasya (15) -> 0%
    
    let pct;
    if (isWaxing) {
        pct = (num / 15) * 100;
    } else {
        pct = 100 - ((num / 15) * 100);
    }
    
    return { pct, dir: isWaxing ? 'waxing' : 'waning' };
  };

  const data = getPhase(tithiName, paksham);
  const isPournami = data.pct === 100;
  const isAmavasya = data.pct === 0;

  // Animation / Position Logic
  useEffect(() => {
    const shadow = shadowRef.current;
    if (!shadow) return;

    const offset = (data.pct / 100) * 80; 
    const direction = data.dir === "waxing" ? 1 : -1;
    
    shadow.animate(
      [{ cx: 50 }, { cx: 50 + direction * offset }],
      { duration: 1000, fill: "forwards", easing: "ease-out" }
    );
  }, [data]);

  return (
    <div style={{ 
      width: size, 
      height: size, 
      filter: isPournami ? 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.6))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <defs>
          {/* Mask for Phase Logic */}
          <mask id="moonMask">
            <rect x="0" y="0" width="100" height="100" fill="white"/>
            <circle id="shadowCircle" ref={shadowRef} cx="50" cy="50" r="40" fill="black"/>
          </mask>

          {/* 3D Dark Moon Gradient (Black/Slate) */}
          <radialGradient id="moonDarkBase" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="90%" stopColor="#020617" />
          </radialGradient>

          {/* 3D Lit Moon Gradient (Gold/Amber) */}
          <radialGradient id="moonLitBase" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
             <stop offset="0%" stopColor="#FDE68A" /> {/* Amber-200 */}
             <stop offset="90%" stopColor="#D97706" /> {/* Amber-600 */}
          </radialGradient>
        </defs>

        {/* Base Moon (The Dark/Black Side) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="url(#moonDarkBase)" 
        />

        {/* The Lit Moon (Gold Phase) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="url(#moonLitBase)"
          mask="url(#moonMask)"
        />
      </svg>
    </div>
  );
};
// End of component
export default MoonPhase;
