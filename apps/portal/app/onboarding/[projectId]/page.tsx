import { isOffline } from "@simplesight/env";
import { loadOnboarding } from "../actions";
import { Container, Title } from "../../ui";
import { Conversation } from "./conversation";
import { LiveConversation } from "./live-conversation";
import type { ConversationDraft } from "./draft";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, intake } = await loadOnboarding(projectId);

  if (!project) {
    return (
      <main className="brand-gradient min-h-screen">
        <Container size="sm" className="py-24 text-center">
          <Title as="h1" className="text-2xl">
            Project not found
          </Title>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We couldn&apos;t find a project with that link. Check the URL, or contact support if you think this is a mistake.
          </p>
        </Container>
      </main>
    );
  }

  // Live (Anthropic key present) → the LLM-driven Avery. Offline → the smart
  // scripted flow (deterministic, no API calls), pre-filled from any prior intake.
  if (!isOffline()) {
    return <LiveConversation projectId={projectId} />;
  }

  const b = intake?.business;
  const s = intake?.style;
  const initial: Partial<ConversationDraft> = {
    name: b?.name ?? "",
    description: b?.description ?? "",
    category: b?.category ?? "",
    voice: s?.vibe ?? [],
    avoid: s?.avoid ?? "",
    email: b?.contact?.email ?? "",
    phone: b?.contact?.phone ?? "",
    username: project.username ?? "",
  };

  return <Conversation projectId={projectId} initial={initial} />;
}
