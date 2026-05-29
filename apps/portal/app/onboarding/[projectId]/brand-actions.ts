"use server";

import { logger } from "@simplesight/observability";
import { requireOwnedProject } from "@/lib/auth";

/**
 * Store an uploaded logo. With BLOB_READ_WRITE_TOKEN, uploads to Vercel Blob and
 * returns a public URL; otherwise returns the data URL as-is (works locally with
 * no services). No Anthropic involved.
 */
export async function uploadLogoAction(projectId: string, dataUrl: string, filename = "logo") {
  await requireOwnedProject(projectId);
  if (!dataUrl.startsWith("data:")) return { ok: true as const, url: dataUrl };
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { ok: true as const, url: dataUrl };
  try {
    const m = dataUrl.match(/^data:(.+?);base64,(.*)$/);
    if (!m) return { ok: true as const, url: dataUrl };
    const buf = Buffer.from(m[2]!, "base64");
    const spec = "@vercel/blob";
    const { put } = (await import(spec)) as {
      put: (path: string, body: Buffer, opts: { access: "public"; token: string; contentType?: string }) => Promise<{ url: string }>;
    };
    const ext = (m[1]!.split("/")[1] ?? "png").split("+")[0];
    const res = await put(`logos/${projectId}/${filename}.${ext}`, buf, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: m[1]!,
    });
    return { ok: true as const, url: res.url };
  } catch (err) {
    logger.warn("logo upload failed — using data URL", { projectId, error: String(err) });
    return { ok: true as const, url: dataUrl };
  }
}
