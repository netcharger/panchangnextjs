"use client";

import { useState, useEffect } from "react";
import { FaBell, FaClock, FaMusic, FaSave, FaCheckCircle } from "react-icons/fa";
import { Dhurjati } from "next/font/google";
import clsx from "clsx";

const dhurjati = Dhurjati({
  subsets: ["telugu"],
  weight: "400",
});

export default function SettingsPage() {
  const [notificationTime, setNotificationTime] = useState("06:00");
  const [notificationSound, setNotificationSound] = useState("default");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [playingSound, setPlayingSound] = useState(null);
  const [audio, setAudio] = useState(null);

  // Available sounds (must match the filenames in android/app/src/main/res/raw/)
  const availableSounds = [
    { id: "default", name: "System Default", file: null },
    { id: "tirumala_bell", name: "Tirumala Bell", file: "tirumala_bell.mp3" },
    { id: "bells", name: "Temple Bells", file: "bells.mp3" },
    { id: "sivaya", name: "Sivaya Namaha", file: "sivaya.mp3" },
  ];

  // Audio cleanup effect
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  // Initialization effect
  useEffect(() => {
    // Listen for settings response
    const handleMessage = (event) => {
      try {
        let data = event.data;
        // Handle cases where data is already an object or needs parsing
        if (typeof data === 'string') {
          try {
             data = JSON.parse(data);
          } catch (e) {
             // Ignore parse errors for non-JSON strings
             return;
          }
        }

        if (data && data.type === "SETTINGS_RESPONSE") {
          console.log("Settings received:", data.settings);
          // Only update if values exist, otherwise keep default/current
          if (data.settings.notificationTime) {
            setNotificationTime(data.settings.notificationTime);
          }
          if (data.settings.notificationSound) {
            setNotificationSound(data.settings.notificationSound);
          }
        }
      } catch (e) {
        console.error("Error handling message:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    document.addEventListener("message", handleMessage); // For Android

    // Request current settings from native app on mount
    if (window.ReactNativeWebView) {
      console.log("Requesting settings from native app...");
      // Add a small delay to ensure bridge is ready
      setTimeout(() => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "GET_SETTINGS" }));
      }, 500);
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("message", handleMessage);
    };
  }, []); // Run only once on mount

  const handlePlaySound = (soundId, fileName) => {
    // Stop currently playing sound if any
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // If clicking the same sound that is playing, just stop it (toggle off)
    if (playingSound === soundId) {
      setPlayingSound(null);
      setAudio(null);
      return;
    }

    if (!fileName) return; // Default sound has no file to preview

    const newAudio = new Audio(`/audio/${fileName}`);
    newAudio.onended = () => {
      setPlayingSound(null);
      setAudio(null);
    };
    
    newAudio.play().catch(e => console.error("Error playing sound:", e));
    setAudio(newAudio);
    setPlayingSound(soundId);
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Stop audio when saving
    if (audio) {
      audio.pause();
      setPlayingSound(null);
    }

    const settings = {
      notificationTime,
      notificationSound,
    };

    console.log("Saving settings to native app:", settings);

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "SAVE_SETTINGS",
          payload: settings,
        })
      );
      
      // Show success briefly
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 800);
    } else {
      console.warn("ReactNativeWebView not found. Settings not saved to native.");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-saffron-50 to-indigo-50 pt-20 pb-10 px-4">
      <div className="w-full max-w-[420px] mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-saffron-100">
          <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 p-6 text-white text-center">
            <FaBell className="mx-auto mb-3 text-4xl opacity-90" />
            <h1 className={`${dhurjati.className} text-3xl font-bold`}>యూజర్ సెట్టింగ్స్</h1>
            <p className="text-saffron-50 opacity-90 mt-1">నోటిఫికేషన్ సెట్టింగ్స్ మార్చుకోండి</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Time Setting */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-indigo-900 font-semibold text-lg">
                <FaClock className="text-saffron-500" />
                నోటిఫికేషన్ సమయం
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 text-2xl font-bold text-indigo-700 focus:outline-none focus:border-saffron-400 transition-all duration-200"
                />
              </div>
              <p className="text-indigo-500 text-sm italic">రోజువారీ పంచాంగం ఈ సమయానికి వస్తుంది.</p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={clsx(
                "w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-xl shadow-lg transition-all duration-300 active:scale-95",
                saveSuccess
                  ? "bg-green-500 shadow-green-200"
                  : isSaving
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              )}
            >
              {saveSuccess ? (
                <>
                  <FaCheckCircle /> Saved!
                </>
              ) : (
                <>
                  <FaSave /> {isSaving ? "Saving..." : "Save Settings"}
                </>
              )}
            </button>

        <div className="mt-8 text-center px-4">
          <p className="text-indigo-400 text-sm">
            నోటిఫికేషన్ శబ్దం మొబైల్ ఫోన్ సెట్టింగ్స్ మీద కూడా ఆధారపడి ఉంటుంది.
          </p>
        </div>
      </div>
      </div>

      <style jsx global>{`
        input[type="time"]::-webkit-calendar-picker-indicator {
          display: none;
        }
      `}</style>
    </div>
    </div>
  );
}
