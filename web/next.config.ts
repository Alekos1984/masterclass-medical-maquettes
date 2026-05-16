import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
