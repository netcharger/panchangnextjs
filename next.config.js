/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Only use assetPrefix in production or when explicitly needed
  // For development, Next.js serves assets from the same origin
  // assetPrefix: process.env.NODE_ENV === 'production' ? "http://192.168.1.2:3000" : undefined,

  images: {
    domains: ["localhost", "127.0.0.1", "192.168.1.2"],
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" }
    ],
  },
};

module.exports = nextConfig;
