import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Build both in the monorepo (Turbopack root = repo root, where deps are hoisted)
// and standalone on Vercel (root = this app, which has its own node_modules).
const repoRoot = path.resolve(__dirname, "../..");
const isMonorepo = existsSync(path.join(repoRoot, "pnpm-workspace.yaml"));
const root = isMonorepo ? repoRoot : __dirname;

if (isMonorepo) {
  try {
    process.loadEnvFile(path.join(repoRoot, ".env"));
  } catch {
    /* no root .env — fine */
  }
}

const nextConfig: NextConfig = {
  turbopack: { root },
};

export default nextConfig;
