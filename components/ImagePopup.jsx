"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaTimes, FaDownload, FaImage, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { sendToNative } from "../lib/webviewBridge";

import {getImageSize} from "../lib/image_sizes";
import { Suranna } from "next/font/google";
const suranna = Suranna({
  subsets: ["telugu"],
  weight: "400",
});
import { Suravaram } from "next/font/google";

const suravaram = Suravaram({
  subsets: ["telugu"],
  weight: "400",
});

import { Mallanna } from "next/font/google";
const mallanna = Mallanna({
  subsets: ["telugu"],
  weight: "400",
});

export default function ImagePopup({ image, wallpapers = [], currentIndex = 0, isOpen, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const scrollPositionRef = useRef(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Check if running in React Native WebView
  const isReactNative = typeof window !== 'undefined' && window.ReactNativeWebView;
  
  // Update current index when prop changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(currentIndex);
    }
  }, [currentIndex, isOpen]);
  
  // Navigation functions
  const goToPrevious = () => {
    if (wallpapers.length > 0 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (wallpapers.length > 0 && currentImageIndex < wallpapers.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe left - next
      goToNext();
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous
      goToPrevious();
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    // If in React Native WebView, send OPEN_WALLPAPER message instead of showing web popup
    if (isOpen && isReactNative) {
      console.log('ImagePopup: Detected React Native WebView');
      console.log('ImagePopup: Wallpapers array length:', wallpapers.length);
      console.log('ImagePopup: Current index:', currentIndex);
      
      if (wallpapers.length > 0) {
        // Prepare wallpapers array with all images
        const formattedWallpapers = wallpapers.map((w, index) => {
          const imageUrl = w.image || w.image_url || w.file || w.thumb || w.url || "";
          const largeImageUrl = imageUrl ? (getImageSize(imageUrl, "wallpaper", "large") || imageUrl) : imageUrl;
          
          // Convert relative URLs to absolute
          let fullImageUrl = largeImageUrl;
          if (largeImageUrl && largeImageUrl.startsWith('/')) {
            fullImageUrl = window.location.origin + largeImageUrl;
          } else if (largeImageUrl && !largeImageUrl.startsWith('http://') && !largeImageUrl.startsWith('https://')) {
            fullImageUrl = new URL(largeImageUrl, window.location.href).href;
          }
          
          return {
            image: fullImageUrl,
            image_url: fullImageUrl,
            src: fullImageUrl,
            url: fullImageUrl,
            title: w.title || w.name || `Wallpaper ${index + 1}`,
            name: w.title || w.name || `Wallpaper ${index + 1}`,
            alt: w.title || w.name || `Wallpaper ${index + 1}`,
          };
        });
        
        console.log('ImagePopup: Sending OPEN_WALLPAPER message with', formattedWallpapers.length, 'wallpapers');
        console.log('ImagePopup: Initial index:', currentIndex);
        
        // Send message to React Native to open wallpaper viewer
        sendToNative({
          type: "OPEN_WALLPAPER",
          wallpapers: formattedWallpapers,
          initialIndex: currentIndex,
        });
        
        // Close the web popup immediately
        onClose();
        return;
      } else {
        console.warn('ImagePopup: No wallpapers array provided, falling back to single image');
        // Fallback: send single image if wallpapers array is empty
        if (image) {
          const imageUrl = image.src || image.image || image.image_url || image.url || "";
          let fullImageUrl = imageUrl;
          if (imageUrl && imageUrl.startsWith('/')) {
            fullImageUrl = window.location.origin + imageUrl;
          } else if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            fullImageUrl = new URL(imageUrl, window.location.href).href;
          }
          
          sendToNative({
            type: "OPEN_WALLPAPER",
            wallpapers: [{
              image: fullImageUrl,
              image_url: fullImageUrl,
              src: fullImageUrl,
              url: fullImageUrl,
              title: image.title || image.alt || 'Wallpaper',
              name: image.title || image.alt || 'Wallpaper',
            }],
            initialIndex: 0,
          });
          onClose();
          return;
        }
      }
    }
    
    // Prevent body scroll when popup is open and save scroll position (web only)
    if (isOpen && !isReactNative) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop;
      // Prevent scrolling
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
    } else if (!isOpen && !isReactNative) {
      // Restore scrolling and scroll position
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (!isReactNative) {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        if (scrollPositionRef.current) {
          window.scrollTo(0, scrollPositionRef.current);
        }
      }
    };
  }, [isOpen, isReactNative, wallpapers, currentIndex, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Get current wallpaper from array or single image
  const getCurrentWallpaper = () => {
    if (wallpapers.length > 0 && currentImageIndex >= 0 && currentImageIndex < wallpapers.length) {
      return wallpapers[currentImageIndex];
    }
    return image;
  };

  const currentWallpaper = getCurrentWallpaper();
  
  // Get image URL and caption (safe to call even if image is null)
  // Support multiple formats: src (from WallpaperGrid), image_file, image, url
  const imageUrl = currentWallpaper?.src || currentWallpaper?.image_file || currentWallpaper?.image || currentWallpaper?.image_url || currentWallpaper?.url || "";
  const imageCaption = currentWallpaper?.caption || currentWallpaper?.title || currentWallpaper?.alt || "";

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex, wallpapers.length]);

  // Reset error state when image changes
  useEffect(() => {
    if (imageUrl) {
      setImageError(false);
      console.log("ImagePopup - Image URL:", imageUrl);
      console.log("ImagePopup - Image object:", image);
    }
  }, [imageUrl, image]);

  // Don't render web popup if in React Native (handled by native component)
  if (isReactNative) return null;
  
  if (!isOpen || !image) return null;

  // Get download file name from environment variable
  const downloadFileName = process.env.NEXT_PUBLIC_DOWNLOAD_FILE_SLUG || "gallery-image";

  const handleDownload = async () => {
    if (!imageUrl) return;

    setIsDownloading(true);
    try {
      // Resolve relative URLs to absolute URLs
      let fullImageUrl = imageUrl;
      if (imageUrl.startsWith("/")) {
        // Relative URL - resolve to current origin
        fullImageUrl = window.location.origin + imageUrl;

      } else if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
        // Relative URL without leading slash - resolve relative to current path
        fullImageUrl = new URL(imageUrl, window.location.href).href;
      }

      // Fetch the image
      const response = await fetch(fullImageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();

      // Get file extension from URL or default to jpg
      const urlParts = fullImageUrl.split(".");
      const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split("?")[0] : "jpg";

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${downloadFileName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSetWallpaper = () => {
    // Convert relative URL to absolute URL for React Native
    let fullImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('/')) {
      // Relative URL - convert to absolute
      fullImageUrl = window.location.origin + imageUrl;
    } else if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      // Relative URL without leading slash
      fullImageUrl = new URL(imageUrl, window.location.href).href;
    }
    
    console.log('Setting wallpaper:', fullImageUrl);
    
    // Send message to React Native WebView
    sendToNative({
      type: "SET_WALLPAPER",
      imageUrl: fullImageUrl,
      caption: imageCaption,
    });
  };

  return (
    <div
      className={`${mallanna.className} fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <FaTimes size={18} />
        </button>

        {/* Image Container with Navigation */}
        <div className="relative w-full flex-1 min-h-[60vh] max-h-[calc(90vh-200px)] bg-gradient-to-br from-saffron-100 to-indigo-100 flex items-center justify-center overflow-hidden">
          {/* Previous Button */}
          {wallpapers.length > 1 && currentImageIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-20 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
              aria-label="Previous wallpaper"
            >
              <FaChevronLeft size={20} />
            </button>
          )}

          {/* Image with Touch Support */}
          <div 
            className="w-full h-full flex items-center justify-center p-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageUrl ? (
              <img
                src={getImageSize(imageUrl, "wallpapers", "medium").replace(".jpg",".webp")}
                alt={imageCaption || "Wallpaper"}
                className="max-w-full max-h-full w-auto h-auto object-contain mx-auto"
                style={{ display: 'block' }}
                onError={(e) => {
                  console.error("Image load error:", imageUrl);
                  // Try original URL if the replaced URL fails
                  if (e.target.src !== imageUrl && imageUrl.includes("post_images/")) {
                    e.target.src = imageUrl;
                  } else {
                    setImageError(true);
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-indigo-500 gap-2">
                <FaImage size={48} className="opacity-50" />
                <p>Image not available</p>
                <p className="text-xs text-indigo-400">URL: {imageUrl || "No URL provided"}</p>
              </div>
            )}
          </div>

          {/* Next Button */}
          {wallpapers.length > 1 && currentImageIndex < wallpapers.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 z-20 w-12 h-12 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
              aria-label="Next wallpaper"
            >
              <FaChevronRight size={20} />
            </button>
          )}

          {/* Counter */}
          {wallpapers.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-black/50 text-white rounded-full text-sm backdrop-blur-sm">
              {currentImageIndex + 1} / {wallpapers.length}
            </div>
          )}
        </div>

        {/* Caption */}
        {imageCaption && (
          <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-saffron-50 border-t border-white/50">
            <p className="text-sm text-indigo-700 text-center">{imageCaption}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 p-4 bg-white border-t border-gray-200">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 active:scale-95 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload size={16} />
            <span>{isDownloading ? "డౌన్లోడ్ అవుతుంది ..." : "డౌన్లోడ్ చేయి"}</span>
          </button>

          <button
            onClick={handleSetWallpaper}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white rounded-xl font-semibold hover:from-saffron-600 hover:to-saffron-700 active:scale-95 transition-all duration-200 shadow-md"
          >
            <FaImage size={16} />
            <span>వాల్ పేపర్ సెట్ చేయి</span>
          </button>
        </div>
      </div>
    </div>
  );
}

