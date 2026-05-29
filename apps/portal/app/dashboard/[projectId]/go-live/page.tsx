import Link from "next/link";
import { loadGoLive } from "../../go-live-actions";
import { Badge, Button, Card, Container, Divider, Eyebrow, Logo, Title } from "../../../ui";
import { GoLiveClient } from "./go-live-client";
import { StartHosting } from "./start-hosting";

export const dynamic = "force-dynamic";

const HOSTING_MONTHLY_USD = 29;
const HOSTING_ANNUAL_USD = 290;
const HOSTING_INCLUDES = [
  "Fast global hosting + CDN",
  "Automatic SSL on every domain",
  "Always-on monitoring & backups",
  "Unlimited content edits with your agents",
];

export default async function GoLivePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const data = await loadGoLive(projectId);

  if (!data.project) {
    return (
      <div className="grid min-h-screen place-items-center brand-gradient">
        <Title as="h1" className="text-2xl">
          Project not found
        </Title>
      </div>
    );
  }

  const live = data.project.status === "live";

  return (
    <div className="min-h-screen brand-gradient">
      <header className="border-b border-line/70 bg-paper/80 backdrop-blur">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <Logo />
          <Link href={`/studio/${projectId}`} className="text-[13px] text-ink-soft hover:text-ink">
            ← Back to your studio
          </Link>
        </Container>
      </header>

      <Container size="md" className="py-10">
        <Eyebrow>Launch</Eyebrow>
        <Title as="h1" className="mt-2 text-3xl sm:text-[40px]">
          Take your site live
        </Title>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Your design is locked in. Choose how people reach it, and your hosting keeps it fast, secure, and effortlessly up to date.
        </p>

        {/* Hosting plan */}
        <Card className="mt-8 overflow-hidden">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[20px] font-semibold">Hosting</h2>
                {live ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Starts at launch</Badge>}
              </div>
              <p className="mt-1 text-[14px] text-ink-soft">Everything that keeps your site online and current.</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-display text-[34px] font-semibold leading-none">${HOSTING_MONTHLY_USD}</span>
              <span className="text-[14px] text-muted">/mo</span>
            </div>
          </div>
          <Divider />
          <ul className="grid grid-cols-1 gap-2 p-6 sm:grid-cols-2">
            {HOSTING_INCLUDES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-[14px] text-ink-soft">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" aria-hidden>
                  <path d="M5 12l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          {!live && (
            <div className="border-t border-line px-6 py-4">
              <p className="mb-3 text-[13px] text-ink-soft">Start your hosting plan, then publish below. You only pay for hosting now that you&apos;ve chosen your design — the build fee was one-time.</p>
              <StartHosting projectId={projectId} monthly={HOSTING_MONTHLY_USD} annual={HOSTING_ANNUAL_USD} />
            </div>
          )}
        </Card>

        {/* Domains + go live */}
        <GoLiveClient
          projectId={projectId}
          subdomain={data.subdomain}
          domains={data.domains}
          steps={data.steps}
          refundOpen={data.refundOpen}
          live={live}
        />
      </Container>
    </div>
  );
}
