import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1024mb",
    },
  },
  images:{
    remotePatterns:[
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https"
      }
    ]
  }
};

export default nextConfig;
