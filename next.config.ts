import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a pruned .next/standalone server so the Docker runtime stage
  // doesn't need the full node_modules tree (incl. devDependencies).
  output: "standalone",
};

export default nextConfig;
