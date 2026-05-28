import { Card, Container, Eyebrow, Logo, Title } from "../../ui";

// Landing after a live Stripe Checkout success. The webhook creates the project
// asynchronously, so we link the customer to their email for the secure onboarding
// link. (The offline/instant-purchase flow skips this page and goes straight in.)
export default function RecentPage() {
  return (
    <div className="grid min-h-screen place-items-center brand-gradient">
      <Container size="sm" className="text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card className="p-8">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-success-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" aria-hidden>
              <path d="M5 12l4 4L19 7" />
            </svg>
          </div>
          <Eyebrow>Payment received</Eyebrow>
          <Title as="h1" className="mt-2 text-2xl">
            You&apos;re in — thank you
          </Title>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We&apos;re setting up your project now. Check your email for a secure link to start onboarding — a few quick questions and your two designs begin building.
          </p>
        </Card>
      </Container>
    </div>
  );
}
