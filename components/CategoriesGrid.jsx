"use client";

import Link from "next/link";
import Image from "next/image";
import { getImageSize } from "../lib/image_sizes";
export default function CategoriesGrid({ categories = [], limit = 4 }) {
  // Get parent categories (categories with parent: null)
  const parentCategories = categories
    .filter(cat => !cat.parent || cat.parent === null)
    .slice(0, limit);

  if (parentCategories.length === 0) {
    return null;
  }

  return (
    <div >
      {parentCategories.map((parent) => {
        const children = (parent.children && Array.isArray(parent.children)) ? parent.children : [];
        const parentImageUrl = parent.category_image || parent.image;

        return (
          <div
            key={parent.id}
            className="glass rounded-xl overflow-hidden shadow-soft mb-5 border border-white/50 hover:shadow-lg transition-all duration-200"
          >
            {/* Parent Category Header */}
            <Link
              href={parent.slug ? `/categories/${parent.slug}` : '/categories'}
              className="group block"
            >
              <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-saffron-100 to-indigo-100">
                {parentImageUrl ? (
                  <Image
                    src={getImageSize(parentImageUrl, "category", "medium")}
                    alt={parent.name || parent.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-saffron-200 to-indigo-200">
                    <span className="text-4xl text-indigo-600">📿</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg drop-shadow-lg">
                    {parent.name || parent.title}
                  </h3>
                  {parent.description && (
                    <p className="text-white/90 text-xs mt-1 line-clamp-1 drop-shadow-md">
                      {parent.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>

            {/* Subcategories Grid */}
            {children.length > 0 && (
              <div className="p-3">
                <div className="grid grid-cols-5 gap-2">
                  {children.map((child) => {
                    const childImageUrl = child.category_image || child.image;

                    return (
                      <Link
                        key={child.id}
                        href={child.slug ? `/categories/${child.slug}` : '#'}
                        className="group"
                      >
                        <div className="glass rounded-xl overflow-hidden border border-white/30 hover:shadow-md transition-all duration-200 active:scale-95">
                          {/* Subcategory Image */}
                          <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-saffron-50 to-indigo-50">
                            {childImageUrl ? (
                              <Image
                                src={getImageSize(childImageUrl, "category", "thumb")}
                                alt={child.name || child.title}
                                fill
                                style={{ objectFit: "cover" }}
                                className="group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-saffron-100 to-indigo-100">
                                <span className="text-2xl text-indigo-600">📿</span>
                              </div>
                            )}
                            {childImageUrl && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                            )}
                          </div>

                          {/* Subcategory Name */}
                          <div className="p-2 text-center min-h-[40px] flex items-center justify-center">
                            <h4 className="text-xs font-semibold text-indigo-700 group-hover:text-saffron-600 transition-colors line-clamp-2">
                              {child.name || child.title}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

