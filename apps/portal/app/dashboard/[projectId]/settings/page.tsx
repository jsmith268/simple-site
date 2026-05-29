import { getIntake, getProject } from "@simplesight/db";
import Link from "next/link";
import { Container, Eyebrow, Logo, Title } from "../../../ui";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [intake, project] = await Promise.all([getIntake(projectId), getProject(projectId)]);

  if (!project) {
    return (
      <div className="grid min-h-screen place-items-center brand-gradient">
        <Title as="h1" className="text-2xl">Project not found</Title>
      </div>
    );
  }

  return (
    <div className="min-h-screen brand-gradient">
      <header className="border-b border-line/70 bg-paper/80 backdrop-blur">
        <Container size="md" className="flex h-16 items-center justify-between">
          <Logo />
          <Link href={`/dashboard/${projectId}`} className="text-[13px] text-ink-soft hover:text-ink">← Back to dashboard</Link>
        </Container>
      </header>
      <Container size="md" className="py-10">
        <Eyebrow>Project settings</Eyebrow>
        <Title as="h1" className="mt-2 text-3xl">Edit your details</Title>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Update anything about your business. Changes are saved to your brief and applied the next time you refine or rebuild your site.
        </p>
        <SettingsForm projectId={projectId} business={intake?.business} style={intake?.style} />
      </Container>
    </div>
  );
}
