"use client";

import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaBell, FaDownload, FaCheck, FaSpinner } from "react-icons/fa";
import { sendToNative, onNativeMessage } from "../lib/webviewBridge";
import getBaseURL from "../lib/getBaseURL";

export default function MusicList({ tracks = [], onSetAlarm }) {
  const [playingId, setPlayingId] = useState(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const [trackStatuses, setTrackStatuses] = useState({});

  useEffect(() => {
    const cleanup = onNativeMessage((payload) => {
      if (payload?.trackId) {
        const trackKey = String(payload.trackId);
        if (payload.type === "TRACK_DOWNLOADED") {
          setTrackStatuses((prev) => ({
            ...prev,
            [trackKey]: { ...prev[trackKey], isDownloaded: true, isDownloading: false },
          }));
        } else if (payload.type === "TRACK_DOWNLOAD_FAILED") {
          setTrackStatuses((prev) => ({
            ...prev,
            [trackKey]: { ...prev[trackKey], isDownloading: false },
          }));
        }
      }
    });
    return cleanup;
  }, []);

  const updateTrackStatus = (trackId, changes) => {
    const key = String(trackId);
    setTrackStatuses((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...changes },
    }));
  };

  const getTrackStatus = (trackId) => {
    const key = String(trackId);
    return trackStatuses[key] || { isDownloaded: false, isDownloading: false };
  };

  // Helper function to get full audio URL
  const getFullAudioUrl = (audioUrl) => {
    if (!audioUrl) return null;

    // If already a full URL (starts with http:// or https://), return as is
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }

    // If it's a relative URL, prepend the base URL
    const baseURL = getBaseURL();
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = audioUrl.startsWith('/') ? audioUrl.substring(1) : audioUrl;
    return `${baseURL}/${cleanUrl}`;
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = (track) => {
    console.log("⏯️ handlePlay called for track:", track.id, "Current playingId:", playingId);

    const rawAudioUrl = track.mp3_file || track.audio_file || track.url;
    const audioUrl = getFullAudioUrl(rawAudioUrl);

    if (!audioUrl) {
      console.error("❌ handlePlay: No audio URL found for track:", track);
      console.error("❌ handlePlay: Track data:", track);
      return;
    }

    // If same track is clicked, pause it
    if (playingId === track.id) {
      console.log("⏸️ handlePlay: Same track clicked, attempting to pause.");
      setPlayingId(null);
      setPlayingAudioUrl(null);

      // Pause and cleanup browser audio
      if (audioRef.current) {
        console.log("⏸️ handlePlay: Pausing browser audio.");
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }

      // Send pause message to native app if in WebView
      console.log("📤 handlePlay: Dispatching PAUSE_AUDIO to native app for track:", track.id);
      sendToNative({
        type: "PAUSE_AUDIO",
        trackId: track.id,
      });
      return;
    }

    const status = getTrackStatus(track.id);
    if (!status.isDownloaded && !status.isDownloading) {
      updateTrackStatus(track.id, { isDownloading: true });
    }

    // Pause and cleanup currently playing audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }

    // Play the new track
    setPlayingId(track.id);
    setPlayingAudioUrl(audioUrl);

    // Send play message to native app if in WebView
    sendToNative({
      type: "PLAY_AUDIO",
      trackId: track.id,
      audioUrl: audioUrl,
      title: track.title || track.name,
    });

    // Also try to play in browser if not in WebView
    if (typeof window !== 'undefined' && !window.ReactNativeWebView) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up audio event handlers
      audio.onended = () => {
        console.log("Audio ended");
        setPlayingId(null);
        setPlayingAudioUrl(null);
        if (audioRef.current) {
        audioRef.current = null;
        }
      };

      audio.onerror = (e) => {
        console.error("Audio error:", e);
        console.error("Audio element error:", audio.error);
        console.error("Failed URL:", audioUrl);
        setPlayingId(null);
        setPlayingAudioUrl(null);
        if (audioRef.current) {
        audioRef.current = null;
        }
        if (audio.error) {
          const errorMsg = audio.error.code === 4 ?
            "Media file not found. Please check if the file exists on the server." :
            `Failed to play audio: ${audio.error.message || 'Unknown error'}`;
          console.error(errorMsg);
        }
      };

      audio.onloadstart = () => {
        console.log("Audio loading started:", audioUrl);
      };

      audio.onloadeddata = () => {
        console.log("Audio data loaded:", audioUrl);
      };

      audio.oncanplaythrough = () => {
        console.log("Audio can play through:", audioUrl);
      };

      audio.onplay = () => {
        console.log("Audio started playing");
      };

      audio.onpause = () => {
        console.log("Audio paused");
      };

      // Play audio
      const playAudio = async () => {
        try {
          await audio.play();
          console.log("Audio play() called successfully");
        } catch (err) {
          console.error("Error playing audio:", err);
          setPlayingId(null);
          setPlayingAudioUrl(null);
          if (audioRef.current) {
          audioRef.current = null;
          }
        }
      };

      playAudio();
    }
  };

  const handleDownloadPress = (track, audioUrl) => {
    if (!audioUrl) return;
    const status = getTrackStatus(track.id);
    if (status.isDownloaded || status.isDownloading) return;
    updateTrackStatus(track.id, { isDownloading: true });
    sendToNative({
      type: "DOWNLOAD_TRACK",
      trackId: track.id,
      trackTitle: track.title || track.name,
      audioUrl,
    });
  };

  return (
    <div className="space-y-3">
      {tracks.map((t, idx) => {
        const isPlaying = playingId === t.id;
        const rawAudioUrl = t.mp3_file || t.audio_file || t.url;
        const audioUrl = getFullAudioUrl(rawAudioUrl);
        const status = getTrackStatus(t.id);
        const isDownloaded = status.isDownloaded;
        const isDownloading = status.isDownloading;

        return (
        <div
          key={t.id || idx}
          className="glass rounded-xl p-4 shadow-soft border border-white/50 hover:shadow-md transition-all duration-200 active:scale-98 group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-indigo-700 truncate">{t.title || t.name}</div>
                {t.description && (
                  <div className="text-xs text-indigo-500 mt-0.5 line-clamp-2">{t.description}</div>
                )}
                {t.category && (
                  <div className="text-xs text-indigo-400 mt-0.5 truncate">
                    {t.category.name || t.category}
                  </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isDownloading ? (
                <button
                  className="p-2 rounded-lg bg-gray-200 text-gray-600 shadow-md"
                  title="Downloading..."
                  disabled
                >
                  <FaSpinner className="animate-spin" size={14} />
                </button>
              ) : isDownloaded ? (
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500 shadow-inner">
                  <FaCheck size={14} />
                </div>
              ) : (
                <button
                  onClick={() => handleDownloadPress(t, audioUrl)}
                  disabled={!audioUrl}
                  className={`p-2 rounded-lg bg-gradient-to-r ${audioUrl ? "from-stone-400 to-stone-500 hover:shadow-lg" : "from-stone-300 to-stone-400 opacity-50 cursor-not-allowed"} text-white shadow-md active:scale-95 transition-all duration-200`}
                  title="Download audio"
                >
                  <FaDownload size={14} />
                </button>
              )}
              <button
                onClick={() => isDownloaded && onSetAlarm?.(t)}
                disabled={!isDownloaded}
                className={`p-2 rounded-lg shadow-md transition-all duration-200 ${
                  isDownloaded ? "bg-gradient-to-r from-saffron-400 to-saffron-500 text-white hover:shadow-glow" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title={isDownloaded ? "Set as Alarm" : "Download first to enable alarm"}
              >
                <FaBell size={14} />
              </button>
              <button
                onClick={() => handlePlay(t)}
                disabled={!audioUrl || isDownloading}
                className={`p-2 rounded-lg text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 ${
                  isPlaying
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : "bg-gradient-to-r from-indigo-400 to-indigo-500"
                } ${(!audioUrl || isDownloading) ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
              </button>
              {/* NEW DEBUG PAUSE BUTTON */}
              <button
                onClick={() => {
                  console.log("⏯️ DEBUG PAUSE BUTTON CLICKED for track:", t.id);
                  sendToNative({
                    type: "PAUSE_AUDIO",
                    trackId: t.id,
                  });
                  console.log("📤 DEBUG PAUSE BUTTON: Dispatched PAUSE_AUDIO to native app for track:", t.id);
                }}
                disabled={!isPlaying || isDownloading} // Only enable if currently playing
                className={`p-2 rounded-lg shadow-md transition-all duration-200 ${isPlaying && !isDownloading ? "bg-gray-700 text-white hover:shadow-lg" : "bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed"}`}
                title="Force Pause (Debug)"
              >
                <FaPause size={14} /> (Debug)
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
