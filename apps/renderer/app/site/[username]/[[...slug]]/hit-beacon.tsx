"use client";

import { useEffect, useRef } from "react";

/**
 * Cookieless view beacon. Fires once per page view to /api/hit with the tenant
 * username + in-site path. Uses navigator.sendBeacon (survives unload, low
 * priority) with a fetch fallback. No cookies, no identifiers, fully silent.
 */
export function HitBeacon({ username, path }: { username: string; path: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const body = JSON.stringify({ u: username, p: path });
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/hit", body);
      } else {
        void fetch("/api/hit", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    } catch {
      /* analytics is best-effort */
    }
  }, [username, path]);
  return null;
}
