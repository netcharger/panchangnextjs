"use client";

import React from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa'; // Using react-icons for a close button icon

const NextJsSplashImageModal = ({ imageUrl, isVisible, onClose }) => {
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
          <Image
            src={imageUrl}
            alt="Splash Image"
            width={300} // Adjust width as needed
            height={400} // Adjust height as needed
            layout="responsive"
            objectFit="contain"
            className="rounded-md"
          />
        )}
      </div>
    </div>
  );
};

export default NextJsSplashImageModal;

