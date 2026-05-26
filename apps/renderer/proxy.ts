import { type NextRequest, NextResponse } from "next/server";

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "simplesight.localhost";

/**
 * Next.js 16 Proxy (formerly Middleware). Resolves the tenant from the request
 * host (username.simplesight.co) and rewrites to the internal /_sites/[username]
 * route. For local testing without editing /etc/hosts, ?tenant=acme also works.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = (req.headers.get("host") ?? "").split(":")[0] ?? "";

  let tenant = url.searchParams.get("tenant") ?? undefined;
  if (
    !tenant &&
    hostname.endsWith(`.${ROOT}`) &&
    hostname !== ROOT &&
    hostname !== `www.${ROOT}`
  ) {
    tenant = hostname.slice(0, hostname.length - ROOT.length - 1);
  }

  if (tenant) {
    const path = url.pathname === "/" ? "" : url.pathname;
    const rewritten = new URL(`/site/${tenant}${path}`, req.url);
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|site|favicon.ico|api).*)"],
};
