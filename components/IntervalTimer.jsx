"use client";

import { useEffect, useState } from "react";

export default function IntervalTimer({ 
    progress = 0, 
    size = 100, 
    strokeWidth = 8, 
    primaryColor = "#6366F1", 
    secondaryColor = "rgba(0, 0, 0, 0.05)",
    label = "",
    subLabel = ""
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-in-out"
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                    {Math.round(progress)}%
                </span>
                {label && (
                    <span className="text-[10px] font-medium opacity-70 leading-tight">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}
