import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
