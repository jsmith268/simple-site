import { ImageResponse } from "next/og";
import { IconBadge } from "@/lib/brand-image";
import { loadSiteSpec } from "@/lib/tenant";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Per-tenant favicon — brand monogram on the primary color. */
export default async function Icon({
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
            fontSize: 40,
            fontWeight: 700,
            fontFamily: "sans-serif",
            borderRadius: 12,
          }}
        >
          S
        </div>
      ),
      { ...size },
    );
  }
  return new ImageResponse(<IconBadge spec={spec} />, { ...size });
}
