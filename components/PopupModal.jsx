"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useEffect } from 'react'; // Import useEffect

const PopupModal = ({ imageUrl, redirectUrl, isVisible, onClose }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset loading/error states when imageUrl changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [imageUrl]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-white p-4 rounded-lg shadow-xl max-w-sm max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>
        {imageUrl && (
          <Link href={redirectUrl || '#'} passHref target="_blank" rel="noopener noreferrer">
            <div className="relative w-full h-full flex items-center justify-center">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-75 rounded-md border border-red-300">
                  <p className="text-red-600 text-sm">Failed to load image</p>
                </div>
              )}
              <Image
                src={imageUrl}
                alt="Popup Image"
                width={300} // Adjust width as needed
                height={400} // Adjust height as needed
                layout="responsive"
                objectFit="contain"
                className="rounded-md cursor-pointer"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  console.error('Popup image loading error:', imageUrl);
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PopupModal;
