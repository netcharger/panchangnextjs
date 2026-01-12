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
 
              <div className="px-4 py-3 bg-gradient-to-r from-saffron-50 to-indigo-50 border-b border-white/50">
                <h3 className="text-indigo-900 font-bold   text-sm ">
                   {parent.name || parent.title}
                </h3>
       
              </div>
     

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
                          <div className="text-center min-h-[40px] flex items-center justify-center">
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

