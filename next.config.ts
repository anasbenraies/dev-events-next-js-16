import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: true,
  /* config options here */
};

export default nextConfig;
