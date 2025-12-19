"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageSize } from "../lib/image_sizes";
import { FaMusic } from "react-icons/fa";

export default function MusicCategoriesRow({ categories = [] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4 px-1">
        <h3 className="text-lg font-bold text-indigo-700">Categories</h3>
      </div>
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-4 min-w-max">
          {categories.map((category) => {
            const categoryImage = category.image || category.category_image || category.thumbnail;
            const imageUrl = categoryImage 
              ? getImageSize(categoryImage, "category", "medium") 
              : null;

            return (
              <Link
                key={category.id}
                href={`/music/${category.slug || category.id}`}
                className="group flex-shrink-0"
              >
                <div className="relative w-32 h-40 rounded-2xl overflow-hidden shadow-soft border border-white/50 hover:shadow-lg transition-all duration-200 active:scale-95">
                  {/* Category Image or Placeholder */}
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={category.name || category.title || "Category"}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center">
                      <FaMusic className="text-white" size={32} />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Category Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-semibold text-sm drop-shadow-lg line-clamp-2">
                      {category.name || category.title}
                    </h4>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}









