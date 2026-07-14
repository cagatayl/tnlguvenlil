import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable JSON imports
  experimental: {},
  // Allow external image domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'hedefbayi.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
};

export default nextConfig;
