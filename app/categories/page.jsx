"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchCategories } from "../../lib/api.js";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { getImageSize } from "../../lib/image_sizes.js";

export default function CategoriesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories with error handling and retry logic
  const { 
    data: categories = [], 
    isLoading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    retry: 2, // Retry 2 times on failure
    retryDelay: 1000, // Wait 1 second between retries
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Get parent categories for sidebar
  const parentCategories = categories.filter(cat => !cat.parent || cat.parent === null);

  // Get subcategories of selected category
  const subCategories = selectedCategory 
    ? (selectedCategory.children || [])
    : [];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Auto-select first category when categories load
  useEffect(() => {
    if (parentCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(parentCategories[0]);
    }
  }, [parentCategories, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Categories</h1>
            <button
              className="p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaSearch size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Main Categories */}
        <div className="w-24 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="py-2">


            {/* Category Items */}
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
              </div>
            ) : categoriesError ? (
              <div className="flex flex-col items-center justify-center py-8 px-2">
                <span className="text-2xl mb-2">⚠️</span>
                <p className="text-xs text-gray-500 text-center">Failed to load</p>
                <button
                  onClick={() => refetchCategories()}
                  className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded"
                >
                  Retry
                </button>
              </div>
            ) : parentCategories.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-gray-500">No categories</p>
              </div>
            ) : (
              parentCategories.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              const subCategories = category.children || [];
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full py-4 px-2 flex flex-col items-center gap-2 transition-colors ${
                    isSelected
                      ? "bg-green-50 border-l-4 border-green-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                    isSelected ? "bg-green-500" : "bg-gray-200"
                  }`}>
                    {(category.category_image || category.image) ? (
                      <Image
                        src={getImageSize(category.category_image || category.image, "category", "thumb")}
                        alt={category.name || category.title}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white text-lg">📁</span>
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${
                    isSelected ? "text-green-600" : "text-gray-600"
                  }`}>
                    {category.name || category.title}
                  </span>
                </button>
              );
            })
            )}
          </div>
        </div>

        {/* Right Content Area - Subcategories */}
        <div className="flex-1 overflow-y-auto bg-gray-50" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Promotional Banner */}
          {!selectedCategory && (
            <div className="mx-4 mt-4 mb-6 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <h2 className="text-2xl font-bold text-green-800 mb-1">Explore Categories</h2>
              <p className="text-sm text-green-700/80">Select a category to view subcategories</p>
            </div>
          )}

          {/* Selected Category Banner */}
          {selectedCategory && (
            <div className="mx-4 mt-4 mb-6 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <h2 className="text-2xl font-bold text-green-800 mb-1">
                {selectedCategory.name || selectedCategory.title}
              </h2>
              {selectedCategory.description && (
                <p className="text-sm text-green-700/80 line-clamp-2">{selectedCategory.description}</p>
              )}
            </div>
          )}

          {/* Subcategories Grid */}
          <div className="px-4 pb-6">
            {categoriesLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-500">Loading categories...</p>
              </div>
            ) : categoriesError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">Failed to load categories</p>
                <p className="text-xs text-gray-500 mb-4 text-center px-4">
                  {categoriesError?.message || 'Network error. Please check your connection.'}
                </p>
                <button
                  onClick={() => refetchCategories()}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <p className="text-sm text-gray-500">No categories available</p>
              </div>
            ) : !selectedCategory ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Select a category from the sidebar to view subcategories</p>
              </div>
            ) : subCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No subcategories available in this category</p>
        </div>
      ) : (
              <div className="grid grid-cols-2 gap-4">
                {subCategories.map((subCategory) => {
                  const subCatImage = subCategory.category_image || subCategory.image;
                  const subCatTitle = subCategory.name || subCategory.title;
                  const subCatSlug = subCategory.slug;

                  return (
                    <Link
                      key={subCategory.id}
                      href={subCatSlug ? `/categories/${subCatSlug}` : '#'}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {subCatImage ? (
                          <Image
                            src={getImageSize(subCatImage, "category", "thumb") || subCatImage}
                            alt={subCatTitle || "Subcategory"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                            <span className="text-3xl">📁</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
                          {subCatTitle}
                        </h3>
                        {subCategory.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {subCategory.description}
                          </p>
      )}

                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
