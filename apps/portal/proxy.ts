import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Next.js 16 renamed `middleware` → `proxy`. Clerk's middleware handler is the
// proxy: it attaches the auth context that `auth()` reads in RSCs/server actions,
// and enforces the session gate. Routes NOT matched here are public.
const isPublic = createRouteMatcher([
  "/",
  "/buy",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/paddle/webhook", // verified by Paddle signature, not a session
  "/api/cron(.*)", // protected by CRON_SECRET, not a session
]);
const isOperatorRoute = createRouteMatcher(["/admin(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return;
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  if (isOperatorRoute(req) && sessionClaims?.metadata?.role !== "operator") {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  // Run on everything except Next internals and static files; always on API routes.
  matcher: ["/((?!_next|[^?]*\\.(?:ico|png|jpg|jpeg|svg|css|js|woff2?|ttf|webmanifest)).*)", "/(api|trpc)(.*)"],
};
