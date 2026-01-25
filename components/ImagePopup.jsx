"use client";

import { useState, useEffect, useRef } from "react";
import { FaTimes, FaDownload, FaImage, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { sendToNative } from "../lib/webviewBridge.js";
import { getImageSize } from "../lib/image_sizes.js";
import { Mallanna } from "next/font/google";

const mallanna = Mallanna({
  subsets: ["telugu"],
  weight: "400",
});

export default function ImagePopup({ image, wallpapers = [], currentIndex = 0, isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const imageContainerRef = useRef(null);
  
  // Check if running in React Native WebView
  const isReactNative = typeof window !== 'undefined' && window.ReactNativeWebView;
  
  // Update current index when prop changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(currentIndex);
    }
  }, [currentIndex, isOpen]);

  // Get all wallpapers array (use wallpapers if available, otherwise create array from single image)
  // Transform wallpapers to have consistent structure
  const allWallpapers = wallpapers.length > 0 
    ? wallpapers.map(w => {
        const originalUrl = w.src || w.image || w.image_url || w.url || "";
        return {
          ...w,
          src: originalUrl,
          image: originalUrl,
          image_url: originalUrl,
          url: originalUrl,
        title: w.title || w.name || w.alt || "",
        name: w.name || w.title || w.alt || "",
        alt: w.alt || w.title || w.name || "",
          caption: w.caption || w.title || w.name || w.alt || "",
          thumb: w.thumb || getImageSize(originalUrl, "wallpapers", "thumb") || "",
          medium: w.medium || getImageSize(originalUrl, "wallpapers", "medium") || "",
        };
      })
    : (image ? [{
        src: image.src || image.image || image.image_url || image.url || "",
        image: image.image || image.image_url || image.url || "",
        image_url: image.image_url || image.image || image.url || "",
        url: image.url || image.image || image.image_url || "",
        title: image.title || image.name || image.alt || "",
        name: image.name || image.title || image.alt || "",
        alt: image.alt || image.title || image.name || "",
        caption: image.caption || image.title || image.name || image.alt || "",
        thumb: image.thumb || getImageSize(image.src || image.image || image.image_url || image.url, "wallpapers", "thumb") || "",
        medium: image.medium || getImageSize(image.src || image.image || image.image_url || image.url, "wallpapers", "medium") || "",
      }] : []);
  const totalImages = allWallpapers.length;
  
  console.log("ImagePopup - allWallpapers:", allWallpapers);
  console.log("ImagePopup - totalImages:", totalImages);

  // Get current wallpaper
  const currentWallpaper = allWallpapers[currentImageIndex] || image;
  let rawImageUrl = currentWallpaper?.src || currentWallpaper?.image_file || currentWallpaper?.image || currentWallpaper?.image_url || currentWallpaper?.url || "";
  
  // Ensure absolute URL for main image
  if (rawImageUrl && typeof rawImageUrl === 'string') {
    if (rawImageUrl.startsWith('/')) {
      rawImageUrl = 'https://api.dailypanchangam.com' + rawImageUrl;
    } else if (!rawImageUrl.startsWith('http') && !rawImageUrl.startsWith('data:')) {
       // Handle other relative paths potentially
       rawImageUrl = 'https://api.dailypanchangam.com/' + rawImageUrl;
    }
  }
  const imageUrl = rawImageUrl;
  
  const imageCaption = currentWallpaper?.caption || currentWallpaper?.title || currentWallpaper?.alt || currentWallpaper?.name || "";

  // Derive thumb and medium URLs if available
  const thumbImageUrl = currentWallpaper?.thumb || getImageSize(imageUrl, "wallpapers", "thumb") || imageUrl;
  const mediumImageUrl = currentWallpaper?.medium || getImageSize(imageUrl, "wallpapers", "medium") || imageUrl;

  // Navigation functions with smooth transitions
  const goToPrevious = () => {
    if (isTransitioning || currentImageIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentImageIndex(currentImageIndex - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToNext = () => {
    if (isTransitioning || currentImageIndex >= totalImages - 1) return;
    setIsTransitioning(true);
    setCurrentImageIndex(currentImageIndex + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Touch/swipe handlers for mobile
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
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrevious();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex, totalImages]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen && !isReactNative) {
      document.body.style.overflow = "hidden";
    } else if (!isOpen && !isReactNative) {
      document.body.style.overflow = "";
    }
    return () => {
      if (!isReactNative) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, isReactNative]);

  // Handle download
  const handleDownload = async () => {
    if (!imageUrl) return;

    setIsDownloading(true);
    try {
      let fullImageUrl = imageUrl;
      
      // Fix relative URLs to point to the Django backend
      if (imageUrl.startsWith("/")) {
        fullImageUrl = 'https://api.dailypanchangam.com' + imageUrl;
      } else if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
        fullImageUrl = 'https://api.dailypanchangam.com/' + imageUrl;
      }

      const wallpaperTitle = imageCaption || currentWallpaper?.name || 'Wallpaper';

      if (isReactNative) {
        // Send to React Native for download
        sendToNative({
          type: "DOWNLOAD_WALLPAPER",
          imageUrl: fullImageUrl,
          caption: imageCaption,
          title: wallpaperTitle,
        });
        setIsDownloading(false);
      } else {
        // For web browser, use browser download
        const response = await fetch(fullImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();

        const urlParts = fullImageUrl.split(".");
        const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split("?")[0] : "jpg";
        const fileName = imageCaption || "wallpaper";
        const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${sanitizedFileName}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsDownloading(false);
      }
    } catch (error) {
      console.error("Error downloading image:", error);
      if (!isReactNative) {
        alert("Failed to download image. Please try again.");
      }
      setIsDownloading(false);
    }
  };

  // Handle set wallpaper
  const handleSetWallpaper = () => {
    if (!imageUrl) return;
    
    let fullImageUrl = imageUrl;
    
    // Ensure we have a valid string
    if (typeof fullImageUrl !== 'string') return;

    // Fix relative URLs to point to the Django backend
    if (fullImageUrl.startsWith('/')) {
      // Use the Django backend URL for media files
      // You can also use an env var here: process.env.NEXT_PUBLIC_DJANGO_BACKEND_URL
      fullImageUrl = 'https://api.dailypanchangam.com' + fullImageUrl;
    } else if (!fullImageUrl.startsWith('http://') && !fullImageUrl.startsWith('https://')) {
      // If it's a relative path without leading slash (unlikely but possible)
      fullImageUrl = 'https://api.dailypanchangam.com/' + fullImageUrl;
    }
    
    const wallpaperTitle = imageCaption || currentWallpaper?.name || 'Wallpaper';
    
    if (isReactNative) {
      // Send to React Native
      sendToNative({
        type: "SET_WALLPAPER",
        imageUrl: fullImageUrl,
        caption: imageCaption,
        title: wallpaperTitle,
      });
    } else {
      // For web, show message
      alert(`Wallpaper setting is only available in the mobile app. Image: ${wallpaperTitle}`);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log("ImagePopup - Component render:", {
      isOpen,
      totalImages,
      currentImageIndex,
      wallpapersLength: wallpapers.length,
      hasImage: !!image,
      allWallpapersLength: allWallpapers.length,
      isReactNative,
      willRender: isOpen && totalImages > 0
    });
  }, [isOpen, totalImages, currentImageIndex, wallpapers.length, image, allWallpapers.length, isReactNative]);

  // Don't render if not open or no images
  if (!isOpen) {
    console.log("ImagePopup - Not rendering: isOpen is false");
    return null;
  }
  
  if (totalImages === 0) {
    console.warn("ImagePopup - Not rendering: totalImages is 0", {
      wallpapersLength: wallpapers.length,
      hasImage: !!image,
      allWallpapers: allWallpapers
    });
    return null;
  }
  
  console.log("ImagePopup - ✅ RENDERING POPUP", {
    totalImages,
    currentImageIndex,
    isOpen,
    imageUrl: imageUrl ? imageUrl.substring(0, 50) + "..." : "NO URL"
  });

  if (!imageUrl) {
    console.error("ImagePopup - No image URL found for current wallpaper");
  }

  // Force render for debugging
  if (isOpen) {
    console.log("ImagePopup - About to render JSX, isOpen:", isOpen);
  }

  return (
    <div
      className={`${mallanna.className} fixed inset-0 bg-black backdrop-blur-sm`}
      style={{ 
        zIndex: 99999, 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Close"
      >
        <FaTimes size={20} />
      </button>

      {/* Image Counter */}
      {totalImages > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 bg-black/60 text-white rounded-full text-sm backdrop-blur-sm">
          {currentImageIndex + 1} / {totalImages}
        </div>
      )}

      {/* Main Image Container with Carousel */}
      <div
        ref={imageContainerRef}
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button */}
        {totalImages > 1 && currentImageIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 z-20 w-14 h-14 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm active:scale-95"
            aria-label="Previous wallpaper"
          >
            <FaChevronLeft size={24} />
          </button>
        )}

        {/* Image with smooth transitions */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {imageUrl ? (
            <img
              src={mediumImageUrl}
              alt={imageCaption || "Wallpaper"}
              className={`max-w-full max-h-[calc(100vh-200px)] w-auto h-auto object-contain transition-opacity duration-300 ${
                isTransitioning ? 'opacity-50' : 'opacity-100'
              }`}
              style={{ display: 'block' }}
              onError={(e) => {
                console.error("Image load error:", mediumImageUrl);
                if (e.target.src !== imageUrl) {
                  e.target.src = imageUrl; // Fallback to full size if medium fails
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white gap-4">
              <FaImage size={64} className="opacity-50" />
              <p className="text-lg opacity-75">Image not available</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        {totalImages > 1 && currentImageIndex < totalImages - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 z-20 w-14 h-14 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 backdrop-blur-sm active:scale-95"
            aria-label="Next wallpaper"
          >
            <FaChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-4 pb-8">
        {/* Caption */}
        {imageCaption && (
          <div className="text-center mb-4">
            <p className="text-white text-lg font-medium">{imageCaption}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
          >
            <FaDownload size={18} />
            <span>{isDownloading ? "డౌన్లోడ్ అవుతుంది..." : "డౌన్లోడ్"}</span>
          </button>

          {/* Hiding Set Wallpaper button for now as requested */}
          {/* 
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSetWallpaper();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 active:scale-95 shadow-lg"
          >
            <FaImage size={18} />
            <span>వాల్ పేపర్ సెట్</span>
          </button> 
          */}
        </div>
      </div>
    </div>
  );
}
