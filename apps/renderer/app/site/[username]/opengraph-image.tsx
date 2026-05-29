import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/brand-image";
import { loadSiteSpec } from "@/lib/tenant";

export const alt = "Site preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Per-tenant Open Graph card, generated from the brand + theme at request time. */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const spec = await loadSiteSpec(username).catch(() => null);
  if (!spec) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: 64,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          {username}
        </div>
      ),
      { ...size },
    );
  }
  return new ImageResponse(<OgCard spec={spec} />, { ...size });
}
