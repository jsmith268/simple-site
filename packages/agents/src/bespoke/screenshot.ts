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

/** Default: thum.io (no API key). `fullPage` uses their crop/scroll modifier. */
export class ThumIoScreenshot implements ScreenshotProvider {
  async capture(url: string, opts: { width?: number; fullPage?: boolean } = {}): Promise<Screenshot> {
    const width = opts.width ?? 1280;
    const mods = [`width/${width}`, 'noanimate'];
    if (opts.fullPage) mods.push('crop/2400');
    const endpoint = `https://image.thum.io/get/${mods.join('/')}/${url}`;
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 30000);
    try {
      const res = await fetch(endpoint, { signal: ac.signal });
      if (!res.ok) throw new Error(`screenshot service ${res.status}`);
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.byteLength < 1000) throw new Error('screenshot too small / blank');
      return { bytes: buf, mediaType: res.headers.get('content-type') ?? 'image/png' };
    } finally {
      clearTimeout(t);
    }
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
