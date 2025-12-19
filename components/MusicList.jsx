"use client";

import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaBell, FaDownload } from "react-icons/fa";
import { sendToNative, onNativeMessage } from "../lib/webviewBridge";
import getBaseURL from "../lib/getBaseURL";

export default function MusicList({ tracks = [], onSetAlarm }) {
  const [playingId, setPlayingId] = useState(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null);
  const [downloadedTrackIds, setDownloadedTrackIds] = useState([]);

  useEffect(() => {
    const cleanup = onNativeMessage((payload) => {
      if (payload?.type === "TRACK_DOWNLOADED" && payload.trackId) {
        setDownloadedTrackIds((prev) =>
          prev.includes(payload.trackId) ? prev : [...prev, payload.trackId]
        );
      }
    });
    return cleanup;
  }, []);
  const audioRef = useRef(null);

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
    const rawAudioUrl = track.mp3_file || track.audio_file || track.url;
    const audioUrl = getFullAudioUrl(rawAudioUrl);
    
    if (!audioUrl) {
      console.error("No audio URL found for track:", track);
      console.error("Track data:", track);
      return;
    }

    console.log("Playing audio from URL:", audioUrl);

    // If same track is clicked, pause it
    if (playingId === track.id) {
      setPlayingId(null);
      setPlayingAudioUrl(null);
      
      // Pause and cleanup browser audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
      
      // Send pause message to native app if in WebView
      sendToNative({
        type: "PAUSE_AUDIO",
        trackId: track.id,
      });
      return;
    }

    if (!downloadedTrackIds.includes(track.id)) {
      setDownloadedTrackIds((prev) => [...prev, track.id]);
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

  return (
    <div className="space-y-3">
      {tracks.map((t, idx) => {
        const isPlaying = playingId === t.id;
        const rawAudioUrl = t.mp3_file || t.audio_file || t.url;
        const audioUrl = getFullAudioUrl(rawAudioUrl);
        
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
              {onSetAlarm && downloadedTrackIds.includes(t.id) ? (
                <button
                  onClick={() => onSetAlarm(t)}
                  className="p-2 rounded-lg bg-gradient-to-r from-saffron-400 to-saffron-500 text-white shadow-md hover:shadow-glow active:scale-95 transition-all duration-200"
                  title="Set as Alarm"
                >
                  <FaBell size={14} />
                </button>
              ) : (
                <button
                  onClick={() => handlePlay(t)}
                  disabled={!audioUrl}
                  className={`p-2 rounded-lg bg-gradient-to-r ${audioUrl ? "from-stone-400 to-stone-500 hover:shadow-lg" : "from-stone-300 to-stone-400 opacity-50 cursor-not-allowed"} text-white shadow-md active:scale-95 transition-all duration-200`}
                  title="Download audio"
                >
                  <FaDownload size={14} />
                </button>
              )}
              <button 
                  onClick={() => handlePlay(t)}
                  disabled={!audioUrl}
                  className={`p-2 rounded-lg text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 ${
                    isPlaying 
                      ? "bg-gradient-to-r from-red-400 to-red-500" 
                      : "bg-gradient-to-r from-indigo-400 to-indigo-500"
                  } ${!audioUrl ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
