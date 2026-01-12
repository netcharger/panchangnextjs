"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchMusicCategoryBySlug, fetchAudioFilesByCategory } from "../../../lib/api.js";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaChevronLeft, FaMusic, FaHeadphones } from "react-icons/fa";
import { getImageSize } from "../../../lib/image_sizes";
import MusicList from "../../../components/MusicList";
import { sendToNative } from "../../../lib/webviewBridge.js";
import getBaseURL from "../../../lib/getBaseURL.js";

export default function MusicCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.slug;
  const [mounted, setMounted] = useState(false);

  // Fetch category with subcategories
  const { data: category, isLoading, error } = useQuery({
    queryKey: ["music-category", categorySlug],
    queryFn: () => fetchMusicCategoryBySlug(categorySlug),
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const subCategories = category?.children || [];
  const hasSubCategories = subCategories.length > 0;

  // Fetch audio files if this category has no subcategories (it's a subcategory itself)
  // Always try to fetch if no subcategories, regardless of audio_file_count
  const { data: audioFiles = [], isLoading: audioFilesLoading, error: audioFilesError } = useQuery({
    queryKey: ["audio-files", categorySlug],
    queryFn: () => fetchAudioFilesByCategory(categorySlug),
    enabled: !!categorySlug && !!category && !hasSubCategories,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    if (category) {
      console.log("Category data:", category);
      console.log("Has subcategories:", hasSubCategories);
      console.log("Audio file count:", category.audio_file_count);
      console.log("Category slug:", categorySlug);
    }
  }, [category, hasSubCategories, categorySlug]);

  useEffect(() => {
    if (audioFiles.length > 0) {
      console.log("Audio files loaded:", audioFiles);
    }
    if (audioFilesError) {
      console.error("Audio files error:", audioFilesError);
    }
  }, [audioFiles, audioFilesError]);

  const buildFullAudioUrl = (rawUrl) => {
    if (!rawUrl) return null;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    const baseURL = getBaseURL();
    const cleanUrl = rawUrl.startsWith("/") ? rawUrl.substring(1) : rawUrl;
    return `${baseURL.replace(/\/$/, "")}/${cleanUrl}`;
  };

  function onSetAlarm(track, audioUrl) {
    const resolvedAudioUrl =
      audioUrl || buildFullAudioUrl(track.mp3_file || track.audio_file || track.url);

    sendToNative({
      type: "SET_ALARM_WITH_TRACK",
      trackId: track.id,
      trackTitle: track.title || track.name,
      audioUrl: resolvedAudioUrl,
    });
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-pink-400/20 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors text-indigo-600"
              aria-label="Go back"
            >
              <FaChevronLeft size={16} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <FaMusic className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {mounted && category ? (category.name || category.title || "Category") : "Category"}
              </h1>
              <p className="text-sm text-indigo-500 mt-0.5">
                {mounted && category && category.audio_file_count > 0 && `${category.audio_file_count} audio files`}
                {mounted && hasSubCategories && ` • ${subCategories.length} subcategories`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm text-indigo-500">Loading category...</p>
          </div>
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-red-200 bg-red-50">
          <p className="text-red-600">Error loading category: {error.message}</p>
        </div>
      ) : !category ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center">
          <p className="text-indigo-500">Category not found</p>
        </div>
      ) : (
        <>
          {/* Sub Categories Grid */}
          {hasSubCategories && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-indigo-700">Sub Categories</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {subCategories.map((subCategory) => {
                  const subCategoryImage = subCategory.image || subCategory.category_image || subCategory.thumbnail;
                  const imageUrl = subCategoryImage 
                    ? getImageSize(subCategoryImage, "category", "medium") 
                    : null;

                  return (
                    <Link
                      key={subCategory.id}
                      href={`/music/${subCategory.slug || subCategory.id}`}
                      className="group block"
                    >
                      <div className="glass rounded-2xl overflow-hidden shadow-soft border border-white/50 hover:shadow-lg transition-all duration-200 active:scale-95">
                        {/* Category Image or Placeholder */}
                        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={subCategory.name || subCategory.title || "Sub Category"}
                              fill
                              style={{ objectFit: "cover" }}
                              className="group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                              <FaHeadphones className="text-white" size={32} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h4 className="text-white font-bold text-base drop-shadow-lg">
                              {subCategory.name || subCategory.title}
                            </h4>
                            {subCategory.audio_file_count > 0 && (
                              <p className="text-white/90 text-xs mt-1 drop-shadow-md">
                                {subCategory.audio_file_count} tracks
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audio Files List - Show if no subcategories */}
          {!hasSubCategories && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-indigo-700">Audio Files</h3>
                {audioFiles.length > 0 && (
                  <span className="text-sm text-indigo-500">{audioFiles.length} tracks</span>
                )}
              </div>
              {audioFilesLoading ? (
                <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[200px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-indigo-500">Loading audio files...</p>
                  </div>
                </div>
              ) : audioFilesError ? (
                <div className="glass rounded-2xl p-8 shadow-soft text-center border border-red-200 bg-red-50">
                  <p className="text-red-600">Error loading audio files: {audioFilesError.message}</p>
                </div>
              ) : audioFiles.length > 0 ? (
                <MusicList tracks={audioFiles} onSetAlarm={onSetAlarm} />
              ) : (
                <div className="glass rounded-2xl p-8 shadow-soft text-center">
                  <p className="text-indigo-500">No audio files available in this category</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

