"use client";

import Image from "next/image";
import Link from "next/link";
import { FaClock, FaTag, FaFolder } from "react-icons/fa";
import { getImageSize } from "../lib/image_sizes.js";
export default function PostsGrid({ posts = [] }) {

  if (posts.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 shadow-soft text-center border border-white/50">
        <p className="text-indigo-500">No posts available</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const postImage = post.image || post.thumbnail || post.featured_image || post.post_image;
        const postTitle = post.title || post.name;
        const postSlug = post.slug || post.id;
        const postUrl = `/posts/id/${post.id}`;
        const postDate = formatDate(post.published_date || post.published_at || post.created_at || post.created || post.date);
        const postTags = post.tags || [];
        // Extract category - handle both object and string formats
        const postCategory = post.category?.name || post.category_name || (typeof post.category === 'string' ? post.category : null);
        const categorySlug = post.category?.slug || (typeof post.category === 'string' ? post.category : null);

        return (
          <Link
            href={`/posts/id/${post.id}`}
            key={post.id || post.slug}
            className="group block"
          >
            <div className="glass rounded-sm overflow-hidden shadow-soft border border-white/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
              <div className="flex gap-4">
                {/* Post Image - Left Side */}
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-gradient-to-br from-saffron-100 to-indigo-100">
                  {postImage ? (
                      <Image
                        src={getImageSize(postImage, "post", "thumb") || postImage}
                        alt={postTitle || "Post"}
                        fill
                        style={{ objectFit: "cover" }}
                        className="tiny group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to original image if sized version fails
                          if (e.target.src !== postImage) {
                            e.target.src = postImage;
                          }
                        }}
                      />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-saffron-200 to-indigo-200">
                      <span className="text-2xl text-indigo-600">📿</span>
                    </div>
                  )}
                </div>

                {/* Post Content - Right Side */}
                <div className="flex-1 flex flex-col  pl-2 pt-3 min-w-0">
                  {postTitle && (
                    <h3 className="text-base font-bold text-indigo-700 group-hover:text-saffron-600 transition-colors line-clamp-2 mb-2">
                      {postTitle}
                    </h3>
                  )}

                  {postDate && (
                    <div className="flex items-center gap-2 text-xs text-indigo-500 mb-2">
                      <FaClock size={12} />
                      <span>{postDate}</span>
                    </div>
                  )}
                  {/* Category Badge */}
                  {postCategory && (
                    <div className="flex items-center gap-1 mb-2">
                      <Link
                        href={categorySlug ? `/categories/${categorySlug}` : '#'}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors"
                      >
                        <FaFolder size={10} />
                        <span>{postCategory}</span>
                      </Link>
                    </div>
                  )}
                  {/* Tags */}
                  {postTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      {postTags.slice(0, 3).map((tag) => (
                        <Link
                          key={tag.id || tag.slug}
                          href={`/tags/${tag.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-saffron-600 bg-saffron-50 px-2 py-0.5 rounded-full hover:bg-saffron-100 transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                      {postTags.length > 3 && (
                        <span className="text-xs text-indigo-400">+{postTags.length - 3}</span>
                      )}
                    </div>
                  )}
                  {post.description && (
                    <p className="text-sm text-indigo-500 mt-2 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  {post.excerpt && !post.description && (
                    <p className="text-sm text-indigo-500 mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>

        );
      })}
    </div>
  );
}

