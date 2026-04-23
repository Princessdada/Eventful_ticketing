import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack root is a valid config in this version but may not be in types yet
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
