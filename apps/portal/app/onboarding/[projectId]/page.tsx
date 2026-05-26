import type { BusinessInfo, IntakeStyle } from '@simplesight/contracts';
import { loadOnboarding } from '../actions';
import { Wizard } from './wizard';

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, intake } = await loadOnboarding(projectId);

  if (!project) {
    return (
      <main
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '96px 24px',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Project not found</h1>
        <p style={{ color: '#666', lineHeight: 1.5 }}>
          We couldn&apos;t find a project with that link. Check the URL or contact support if you
          think this is a mistake.
        </p>
      </main>
    );
  }

  const initialStyle = (intake?.style ?? {}) as Partial<IntakeStyle>;
  const initialBusiness = (intake?.business ?? {}) as Partial<BusinessInfo>;

  return (
    <Wizard
      projectId={projectId}
      initialStyle={initialStyle}
      initialBusiness={initialBusiness}
      initialUsername={project.username}
    />
  );
}
