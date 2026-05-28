import type { SiteSpec } from "@simplesight/contracts";
import {
  getGenerationState,
  getProject,
  getVariant,
  getVariantSpec,
  listRevisionItems,
  listVariants,
  variantsForRound,
} from "@simplesight/db";
import Link from "next/link";
import { Button, Card, Container, Eyebrow, Logo, Title } from "../../ui";
import { Compare } from "./compare";
import { Generating } from "./generating";
import { Workspace } from "./workspace";

export default async function StudioPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [project, state] = await Promise.all([getProject(projectId), getGenerationState(projectId)]);

  if (!project) return <NotFound />;

  // Not started yet → guide them into onboarding.
  if (state.status === "idle" && state.currentRound === 0) {
    return (
      <Center>
        <Eyebrow>Your studio</Eyebrow>
        <Title as="h1" className="mt-2 text-2xl">
          Let&apos;s scope your site first
        </Title>
        <p className="mt-2 text-ink-soft">A few quick questions and we&apos;ll build you two directions to choose from.</p>
        <Link href={`/onboarding/${projectId}`} className="mt-5 inline-block">
          <Button size="lg">Start onboarding →</Button>
        </Link>
      </Center>
    );
  }

  if (state.status === "generating") return <Generating mode="building" />;
  if (state.status === "revising") return <Generating mode="applying" />;

  // Selected → refinement workspace.
  if ((state.status === "selected") && state.selectedVariantId) {
    const variant = await getVariant(state.selectedVariantId);
    if (variant) {
      const spec = (await getVariantSpec(variant.id)) as SiteSpec | undefined;
      const pages = spec?.pages?.length
        ? spec.pages.map((p) => ({ slug: p.slug ? `/${p.slug}` : "/", name: p.title }))
        : [{ slug: "/", name: "Home" }];
      const comments = await listRevisionItems(projectId, { variantId: variant.id, revision: 0, status: "open" });
      return (
        <Workspace
          projectId={projectId}
          variant={variant}
          pages={pages}
          initialComments={comments}
          revisionUsed={state.revisionCount}
          revisionMax={state.maxRevisions}
        />
      );
    }
  }

  // Finalized → ready for hosting / go-live.
  if (state.status === "finalized") {
    const variant = state.selectedVariantId ? await getVariant(state.selectedVariantId) : undefined;
    return (
      <Center>
        <Eyebrow>Locked in</Eyebrow>
        <Title as="h1" className="mt-2 text-3xl">
          Your site is ready to launch
        </Title>
        <p className="mt-2 max-w-md text-ink-soft">Beautiful. Connect a domain (or use your free address) and take it live whenever you&apos;re ready.</p>
        <div className="mt-6 flex items-center gap-3">
          {variant?.previewUrl && (
            <a href={variant.previewUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary">View your site ↗</Button>
            </a>
          )}
          <Link href={`/dashboard/${projectId}/go-live`}>
            <Button size="lg">Set up hosting & go live →</Button>
          </Link>
        </div>
      </Center>
    );
  }

  // comparing / exhausted → show the latest round to choose from.
  let variants = await variantsForRound(projectId, state.currentRound);
  if (!variants.length) {
    const all = await listVariants(projectId);
    const maxRound = all.reduce((m, v) => Math.max(m, v.round), 0);
    variants = all.filter((v) => v.round === maxRound);
  }
  if (!variants.length) return <Generating mode="building" />;

  return <Compare projectId={projectId} variants={variants} round={state.currentRound} used={state.currentRound} max={state.maxRounds} />;
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center brand-gradient">
      <Container size="sm" className="text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        {children}
      </Container>
    </div>
  );
}

function NotFound() {
  return (
    <Center>
      <Title as="h1" className="text-2xl">
        Project not found
      </Title>
      <p className="mt-2 text-ink-soft">Check your link, or contact support.</p>
    </Center>
  );
}
