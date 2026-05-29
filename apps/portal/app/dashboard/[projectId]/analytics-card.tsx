import type { HitStats } from "@simplesight/db";
import { Card } from "../../ui";

/** Read-only site-analytics widget shown on the dashboard once a site is viewable. */
export function AnalyticsCard({ stats }: { stats: HitStats }) {
  const hasData = stats.total > 0;
  const recent = stats.byDay.slice(-14);
  const max = Math.max(1, ...recent.map((d) => d.count));
  return (
    <Card className="mt-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[18px] font-semibold">Site analytics</h2>
        <span className="text-[12px] text-muted">Last 30 days · cookieless</span>
      </div>

      {!hasData ? (
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          No views yet. Share your link and visits will show up here. We count page
          views only — no cookies, no tracking, no personal data.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-10">
            <Stat label="Total views" value={stats.total} />
            <Stat label="Last 7 days" value={stats.last7} />
            <Stat label="Today" value={stats.today} />
          </div>

          {recent.length > 0 && (
            <div className="mt-6 flex h-16 items-end gap-1" aria-hidden="true">
              {recent.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.count}`}
                  className="flex-1 rounded-t bg-brand/70"
                  style={{ height: `${Math.max(6, Math.round((d.count / max) * 100))}%` }}
                />
              ))}
            </div>
          )}

          {stats.topPaths.length > 0 && (
            <div className="mt-6">
              <div className="text-[12px] uppercase tracking-wide text-muted">Top pages</div>
              <ul className="mt-2 space-y-1">
                {stats.topPaths.map((p) => (
                  <li key={p.path} className="flex items-center justify-between text-[14px]">
                    <span className="text-ink-soft">{p.path === "/" ? "Home" : p.path}</span>
                    <span className="font-medium tabular-nums">{p.count.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold tabular-nums">{value.toLocaleString()}</div>
      <div className="mt-1 text-[12px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
