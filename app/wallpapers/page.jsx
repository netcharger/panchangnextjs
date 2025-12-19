"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWallpaperMainCategories } from "../../lib/api";
import Link from "next/link";
import { FaImages, FaChevronRight } from "react-icons/fa";

export default function WallpapersPage() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["wallpaper-main-categories"],
    queryFn: fetchWallpaperMainCategories,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <div className="animate-fade-in pb-8">
      {/* Beautiful Header with Gradient */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-indigo-400/20 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <FaImages className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
           వాల్ పేపర్స్
              </h1>
              <p className="text-sm text-indigo-500 mt-0.5">మొబైల్ వాల్ పేపర్ సెట్  చేసుకోండి</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Categories Grid */}
      {isLoading ? (
        <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-sm text-indigo-500">Loading categories...</p>
          </div>
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-red-200 bg-red-50">
          <p className="text-red-600">Error loading categories: {error.message}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center">
          <p className="text-indigo-500">No wallpaper categories available</p>
        </div>
      ) : (
        <div className="space-y-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/wallpapers/${category.id}`}
            className="block"
          >
            <div className="
                glass
                rounded-xl
                px-4 py-4
                shadow-soft
                border border-white/40
                hover:shadow-lg
                hover:bg-gradient-to-r hover:from-purple-50/40 hover:to-pink-50/40
                transition-all
                duration-200
                flex
                items-center
                justify-between
            ">

              {/* Category Name + Count */}
              <div>
                <h3 className="text-base font-semibold text-indigo-700 group-hover:text-purple-600 transition-colors">
                  {category.name || category.title}
                </h3>

                {category.wallpaper_count !== undefined && (
                  <p className="text-xs text-purple-600 mt-1">
                    {category.wallpaper_count} wallpapers
                  </p>
                )}
              </div>

              {/* Arrow Icon */}
              <div className="
                p-2
                rounded-lg
                bg-gradient-to-r
                from-purple-400
                to-pink-500
                text-white
                shadow
                group-hover:scale-110
                transition-transform
              ">
                <FaChevronRight size={14} />
              </div>

            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
