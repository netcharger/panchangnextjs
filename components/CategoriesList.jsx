"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import clsx from "clsx";
import { getImageSize } from "../lib/image_sizes";
export default function CategoriesList({ categories = [] }) {
  // Get parent categories (categories with parent: null)
  const parentCategories = categories.filter(cat => !cat.parent || cat.parent === null);

  // State to track which parent categories are expanded
  const [expandedParents, setExpandedParents] = useState({});

  const toggleParent = (parentId) => {
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  if (categories.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 shadow-soft text-center">
        <p className="text-indigo-500">No categories available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parentCategories.map((parent) => {
        const parentId = parent.id;
        // Get children from the children array
        const subCategories = (parent.children && Array.isArray(parent.children)) ? parent.children : [];
        const isExpanded = expandedParents[parentId];

        return (
          <div
            key={parentId}
            className="glass rounded-2xl overflow-hidden shadow-soft border border-white/50"
          >
            {/* Parent Category Header */}
            <div
              className={clsx(
                "p-4 cursor-pointer transition-all duration-200",
                subCategories.length > 0 && "hover:bg-white/50"
              )}
              onClick={() => subCategories.length > 0 && toggleParent(parentId)}
            >
              <div className="flex items-center gap-3">
                {/* Parent Category Image */}
                {(parent.category_image || parent.image) && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageSize(parent.category_image, "category", "thumb")}
                      alt={parent.name || parent.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 hover:scale-110"
                    />


                  </div>
                )}

                {/* Parent Category Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={parent.slug ? `/categories/${parent.slug}` : '/categories'}
                    onClick={(e) => e.stopPropagation()}
                    className="block"
                  >
                    <h3 className="text-lg font-bold text-indigo-700 hover:text-saffron-600 transition-colors">
                      {parent.name || parent.title}
                    </h3>
                  </Link>
                  {parent.description && (
                    <p className="text-sm text-indigo-500 mt-1 line-clamp-1">
                      {parent.description}
                    </p>
                  )}
                  {subCategories.length > 0 && (
                    <p className="text-xs text-indigo-400 mt-1">
                      {subCategories.length} subcategor{subCategories.length === 1 ? 'y' : 'ies'}
                    </p>
                  )}
                </div>

                {/* Expand/Collapse Icon */}
                {subCategories.length > 0 && (
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <FaChevronDown className="text-indigo-500" size={18} />
                    ) : (
                      <FaChevronRight className="text-indigo-500" size={18} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Subcategories List */}
            {subCategories.length > 0 && (
              <div
                className={clsx(
                  "overflow-hidden transition-all duration-300",
                  isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="px-4 pb-4 pt-2 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-3">
                    {subCategories.map((subCat) => (
                      <Link
                        key={subCat.id}
                        href={subCat.slug ? `/categories/${subCat.slug}` : '#'}
                        className="group"
                      >
                        <div className="glass rounded-xl p-3 hover:shadow-md transition-all duration-200 active:scale-95 border border-white/30">
                          {(subCat.category_image || subCat.image) && (
                            <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2">
                              <Image
                                src={subCat.category_image || subCat.image}
                                alt={subCat.name || subCat.title}
                                fill
                                style={{ objectFit: "cover" }}
                                className="group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                            </div>
                          )}
                          <h4 className="text-sm font-semibold text-indigo-700 group-hover:text-saffron-600 transition-colors">
                            {subCat.name || subCat.title}
                          </h4>
                          {subCat.description && (
                            <p className="text-xs text-indigo-500 mt-1 line-clamp-2">
                              {subCat.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

