"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { getImageSize } from "../lib/image_sizes.js";
import ImagePopup from "./ImagePopup";

export default function Wallpaper3DStack({ wallpapers = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleImageClick = (wallpaper) => {
    const imageUrl =
      wallpaper.image ||
      wallpaper.image_url ||
      wallpaper.file ||
      wallpaper.thumb ||
      wallpaper.url ||
      "";

    const largeImageUrl =
      imageUrl ? getImageSize(imageUrl, "wallpaper", "large") || imageUrl : "";

    if (!largeImageUrl) return;

    setSelectedImage({
      src: largeImageUrl,
      alt: wallpaper.title || wallpaper.name || "Wallpaper",
      title: wallpaper.title || wallpaper.name,
      image: imageUrl,
      image_url: imageUrl,
      url: imageUrl,
    });

    setIsPopupOpen(true);
  };

  // Memoize rotations to prevent re-rendering issues
  const rotations = useMemo(() => {
    const values = [-3, -2, -1, 1, 2, 3];
    return wallpapers.map(() => values[Math.floor(Math.random() * values.length)]);
  }, [wallpapers.length]);

  if (wallpapers.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 shadow-soft text-center border border-white/50">
        <p className="text-indigo-500">No wallpapers available</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 px-3 py-4">
        {wallpapers.map((w, i) => {
          const imageUrl =
            w.image || w.image_url || w.thumb || "/icons/placeholder.png";
          const thumbnailUrl =
            getImageSize(imageUrl, "wallpaper", "thumb") || imageUrl;

          return (
            <div
              key={w.id || i}
              className="relative cursor-pointer select-none"
              style={{
                transform: `rotate(${rotations[i]}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* BACK STACK LAYER 1 */}
              <div 
                className="absolute inset-0 rounded-xl bg-white/30 shadow-xl blur-sm -translate-y-3 -translate-x-3 rotate-1 pointer-events-none"
                style={{ zIndex: 1 }}
              ></div>

              {/* BACK STACK LAYER 2 */}
              <div 
                className="absolute inset-0 rounded-xl bg-white/20 shadow-lg blur-sm translate-y-3 translate-x-3 -rotate-1 pointer-events-none"
                style={{ zIndex: 2 }}
              ></div>

              {/* MAIN CARD WITH 3D TILT */}
              <div
                className="
                  relative rounded-2xl overflow-hidden shadow-2xl border border-white/40
                  transition-all duration-500
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]
                  hover:-translate-y-2
                  hover:scale-[1.03]
                "
                style={{ zIndex: 3 }}
                onClick={() => handleImageClick(w)}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;

                  const rotateX = ((y - centerY) / 20) * -1;
                  const rotateY = (x - centerX) / 20;

                  card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget;
                  card.style.transform = "";
                }}
              >
                <div className="relative w-full">
                  <Image
                    src={thumbnailUrl
                      .replace("wallpapers/", "wallpapers/thumb/")
                      .replace(".jpg", ".webp")}
                    alt={w.title || w.name || "Wallpaper"}
                    width={700}
                    height={1000}
                    sizes="(max-width: 420px) 100vw, 420px"
                    className="
                      w-full h-auto object-cover
                      transition-transform duration-700
                    "
                    style={{ display: "block" }}
                    onError={(e) => {
                      if (e.target.src !== imageUrl) {
                        e.target.src = imageUrl;
                      }
                    }}
                  />
                </div>

                {/* OVERLAY TITLE */}
                {(w.title || w.name) && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 z-10">
                    <p className="text-white text-sm font-medium truncate drop-shadow-lg">
                      {w.title || w.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* IMAGE POPUP */}
      {isPopupOpen && selectedImage && (
        <ImagePopup
          image={selectedImage}
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}
