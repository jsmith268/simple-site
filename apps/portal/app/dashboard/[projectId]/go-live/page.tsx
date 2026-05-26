import { loadGoLive } from "../../go-live-actions";
import { GoLiveClient } from "./go-live-client";

export const dynamic = "force-dynamic";

export default async function GoLivePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const data = await loadGoLive(projectId);
  if (!data.project) {
    return (
      <main style={{ maxWidth: 640, margin: "64px auto", padding: 24, fontFamily: "system-ui" }}>
        <h1>Project not found</h1>
      </main>
    );
  }
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Launch your site</h1>
      <p style={{ color: "#555", marginTop: 8 }}>
        Status: <strong>{data.project.status}</strong>
      </p>
      <GoLiveClient
        projectId={projectId}
        subdomain={data.subdomain}
        domains={data.domains}
        steps={data.steps}
        refundOpen={data.refundOpen}
      />
    </main>
  );
}
