"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageSize } from "../lib/image_sizes.js";
import ImagePopup from "./ImagePopup";
import { FaDownload } from "react-icons/fa"; // Import the download icon

export default function WallpaperGrid({ wallpapers = [], masonry = false }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleImageClick = (wallpaper, index) => {
    console.log("WallpaperGrid - handleImageClick called:", { wallpaper, index, totalWallpapers: wallpapers.length });
    
    // Get the original image URL from various possible fields
    const imageUrl = wallpaper.image || wallpaper.image_url || wallpaper.file || wallpaper.thumb || wallpaper.url || "";

    // Get the large size version if available, otherwise use original
    const largeImageUrl = imageUrl ? (getImageSize(imageUrl, "wallpaper", "large") || imageUrl) : "";

    console.log("WallpaperGrid - Clicked wallpaper:", wallpaper);
    console.log("WallpaperGrid - Image URL:", imageUrl);
    console.log("WallpaperGrid - Large Image URL:", largeImageUrl);
    console.log("WallpaperGrid - Selected index:", index);

    if (!largeImageUrl) {
      console.error("No image URL found for wallpaper:", wallpaper);
      return;
    }

    const selectedImageData = {
      src: largeImageUrl,
      alt: wallpaper.title || wallpaper.name || "Wallpaper",
      title: wallpaper.title || wallpaper.name,
      // Also include original fields for compatibility
      image: imageUrl,
      image_url: imageUrl,
      url: imageUrl,
      name: wallpaper.name || wallpaper.title,
      caption: wallpaper.caption || wallpaper.title || wallpaper.name
    };
    
    console.log("WallpaperGrid - Setting selected image:", selectedImageData);
    console.log("WallpaperGrid - Setting index:", index);
    console.log("WallpaperGrid - Total wallpapers:", wallpapers.length);
    
    setSelectedImage(selectedImageData);
    setSelectedIndex(index);
    setIsPopupOpen(true);
    
    console.log("WallpaperGrid - ✅ Popup state set to open");
    console.log("WallpaperGrid - State values:", { 
      isPopupOpen: true, 
      selectedIndex: index,
      hasSelectedImage: !!selectedImageData,
      selectedImageData
    });
  };

  const handleDownload = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', imageUrl.split('/').pop()); // Set download filename
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (wallpapers.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 shadow-soft text-center border border-white/50">
        <p className="text-indigo-500">No wallpapers available</p>
      </div>
    );
  }

  // Masonry layout using CSS columns
  if (masonry) {
    return (
      <>
        <div
          className="columns-2 gap-3"
          style={{ columnGap: '0.75rem' }}
        >
          {wallpapers.map((w, index) => {
            const imageUrl = w.image || w.image_url || w.thumb || "/icons/placeholder.png";
            const thumbnailUrl = getImageSize(imageUrl, "thumb") || imageUrl;

            return (
              <div
                key={w.id || index}
                onClick={() => handleImageClick(w, index)}
                className="group relative w-full mb-3 break-inside-avoid rounded-xl overflow-hidden shadow-soft border border-white/50 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <div className="relative w-full">
                  <Image
                    src={thumbnailUrl.replace("wallpapers/", "wallpapers/thumb/").replace(".jpg", ".webp")}
                    alt={thumbnailUrl.replace("wallpapers/", "wallpapers/thumb/").replace(".jpg", ".webp")||w.title || w.name || "Wallpaper"}
                    width={500}
                    height={700}
                    sizes="(max-width: 768px) 50vw, 50vw"
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "auto",
                      display: "block"
                    }}
                    className="group-hover:scale-105 transition-transform duration-300 rounded-xl"
                    onError={(e) => {
                      if (e.target.src !== imageUrl) {
                        e.target.src = imageUrl;
                      }
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"></div>
                {(w.title || w.name) && (
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <p className="text-white text-xs font-medium truncate drop-shadow-lg">
                      {w.title || w.name}
                    </p>
                  </div>
                )}
                {/* Download Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent image click from triggering
                    handleDownload(imageUrl);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  aria-label="Download Wallpaper"
                >
                  <FaDownload size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Image Popup */}
        <ImagePopup
          image={selectedImage}
          wallpapers={wallpapers}
          currentIndex={selectedIndex}
          isOpen={isPopupOpen}
          onClose={() => {
            console.log("WallpaperGrid - Closing popup");
            setIsPopupOpen(false);
            setSelectedImage(null);
          }}
        />
      </>
    );
  }

  // Regular grid layout
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {wallpapers.map((w, index) => {
          const imageUrl = w.image || w.image_url || w.thumb || "/icons/placeholder.png";
          const thumbnailUrl = getImageSize(imageUrl, "wallpaper", "thumb") || imageUrl;

            return (
            <div
              key={w.id || index}
              onClick={() => handleImageClick(w, index)}
              className="group relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-soft border border-white/50 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Image
                src={thumbnailUrl.replace("wallpapers/", "wallpapers/thumb/").replace(".jpg", ".webp")}
                alt={thumbnailUrl.replace("wallpapers/", "wallpapers/thumb/").replace(".jpg", ".webp")||w.title || w.name || "Wallpaper"}
                fill
                style={{ objectFit: "cover" }}
                className="group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  if (e.target.src !== imageUrl) {
                    e.target.src = imageUrl;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              {(w.title || w.name) && (
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-xs font-medium truncate drop-shadow-lg">
                    {w.title || w.name}
                  </p>
                </div>
              )}
              {/* Download Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent image click from triggering
                  handleDownload(imageUrl);
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                aria-label="Download Wallpaper"
              >
                <FaDownload size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Image Popup */}
      <ImagePopup
        image={selectedImage}
        wallpapers={wallpapers}
        currentIndex={selectedIndex}
        isOpen={isPopupOpen}
        onClose={() => {
          console.log("WallpaperGrid - Closing popup");
          setIsPopupOpen(false);
          setSelectedImage(null);
        }}
      />
    </>
  );
}
