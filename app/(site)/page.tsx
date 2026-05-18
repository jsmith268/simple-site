import type { Metadata } from "next";
import { AgencySite } from "./agency-site";

export const metadata: Metadata = {
  title: "Simple Site — Custom websites for small businesses. From $995.",
  description:
    "Three completely original design concepts. One fixed $995 price. Live in under 72 hours. Built for solo entrepreneurs, small businesses, and local service providers.",
};

export default function Page() {
  return <AgencySite />;
}
