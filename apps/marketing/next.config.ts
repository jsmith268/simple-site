import type { NextConfig } from "next";
import path from "node:path";

// Load monorepo-root .env before Next init (per-app .env.local still wins).
try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  /* root .env missing — fine */
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
