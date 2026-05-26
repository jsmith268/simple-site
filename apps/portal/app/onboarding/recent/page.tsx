// Landing after a live Stripe Checkout success. The webhook creates the project
// asynchronously, so we can't link straight to it here — point the customer to
// their dashboard (Phase 4) / email. Offline flow skips this page entirely.
export default function RecentPage() {
  return (
    <main style={{ maxWidth: 480, margin: "80px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Payment received — thank you!</h1>
      <p style={{ color: "#555", marginTop: 12, lineHeight: 1.6 }}>
        We're setting up your project now. Check your email for a link to begin onboarding, where
        you'll tell us about your business so we can build your site.
      </p>
    </main>
  );
}
