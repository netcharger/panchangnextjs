"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchWallpapers, fetchWallpaperSubCategories, fetchWallpaperMainCategories, fetchWallpapersNextPage } from "../../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import { FaChevronLeft, FaImages } from "react-icons/fa";
import WallpaperGrid from "../../../../components/WallpaperGrid";
import { useEffect, useRef } from "react";

export default function WallpapersGridPage() {
  const params = useParams();
  const router = useRouter();
  const mainCategoryId = params?.main_category_id;
  const subCategoryId = params?.sub_category_id;
  const observerTarget = useRef(null);

  // Fetch wallpapers with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["wallpapers", mainCategoryId, subCategoryId],
    queryFn: ({ pageParam = 1 }) => {
      if (typeof pageParam === 'string' && pageParam.startsWith('http')) {
        // Use the next URL directly
        return fetchWallpapersNextPage({ pageParam, queryKey: ["wallpapers", mainCategoryId, subCategoryId] });
      }
      return fetchWallpapers(mainCategoryId, subCategoryId, pageParam, 20);
    },
    getNextPageParam: (lastPage) => {
      // Return the next URL if available, otherwise undefined (no more pages)
      if (!lastPage) return undefined;
      return lastPage.next || undefined;
    },
    enabled: !!mainCategoryId && !!subCategoryId,
    staleTime: 1000 * 60 * 5,
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const wallpapers = data?.pages?.flatMap(page => page?.wallpapers || []) || [];
  const totalCount = data?.pages?.[0]?.count || 0;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fetch category info
  const { data: mainCategories = [] } = useQuery({
    queryKey: ["wallpaper-main-categories"],
    queryFn: fetchWallpaperMainCategories,
    staleTime: 1000 * 60 * 5,
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ["wallpaper-sub-categories", mainCategoryId],
    queryFn: () => fetchWallpaperSubCategories(mainCategoryId),
    enabled: !!mainCategoryId,
    staleTime: 1000 * 60 * 5,
  });

  const mainCategory = mainCategories.find(cat => cat.id == mainCategoryId);
  const subCategory = subCategories.find(cat => cat.id == subCategoryId);

  return (
    <div className="animate-fade-in pb-8">
      {/* Beautiful Header with Gradient */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-indigo-400/20 opacity-50"></div>
        <div className="relative z-10">

          <div className="flex items-center gap-3 mb-2">
                      {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-4 p-2 rounded-lg hover:bg-white/50 transition-colors text-indigo-600"
            aria-label="Go back"
          >
            <FaChevronLeft size={16} />
          </button>

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
              <FaImages className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {subCategory?.name || subCategory?.title || "Wallpapers"}
              </h1>
              <p className="text-sm text-indigo-500 mt-0.5">
                {mainCategory?.name && `${mainCategory.name} • `}
                {totalCount > 0 && `${totalCount} wallpapers`}
                {wallpapers.length > 0 && ` (${wallpapers.length} loaded)`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallpapers Grid */}
      {isLoading ? (
        <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <p className="text-sm text-indigo-500">Loading wallpapers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-red-200 bg-red-50">
          <p className="text-red-600">Error loading wallpapers: {error.message}</p>
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center">
          <p className="text-indigo-500">No wallpapers available in this category</p>
        </div>
      ) : (
        <>
          <WallpaperGrid wallpapers={wallpapers} masonry={true}  />

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                <p className="text-xs text-indigo-500">Loading more wallpapers...</p>
              </div>
            )}
            {!hasNextPage && wallpapers.length > 0 && (
              <p className="text-sm text-indigo-400 text-center">
                All wallpapers loaded
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

