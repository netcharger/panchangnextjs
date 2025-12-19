"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPostsByTag } from "../../../lib/api";
import PostsGrid from "../../../components/PostsGrid";
import { useParams } from "next/navigation";

export default function TagPostsPage() {
  const params = useParams();
  const tagSlug = params?.slug;

  // Fetch posts by tag
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["postsByTag", tagSlug],
    queryFn: () => fetchPostsByTag(tagSlug),
    enabled: !!tagSlug,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Extract tag name from first post's tags (if available)
  const tagName = posts.length > 0 && posts[0]?.tags?.find(tag => tag.slug === tagSlug)?.name || tagSlug;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-saffron-600 to-indigo-600 bg-clip-text text-transparent">
          #{tagName}
        </h1>
        <p className="text-sm text-indigo-500 mt-1">Posts tagged with "{tagName}"</p>
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







