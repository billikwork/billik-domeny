import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@billik/site-config", "@billik/ui", "@billik/seo"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 828, 1080, 1200, 1400],
    imageSizes: [256, 384, 512, 640],
  },
};

export default nextConfig;