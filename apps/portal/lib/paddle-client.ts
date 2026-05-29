import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// Client-side Paddle.js (overlay checkout). The client token + price ids are
// public (NEXT_PUBLIC). Fulfillment never trusts the client — it happens in the
// signature-verified webhook. When the token is absent we're in offline mode and
// callers fall back to the instant-purchase route.

let _paddle: Promise<Paddle | undefined> | null = null;

export function paddleConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
}

function getPaddle(): Promise<Paddle | undefined> {
  if (_paddle) return _paddle;
  _paddle = initializePaddle({
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") ?? "sandbox",
    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN as string,
  });
  return _paddle;
}

export async function openCheckout(opts: {
  priceId: string;
  email?: string;
  customData?: Record<string, string>;
  successUrl?: string;
}): Promise<void> {
  const paddle = await getPaddle();
  if (!paddle) throw new Error("Paddle failed to initialize");
  paddle.Checkout.open({
    items: [{ priceId: opts.priceId, quantity: 1 }],
    ...(opts.email ? { customer: { email: opts.email } } : {}),
    ...(opts.customData ? { customData: opts.customData } : {}),
    ...(opts.successUrl ? { settings: { successUrl: opts.successUrl } } : {}),
  });
}

export const PRICES = {
  buildFee: process.env.NEXT_PUBLIC_PADDLE_PRICE_BUILD_FEE ?? "",
  hostingMonthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_HOSTING_MONTHLY ?? "",
  hostingAnnual: process.env.NEXT_PUBLIC_PADDLE_PRICE_HOSTING_ANNUAL ?? "",
};
