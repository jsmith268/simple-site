import { ImageResponse } from "next/og";
import { MarketingOgCard } from "./og-card";

export const alt = "Simple Site — custom websites for small businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(<MarketingOgCard />, { ...size });
}
