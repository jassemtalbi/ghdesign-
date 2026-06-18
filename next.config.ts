import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/upload/**',
      },
    ],
    qualities: [60, 75],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
