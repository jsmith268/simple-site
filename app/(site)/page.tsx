import type { Metadata } from "next";
import { AgencySite } from "./agency-site";

export const metadata: Metadata = {
  title: "Simple Site — Custom websites for small businesses. From $1,248.",
  description:
    "Three completely original design concepts, live in under 72 hours. Launch promo: 50% off every price. Built for solo founders, start-ups, small businesses, and local service providers.",
};

export default function Page() {
  return <AgencySite />;
}
