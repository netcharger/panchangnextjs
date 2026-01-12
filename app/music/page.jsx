"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchMusicCategories } from "../../lib/api.js";
import MusicList from "../../components/MusicList";
import MusicCategoriesRow from "../../components/MusicCategoriesRow";
import { sendToNative } from "../../lib/webviewBridge.js";
import { FaMusic } from "react-icons/fa";

export default function MusicPage() {
  // Fetch music categories from Django API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["music-categories"],
    queryFn: fetchMusicCategories,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  function onSetAlarm(track) {
    sendToNative({ type: "SET_ALARM_WITH_TRACK", trackId: track.id, trackTitle: track.title });
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-pink-400/20 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <FaMusic className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Music
        </h1>
              <p className="text-sm text-indigo-500 mt-0.5">Panchangam devotional music</p>
            </div>
          </div>
        </div>
      </div>

      {/* Music Categories Row */}
      {categoriesLoading ? (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4 px-1">
            <h3 className="text-lg font-bold text-indigo-700">Categories</h3>
          </div>
          <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm text-indigo-500">Loading categories...</p>
            </div>
          </div>
        </div>
      ) : categories.length > 0 ? (
        <MusicCategoriesRow categories={categories} />
      ) : null}

      {/* Music List */}
      <div className="glass rounded-2xl p-8 shadow-soft text-center">
        <p className="text-indigo-500">No tracks available</p>
      </div>
    </div>
  );
}
