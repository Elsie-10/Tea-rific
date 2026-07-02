/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Local /public/images/* are served automatically — no remotePatterns needed for them.
    // Add external domains here if you ever move images to a CDN.
    remotePatterns: [],
    // Accepted local image formats
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;