"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAshtaStatus } from "../lib/ashtaSiddhanta";
import { FaClock } from "react-icons/fa";

export default function AshtaSiddhantaWidget() {
    const [status, setStatus] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const updateStatus = () => {
            const currentStatus = getAshtaStatus();
            setStatus(currentStatus);
        };

        updateStatus();
        const interval = setInterval(updateStatus, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (!mounted || !status) return null;

    const typeColors = {
        good: { 
            bg: "bg-green-50", 
            text: "text-green-700", 
            border: "border-green-200",
            dot: "bg-green-500",
            gradient: "from-green-50 to-emerald-100"
        },
        bad: { 
            bg: "bg-red-50", 
            text: "text-red-700", 
            border: "border-red-200",
            dot: "bg-red-500",
            gradient: "from-red-50 to-orange-100"
        },
        neutral: { 
            bg: "bg-blue-50", 
            text: "text-blue-700", 
            border: "border-blue-200",
            dot: "bg-blue-500",
            gradient: "from-blue-50 to-indigo-100"
        }
    };

    const config = typeColors[status.type] || typeColors.neutral;

    return (
        <Link href="/ashta-siddhanta">
            <div className="glass rounded-2xl p-6 shadow-soft border border-white/50 relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img 
                            src="/images/vedic-wheel.png" 
                            alt="Ashta Siddhanta" 
                            className="w-16 h-16 object-cover rounded-full shadow-md border-2 border-white group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900 mb-1">అష్ట సిద్ధాంతం ప్రకారం</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-indigo-700/80">ఇప్పుడు:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border bg-white flex items-center gap-2 ${config.text} ${config.border}`}>
                                    <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
                                    {status.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-indigo-600">
                        <FaClock size={20} />
                    </div>
                </div>
                <div className="mt-2 text-[10px] text-indigo-500/70 relative z-10">
                    సమయం: {status.startTime} - {status.endTime}
                </div>
            </div>
        </Link>
    );
}
