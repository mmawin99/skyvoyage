import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  images:{
    unoptimized:false,
    domains: ['images.unsplash.com', 'cdn.pixabay.com', 'images.pexels.com', 
      'upload.wikimedia.org', 'www.freepik.com',"github.com"],
  }
};

export default nextConfig;
