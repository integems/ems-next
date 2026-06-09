import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained build (.next/standalone) so the Docker image
  // can run with `node server.js` without the full node_modules tree.
  output: "standalone",
};

export default nextConfig;
