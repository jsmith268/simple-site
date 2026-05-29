/* Brand helpers — pure, no API. Color extraction runs client-side via <canvas>;
 * the monogram is a deterministic SVG. Used by the onboarding brand step + settings. */

export function normalizeHex(s: string): string | null {
  const t = s.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(t)) return `#${t.split("").map((c) => c + c).join("").toLowerCase()}`;
  if (/^[0-9a-fA-F]{6}$/.test(t)) return `#${t.toLowerCase()}`;
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;
}

function dist(a: string, b: string): number {
  const pa = a.replace("#", "");
  const pb = b.replace("#", "");
  const ar = parseInt(pa.slice(0, 2), 16), ag = parseInt(pa.slice(2, 4), 16), ab = parseInt(pa.slice(4, 6), 16);
  const br = parseInt(pb.slice(0, 2), 16), bg = parseInt(pb.slice(2, 4), 16), bb = parseInt(pb.slice(4, 6), 16);
  return Math.abs(ar - br) + Math.abs(ag - bg) + Math.abs(ab - bb);
}

/** Initials for a monogram (1–2 letters). */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "S";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

/**
 * A deterministic SVG monogram for businesses with no logo — a rounded square
 * with a brand gradient and the initials in a serif. Returns a data: URL.
 */
export function monogramDataUrl(name: string, primary = "#c2410c", secondary?: string): string {
  const a = normalizeHex(primary) ?? "#c2410c";
  const b = normalizeHex(secondary ?? "") ?? shade(a, -28);
  const init = initials(name);
  const fontSize = init.length > 1 ? 132 : 168;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
    </linearGradient></defs>
    <rect width="256" height="256" rx="56" fill="url(#g)"/>
    <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif" font-weight="600" font-size="${fontSize}" fill="#fffaf5">${init}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function shade(hex: string, amt: number): string {
  const p = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(p.slice(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(p.slice(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(p.slice(4, 6), 16) + amt));
  return rgbToHex(r, g, b);
}

/**
 * Extract the 1–3 dominant brand colors from an image (browser only). Samples a
 * downscaled copy, quantizes to 16 levels/channel, drops near-white/black, and
 * returns the most common averaged colors. Returns [] on CORS taint or failure.
 */
export function extractPalette(src: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve([]);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = 56;
        const h = Math.max(1, Math.round((56 * img.height) / Math.max(1, img.width)));
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext("2d");
        if (!ctx) return resolve([]);
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!, a = data[i + 3]!;
          if (a < 128) continue;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          if (mx > 240 && mn > 235) continue; // near-white
          if (mx < 26) continue; // near-black
          const key = `${r >> 4},${g >> 4},${b >> 4}`;
          const e = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
          e.r += r; e.g += g; e.b += b; e.n++;
          buckets.set(key, e);
        }
        const sorted = [...buckets.values()].sort((x, y) => y.n - x.n);
        const out: string[] = [];
        for (const e of sorted) {
          const hex = rgbToHex(Math.round(e.r / e.n), Math.round(e.g / e.n), Math.round(e.b / e.n));
          if (out.every((o) => dist(o, hex) > 40)) out.push(hex);
          if (out.length >= 3) break;
        }
        resolve(out);
      } catch {
        resolve([]); // tainted canvas (cross-origin without CORS) — extraction unavailable
      }
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
}
