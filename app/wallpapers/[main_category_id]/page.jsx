"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWallpaperSubCategories, fetchWallpaperMainCategories } from "../../../lib/api.js";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaImages, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function WallpaperSubCategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const mainCategoryId = params?.main_category_id;

  // Fetch sub categories
  const { data: subCategories = [], isLoading, error } = useQuery({
    queryKey: ["wallpaper-sub-categories", mainCategoryId],
    queryFn: () => fetchWallpaperSubCategories(mainCategoryId),
    enabled: !!mainCategoryId,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch main category info
  const { data: mainCategories = [] } = useQuery({
    queryKey: ["wallpaper-main-categories"],
    queryFn: fetchWallpaperMainCategories,
    staleTime: 1000 * 60 * 5,
  });

  const mainCategory = mainCategories.find(cat => String(cat.id) === String(mainCategoryId));

  console.log('Main category ID:', mainCategoryId);
  console.log('Sub categories:', subCategories);
  console.log('Main category:', mainCategory);

  return (
    <div className="animate-fade-in pb-8">
      {/* Beautiful Header with Gradient */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-pink-400/20 opacity-50"></div>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <FaImages className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {mainCategory?.name || mainCategory?.title || "Sub Categories"}
              </h1>
              <p className="text-sm text-indigo-500 mt-0.5">Choose a sub category</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Categories Grid */}
      {isLoading ? (
        <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm text-indigo-500">Loading sub categories...</p>
          </div>
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-red-200 bg-red-50">
          <p className="text-red-600">Error loading sub categories: {error.message}</p>
        </div>
      ) : subCategories.length === 0 ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center">
          <p className="text-indigo-500 mb-2">No sub categories available</p>
          <p className="text-xs text-indigo-400">Main Category ID: {mainCategoryId}</p>
        </div>
      ) : (
        <div className="space-y-3">
        {subCategories.map((subCategory) => (
          <Link
            key={subCategory.id}
            href={`/wallpapers/${mainCategoryId}/${subCategory.id}`}
            className="block group"
          >
            <div
              className="
                glass
                rounded-xl
                px-4 py-4
                shadow-soft
                border border-white/40
                hover:shadow-lg
                hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50
                transition-all duration-200
                flex items-center justify-between
              "
            >
              <div className="w-[80%]">
                <h3 className="text-base font-semibold text-blue-700 group-hover:text-purple-600 transition-colors">
                  {subCategory.name || subCategory.title}
                </h3>

                {subCategory.description && (
                  <p className="text-xs text-blue-500 mt-1 line-clamp-2">
                    {subCategory.description}
                  </p>
                )}
              </div>

              <div
                className="
                  p-2 rounded-lg
                  bg-gradient-to-r
                  from-blue-500
                  to-purple-500
                  text-white shadow
                  group-hover:scale-110 transition-transform
                "
              >
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

