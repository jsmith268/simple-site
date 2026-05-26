import type { NextConfig } from "next";
import path from "node:path";

try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  /* root .env missing — fine */
}

const nextConfig: NextConfig = {
  transpilePackages: [
    "@simplesight/agents",
    "@simplesight/blocks",
    "@simplesight/contracts",
    "@simplesight/db",
    "@simplesight/engine",
    "@simplesight/env",
    "@simplesight/observability",
    "@simplesight/provisioning",
    "@simplesight/theme",
    "@simplesight/ui",
  ],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
