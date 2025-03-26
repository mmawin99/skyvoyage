import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output:"export",
  devIndicators: false,
  images:{
    unoptimized:true
  }
};

export default nextConfig;
