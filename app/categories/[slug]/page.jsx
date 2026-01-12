"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPostsByCategory, fetchCategories } from "../../../lib/api.js";
import PostsGrid from "../../../components/PostsGrid";
import { useParams } from "next/navigation";

export default function CategoryPostsPage() {
  const params = useParams();
  const categorySlug = params?.slug;

  // Fetch posts by category
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["posts", categorySlug],
    queryFn: () => fetchPostsByCategory(categorySlug),
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch categories to get category name
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  // Find the category to get its name (search in both parent and child categories)
  let category = categories.find(cat => cat.slug === categorySlug);

  // If not found in parent categories, search in children
  if (!category) {
    for (const parent of categories) {
      if (parent.children && Array.isArray(parent.children)) {
        const child = parent.children.find(child => child.slug === categorySlug);
        if (child) {
          category = child;
          break;
        }
      }
    }
  }

  const categoryName = category?.name || category?.title || categorySlug;
  console.log(`/api/posts/posts/?category=${categorySlug}`);
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-saffron-600 to-indigo-600 bg-clip-text text-transparent">
          {categoryName}
        </h1>
        <p className="text-sm text-indigo-500 mt-1">Posts in this category</p>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
            <p className="text-sm text-indigo-500">Loading posts...</p>
          </div>
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-red-200 bg-red-50">
          <p className="text-red-600">Error loading posts: {error.message}</p>
        </div>
      ) : (
        <PostsGrid posts={posts} />
      )}
    </div>
  );
}

