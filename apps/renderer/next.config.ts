import type { NextConfig } from "next";
import path from "node:path";

try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  /* root .env missing — fine */
}

const nextConfig: NextConfig = {
  transpilePackages: [
    "@simplesight/blocks",
    "@simplesight/contracts",
    "@simplesight/db",
    "@simplesight/env",
    "@simplesight/seo",
    "@simplesight/theme",
    "@simplesight/ui",
  ],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  // Security headers for every served page. Deliberately NO X-Frame-Options /
  // frame-ancestors: the portal studio iframes the renderer for live previews,
  // so framing must stay allowed.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
