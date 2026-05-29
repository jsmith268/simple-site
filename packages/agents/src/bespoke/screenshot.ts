/* Screenshot capture for the visual critic. Abstracted behind a provider so a
 * Vercel Sandbox + headless-browser provider can replace the default later. The
 * default uses the keyless thum.io service so the visual critic is runnable
 * against any live URL today (no browser install required here). */

export interface Screenshot {
  bytes: Uint8Array;
  mediaType: string;
}

export interface ScreenshotProvider {
  capture(url: string, opts?: { width?: number; fullPage?: boolean }): Promise<Screenshot>;
}

/** Default: thum.io (no API key). `fullPage` uses their crop/scroll modifier.
 *  Retries on transient failures (502/timeout/blank) — the free service is flaky. */
export class ThumIoScreenshot implements ScreenshotProvider {
  async capture(url: string, opts: { width?: number; fullPage?: boolean } = {}): Promise<Screenshot> {
    const width = opts.width ?? 1280;
    // `wait/3` gives the page time to paint (fonts/images) — without it, heavy
    // pages capture blank white and the design critic falsely scores ~5.
    const mods = [`width/${width}`, 'noanimate', 'wait/3'];
    if (opts.fullPage) mods.push('crop/2400');
    const endpoint = `https://image.thum.io/get/${mods.join('/')}/${url}`;
    const attempts = 4;
    let lastErr: unknown;
    for (let i = 1; i <= attempts; i++) {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 35000);
      try {
        const res = await fetch(endpoint, { signal: ac.signal, headers: { 'user-agent': 'Mozilla/5.0 SimpleSightBot' } });
        if (!res.ok) throw new Error(`screenshot service ${res.status}`);
        const buf = new Uint8Array(await res.arrayBuffer());
        if (buf.byteLength < 2500) throw new Error('screenshot too small / blank');
        return { bytes: buf, mediaType: res.headers.get('content-type') ?? 'image/png' };
      } catch (err) {
        lastErr = err;
        if (i < attempts) await new Promise((r) => setTimeout(r, 1500 * 2 ** (i - 1))); // 1.5s,3s,6s
      } finally {
        clearTimeout(t);
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('screenshot failed');
  }
}

/** Provider backed by a configurable screenshot API (URLBOX/Browserless/etc.). */
export class ApiScreenshot implements ScreenshotProvider {
  constructor(private template: string) {} // e.g. "https://my-shotter/api?url={url}&w={width}"
  async capture(url: string, opts: { width?: number } = {}): Promise<Screenshot> {
    const endpoint = this.template.replace('{url}', encodeURIComponent(url)).replace('{width}', String(opts.width ?? 1280));
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`screenshot api ${res.status}`);
    return { bytes: new Uint8Array(await res.arrayBuffer()), mediaType: res.headers.get('content-type') ?? 'image/png' };
  }
}

export function defaultScreenshotProvider(): ScreenshotProvider {
  const tpl = process.env.SCREENSHOT_API_TEMPLATE;
  return tpl ? new ApiScreenshot(tpl) : new ThumIoScreenshot();
}
