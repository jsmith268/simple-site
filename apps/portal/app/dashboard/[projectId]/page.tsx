import { getGenerationState, getHitStats } from "@simplesight/db";
import Link from "next/link";
import { loadDashboard } from "../actions";
import { Badge, Button, Card, Container, Divider, Eyebrow, Logo, Title } from "../../ui";
import { AnalyticsCard } from "./analytics-card";

type StatusTone = "neutral" | "brand" | "success" | "warn" | "info";

const STATUS: Record<string, { label: string; blurb: string; tone: StatusTone }> = {
  purchased: { label: "Welcome aboard", blurb: "Let's scope your site and get building.", tone: "warn" },
  onboarding: { label: "Scoping", blurb: "Finish the quick onboarding to start your build.", tone: "warn" },
  queued: { label: "Queued", blurb: "Your build is lined up and will start shortly.", tone: "warn" },
  building: { label: "Building", blurb: "Your studios are crafting two directions right now.", tone: "info" },
  preview: { label: "Ready to review", blurb: "Two directions are ready — compare and choose.", tone: "success" },
  changes_requested: { label: "Refining", blurb: "We're applying your changes.", tone: "info" },
  approved: { label: "Locked in", blurb: "Your design is set. Take it live whenever you're ready.", tone: "success" },
  live: { label: "Live", blurb: "Your website is published and online.", tone: "success" },
  refunded: { label: "Refunded", blurb: "This project was refunded.", tone: "neutral" },
  cancelled: { label: "Cancelled", blurb: "This project was cancelled.", tone: "neutral" },
};

export default async function DashboardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [data, gen] = await Promise.all([loadDashboard(projectId), getGenerationState(projectId)]);

  if (!data.project) {
    return (
      <div className="grid min-h-screen place-items-center brand-gradient">
        <Container size="sm" className="text-center">
          <Title as="h1" className="text-2xl">
            We couldn&apos;t find that project
          </Title>
          <p className="mt-2 text-ink-soft">Double-check your link, or reach out to support.</p>
        </Container>
      </div>
    );
  }

  const { project, businessName, preview } = data;
  const info = STATUS[project.status] ?? { label: project.status, blurb: "We'll keep you posted here.", tone: "neutral" as StatusTone };
  const cta = primaryCta(projectId, project.status, gen.status, gen.currentRound);
  const viewable = !!project.username && ["preview", "approved", "live"].includes(project.status);
  const stats = viewable && project.username ? await getHitStats(project.username) : null;

  return (
    <div className="min-h-screen brand-gradient">
      <header className="border-b border-line/70 bg-paper/80 backdrop-blur">
        <Container size="md" className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${projectId}/settings`} className="text-[13px] text-ink-soft hover:text-ink">Edit details</Link>
            <Badge tone={info.tone}>{info.label}</Badge>
          </div>
        </Container>
      </header>

      <Container size="md" className="py-12">
        <Eyebrow>Your project</Eyebrow>
        <Title as="h1" className="mt-2 text-4xl">
          {businessName ?? "Your website"}
        </Title>
        <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{info.blurb}</p>

        <Card className="mt-8 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[18px] font-semibold">{cta.title}</h2>
              <p className="mt-1 text-[14px] text-ink-soft">{cta.blurb}</p>
            </div>
            <Link href={cta.href} className="shrink-0">
              <Button size="lg">{cta.label} →</Button>
            </Link>
          </div>

          {preview && ["preview", "approved", "live"].includes(project.status) && (
            <>
              <Divider className="my-5" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[14px] text-ink-soft">
                  Lives at{" "}
                  {project.username ? (
                    <span className="font-semibold text-ink">{project.username}.simplesight.co</span>
                  ) : (
                    "your address"
                  )}
                </div>
                <a href={preview} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm">
                    View site ↗
                  </Button>
                </a>
              </div>
            </>
          )}
        </Card>

        {stats && <AnalyticsCard stats={stats} />}

        {gen.currentRound > 0 && gen.status !== "finalized" && (
          <p className="mt-4 text-center text-[13px] text-muted">
            {gen.currentRound} of {gen.maxRounds} design rounds used · refine your chosen design as much as you need.
          </p>
        )}
      </Container>
    </div>
  );
}

function primaryCta(projectId: string, status: string, gen: string, round: number) {
  const studio = `/studio/${projectId}`;
  const onboarding = `/onboarding/${projectId}`;
  const goLive = `/dashboard/${projectId}/go-live`;
  if (status === "live") return { title: "Your site is live", blurb: "Manage hosting, domains, or request changes.", label: "Manage hosting", href: goLive };
  if (gen === "finalized" || status === "approved") return { title: "Ready to launch", blurb: "Connect a domain and publish your site.", label: "Set up hosting & go live", href: goLive };
  if (gen === "selected" || gen === "revising") return { title: "Refine your site", blurb: "Walk every page, leave notes, and approve changes.", label: "Open the workspace", href: studio };
  if (gen === "comparing" || gen === "exhausted") return { title: "Compare your designs", blurb: "Two directions are waiting for you to choose.", label: "Compare & choose", href: studio };
  if (gen === "generating" || status === "building") return { title: "We're building", blurb: "Watch your two directions come together.", label: "View progress", href: studio };
  if (round === 0 && (status === "purchased" || status === "onboarding" || status === "queued"))
    return { title: "Let's build your site", blurb: "A few quick questions, then we build two directions.", label: "Start onboarding", href: onboarding };
  return { title: "Continue in your studio", blurb: "Pick up where you left off.", label: "Open studio", href: studio };
}
