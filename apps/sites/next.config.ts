import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@billik/site-config", "@billik/ui", "@billik/seo"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;