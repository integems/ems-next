import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained build (.next/standalone) so the Docker image
  // can run with `node server.js` without the full node_modules tree.
  output: "standalone",
  // docx (Word report export) is built server-side in /api/report/word. Keeping
  // it external means it's required from node_modules at runtime in Node instead
  // of being bundled/transformed — which is what triggered the browser-side
  // "'super' keyword unexpected here" SyntaxError.
  serverExternalPackages: ["docx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
