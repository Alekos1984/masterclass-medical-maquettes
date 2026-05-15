import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  webpack: (config) => {
    // react-pdf uses canvas + some Node-only modules — exclude from browser bundle
    config.resolve.alias.canvas = false;
    return config;
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
