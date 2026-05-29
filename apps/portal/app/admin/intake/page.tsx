import Link from "next/link";
import { Badge, Card, Container, Divider, Eyebrow, Logo, Title } from "../../ui";
import { loadIntakeConsole } from "../intake-actions";
import { GuidanceEditor } from "./guidance-editor";

export const dynamic = "force-dynamic";

export default async function AdminIntakePage() {
  const { guidance, projects } = await loadIntakeConsole();
  const withIntake = projects.filter((p) => p.hasIntake);

  return (
    <div className="min-h-screen brand-gradient">
      <header className="border-b border-line/70 bg-paper/80 backdrop-blur">
        <Container size="lg" className="flex h-16 items-center justify-between">
          <Logo />
          <Link href="/admin" className="text-[13px] text-ink-soft hover:text-ink">← Admin</Link>
        </Container>
      </header>

      <Container size="lg" className="py-10">
        <Eyebrow>Intake console</Eyebrow>
        <Title as="h1" className="mt-2 text-3xl">Avery — the questioning process</Title>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Tune how Avery scopes projects, and review what each conversation gathered. Guidance applies to every new conversation on top of the base prompt.
        </p>

        <Card className="mt-8 p-6">
          <h2 className="font-display text-[18px] font-semibold">Operator guidance</h2>
          <p className="mb-3 mt-1 text-[13px] text-ink-soft">Extra instructions appended to Avery&apos;s system prompt fleet-wide.</p>
          <GuidanceEditor initial={guidance} />
        </Card>

        <h2 className="mt-10 font-display text-[18px] font-semibold">Gathered intake ({withIntake.length})</h2>
        <Divider className="my-3" />
        {withIntake.length === 0 ? (
          <p className="text-[14px] text-muted">No projects have completed intake yet.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] gap-2 border-b border-line bg-paper-2/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <span>Business</span><span>Category</span><span>Voice</span><span>Email</span><span>Status</span>
            </div>
            {withIntake.map((p) => (
              <div key={p.id} className="grid grid-cols-[1.4fr_1fr_1fr_1.2fr_auto] items-center gap-2 border-b border-line px-4 py-2.5 text-[13px] last:border-0">
                <span className="truncate font-medium text-ink">{p.name ?? "—"}</span>
                <span className="truncate text-ink-soft">{p.category ?? "—"}</span>
                <span className="truncate text-muted">{p.voice.slice(0, 2).join(", ") || "—"}</span>
                <span className="truncate text-muted">{p.email ?? "—"}</span>
                <Badge tone="neutral">{p.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
