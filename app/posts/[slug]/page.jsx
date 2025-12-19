"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug, fetchPostsByCategory } from "../../../lib/api";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaClock, FaArrowLeft, FaTag, FaUser, FaImages } from "react-icons/fa";
import ImagePopup from "../../../components/ImagePopup";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fetch post by slug
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch related posts if post has a category
  const categorySlug = post?.category?.slug || post?.category;
  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["relatedPosts", categorySlug],
    queryFn: () => fetchPostsByCategory(categorySlug),
    enabled: !!categorySlug && !!post,
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
            <p className="text-sm text-indigo-500">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="animate-fade-in">
        <div className="glass rounded-2xl p-8 shadow-soft text-center border border-red-200 bg-red-50">
          <p className="text-red-600 mb-4">Error loading post: {error?.message || "Post not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const postImage = post.featured_image || post.image || post.thumbnail || post.post_image;
  const postTitle = post.title || post.name;
  const postDate = formatDate(post.published_date || post.published_at || post.created_at || post.created || post.date);
  const postContent = post.content || post.body || "";
  const postExcerpt = post.excerpt || "";
  const postCategory = post.category?.name || post.category_name || post.category;
  const postAuthor = typeof post.author === 'string' ? post.author : (post.author?.name || post.author_name || post.author);
  const postTags = post.tags || [];
  const postImages = post.images || [];

  // Filter out current post from related posts
  const filteredRelatedPosts = relatedPosts.filter(p => (p.id || p.slug) !== (post.id || post.slug)).slice(0, 3);

  return (
    <div className="animate-fade-in pb-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-indigo-600 hover:text-saffron-600 transition-colors"
      >
        <FaArrowLeft size={16} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Featured Image */}
      {postImage && (
        <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-6 shadow-lg">
          <Image
            src={postImage}
            alt={postTitle || "Post"}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
      )}

      {/* Post Header */}
      <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-saffron-300/20 to-indigo-300/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          {/* Category Badge and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {postCategory && (
              <div className="inline-flex items-center gap-2">
                <FaTag className="text-saffron-500" size={14} />
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {postCategory}
                </span>
              </div>
            )}
            {postTags.length > 0 && postTags.map((tag) => (
              <Link
                key={tag.id || tag.slug}
                href={`/tags/${tag.slug}`}
                className="text-xs font-medium text-saffron-600 bg-saffron-50 px-3 py-1 rounded-full hover:bg-saffron-100 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-saffron-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {postTitle}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-500">
            {postDate && (
              <div className="flex items-center gap-2">
                <FaClock size={12} />
                <span>{postDate}</span>
              </div>
            )}
            {postAuthor && (
              <div className="flex items-center gap-2">
                <FaUser size={12} />
                <span>{postAuthor}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Excerpt */}
      {postExcerpt && (
        <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50">
          <p className="text-lg leading-relaxed text-indigo-600 italic">
            {postExcerpt}
          </p>
        </div>
      )}

      {/* Post Content */}
      {postContent && (
        <div className="glass rounded-2xl p-6 md:p-8 mb-6 shadow-soft border border-white/50">
          <div 
            className="prose prose-indigo max-w-none text-indigo-700"
            dangerouslySetInnerHTML={{ __html: postContent }}
          />
        </div>
      )}

      {/* Image Gallery */}
      {postImages.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6 shadow-soft border border-white/50">
          <div className="flex items-center gap-2 mb-4">
            <FaImages className="text-saffron-500" size={18} />
            <h2 className="text-xl font-bold text-indigo-700">Gallery</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postImages.map((img) => (
              <div
                key={img.id}
                onClick={() => {
                  setSelectedImage(img);
                  setIsPopupOpen(true);
                }}
                className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-saffron-100 to-indigo-100 cursor-pointer hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98]"
              >
                <Image
                  src={img.image_file}
                  alt={img.caption || postTitle || "Gallery image"}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-xl"
                />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Posts */}
      {filteredRelatedPosts.length > 0 && (
        <div className="glass rounded-2xl p-6 shadow-soft border border-white/50">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">Related Posts</h2>
          <div className="space-y-3">
            {filteredRelatedPosts.map((relatedPost) => {
              const relatedImage = relatedPost.image || relatedPost.thumbnail || relatedPost.featured_image;
              const relatedTitle = relatedPost.title || relatedPost.name;
              const relatedSlug = relatedPost.slug || relatedPost.id;
              const relatedUrl = relatedPost.slug ? `/posts/${relatedPost.slug}` : `/posts/${relatedPost.id}`;

              return (
                <Link
                  href={relatedUrl}
                  key={relatedPost.id || relatedPost.slug}
                  className="group block"
                >
                  <div className="glass rounded-xl overflow-hidden shadow-soft border border-white/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
                    <div className="flex gap-4">
                      {/* Related Post Image */}
                      {relatedImage && (
                        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-gradient-to-br from-saffron-100 to-indigo-100">
                          <Image
                            src={relatedImage}
                            alt={relatedTitle || "Post"}
                            fill
                            style={{ objectFit: "cover" }}
                            className="group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Related Post Content */}
                      <div className="flex-1 flex flex-col justify-center p-3 min-w-0">
                        <h3 className="text-sm font-bold text-indigo-700 group-hover:text-saffron-600 transition-colors line-clamp-2">
                          {relatedTitle}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Popup */}
      <ImagePopup
        image={selectedImage}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedImage(null);
        }}
      />
    </div>
  );
}

