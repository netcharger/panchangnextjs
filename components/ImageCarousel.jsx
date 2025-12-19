"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { getImageSize } from "../lib/image_sizes";
export default function ImageCarousel({ images = [], autoPlay = true, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);



    return () => clearInterval(timer);
  }, [isAutoPlaying, images.length, interval]);

  // Pause auto-play on user interaction
  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    // Resume after 10 seconds of no interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index) => {
    handleUserInteraction();
    setCurrentIndex(index);
  };

  if (!mounted || !images || images.length === 0) {
    return null;
  }

  // Get image URL
  const getImageUrl = (image) => {
    return getImageSize(image.image,  "medium") ||  "/icons/placeholder.png";
  };

  // Get image title/alt text
  const getImageTitle = (image) => {
    return image.heading   || "Carousel Image";
  };

  // Convert absolute URL to relative path if it's from the same domain
  const normalizeLink = (link) => {
    if (!link) return null;
    
    // If it's already a relative path, return as is
    if (link.startsWith('/')) {
      return link;
    }
    
    // If it's an absolute URL, try to extract the path
    try {
      const url = new URL(link);
      // Check if it's from the same origin (for client-side)
      if (typeof window !== 'undefined') {
        const currentOrigin = window.location.origin;
        if (url.origin === currentOrigin) {
          return url.pathname + url.search + url.hash;
        }
      }
      // For SSR or different origin, return the full URL
      return link;
    } catch (e) {
      // If URL parsing fails, assume it's a relative path
      return link.startsWith('/') ? link : '/' + link;
    }
  };

  return (
    <div className="relative rounded-xl  w-full  overflow-hidden shadow-lg mb-6">
      {/* Carousel Container */}
      <div className="relative  w-full aspect-[16/9] bg-gradient-to-br from-saffron-100 to-indigo-100">
        {images.map((image, index) => {
          const normalizedLink = normalizeLink(image.link);
          const isClickable = !!normalizedLink;
          
          const content = (
            <>
              <Image
                src={getImageUrl(image)}
                alt={getImageTitle(image)}
                fill
                style={{ objectFit: "cover" }}
                priority={index === 0}
                className={`rounded-xl transition-transform duration-700 ${
                  isClickable ? "hover:scale-105 cursor-pointer" : ""
                }`}
              />
              {/* Overlay with heading and description */}
              {(image.heading || image.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 z-20">
                  {image.heading && (
                    <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                      {image.heading}
                    </h3>
                  )}
                  {image.description && (
                    <p className="text-white/90 text-sm mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              )}
            </>
          );

          return (
            <div
              key={image.id || index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {normalizedLink ? (
                <Link 
                  href={normalizedLink} 
                  className="block w-full h-full cursor-pointer"
                  aria-label={image.heading || "View carousel link"}
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-indigo-700 p-2 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
            aria-label="Previous image"
          >
            <FaChevronLeft size={18} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-indigo-700 p-2 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
            aria-label="Next image"
          >
            <FaChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 h-2 bg-white shadow-lg"
                  : "w-2 h-2 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

