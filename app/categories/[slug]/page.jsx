"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../../../lib/api.js";
import PostsGrid from "../../../components/PostsGrid";
import { useParams } from "next/navigation";

const PAGE_SIZE = 20;

async function loadPostsFromAPI(categorySlug, page = 1) {
  // Use NEXT_PUBLIC_API_BASE which is available on the client at runtime
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || process.env.DJANGO_BACKEND_URL || "https://api.dailypanchangam.com";
  const url = `${baseUrl}/api/posts/posts/?category=${categorySlug}&page=${page}&page_size=${PAGE_SIZE}`;
  console.log("🌐 Fetching category posts from:", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return {
    posts: Array.isArray(data) ? data : (data.results || data.data || []),
    count: data.count || 0,
    next: data.next || null,
  };
}

export default function CategoryPostsPage() {
  const params = useParams();
  const categorySlug = params?.slug;

  const [allPosts, setAllPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(null);

  // Initial load + reset when slug changes
  useEffect(() => {
    if (!categorySlug) return;
    setAllPosts([]);
    setPage(1);
    setHasNextPage(false);
    setError(null);
    setIsLoading(true);

    loadPostsFromAPI(categorySlug, 1)
      .then((result) => {
        setAllPosts(result.posts);
        setHasNextPage(!!result.next);
        setPage(2);
        console.log(`✅ Loaded ${result.posts.length} posts (total: ${result.count})`);
      })
      .catch((err) => {
        console.error("❌ Error loading posts:", err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [categorySlug]);

  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasNextPage) return;
    setIsFetchingMore(true);
    try {
      const result = await loadPostsFromAPI(categorySlug, page);
      setAllPosts((prev) => [...prev, ...result.posts]);
      setHasNextPage(!!result.next);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error loading more posts:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [categorySlug, page, isFetchingMore, hasNextPage]);

  // Fetch categories to get category name
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  // Find the category name
  let category = categories.find((cat) => cat.slug === categorySlug);
  if (!category) {
    for (const parent of categories) {
      if (parent.children && Array.isArray(parent.children)) {
        const child = parent.children.find((c) => c.slug === categorySlug);
        if (child) { category = child; break; }
      }
    }
  }
  const categoryName = category?.name || category?.title || categorySlug;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-saffron-600 to-indigo-600 bg-clip-text text-transparent">
          {categoryName}
        </h1>
        <p className="text-sm text-indigo-500 mt-1">
          {allPosts.length > 0 ? `${allPosts.length} posts loaded` : "Posts in this category"}
        </p>
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
          <p className="text-red-600">Error loading posts: {error}</p>
          <p className="text-xs text-red-400 mt-2">Check browser console for details</p>
        </div>
      ) : (
        <>
          <PostsGrid posts={allPosts} />

          {/* Load More / End */}
          <div className="py-8 flex justify-center">
            {isFetchingMore ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
                <p className="text-xs text-indigo-500">Loading more posts...</p>
              </div>
            ) : hasNextPage ? (
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-gradient-to-r from-saffron-500 to-indigo-500 hover:from-saffron-600 hover:to-indigo-600 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-md active:scale-95"
              >
                Load More Posts
              </button>
            ) : allPosts.length > 0 ? (
              <p className="text-sm text-indigo-400">You&apos;ve seen all posts</p>
            ) : (
              <p className="text-sm text-indigo-400">No posts found in this category</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
