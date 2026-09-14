import type { NextConfig } from "next";

const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "https://d3fz32v9ube9lf.cloudfront.net";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: new URL(assetBaseUrl).hostname }],
  },
};

export default nextConfig;
