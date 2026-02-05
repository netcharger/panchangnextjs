/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Expose env vars to client side
  env: {
    DJANGO_BACKEND_URL: process.env.DJANGO_BACKEND_URL,
  },

  // Only use assetPrefix in production or when explicitly needed
  // For development, Next.js serves assets from the same origin
  // Only use assetPrefix in production or when explicitly needed
  // For development, Next.js serves assets from the same origin

  images: {
    domains: ["localhost", "127.0.0.1"],
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" }
    ],
  },

  webpack: (config, { isServer }) => {
    // Handle audio files (mp3, wav, etc.)
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });

    return config;
  },
};

module.exports = nextConfig;
