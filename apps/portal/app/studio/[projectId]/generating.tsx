"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Eyebrow, Logo, Title } from "../../ui";

const BUILD_STEPS = [
  "Reading your brief",
  "Committing an art direction",
  "Laying out the pages",
  "Sourcing on-brand imagery",
  "Writing every word",
  "Designing & building each page",
  "Reviewing like a senior team",
  "Polishing the details",
];

export function Generating({ mode }: { mode: "building" | "applying" }) {
  const router = useRouter();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const poll = setInterval(() => router.refresh(), 3500);
    const step = setInterval(() => setTick((t) => t + 1), 2200);
    return () => {
      clearInterval(poll);
      clearInterval(step);
    };
  }, [router]);

  const active = tick % BUILD_STEPS.length;

  return (
    <div className="grid min-h-screen place-items-center brand-gradient">
      <Container size="sm" className="text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Eyebrow>{mode === "applying" ? "Applying your changes" : "Your studios are at work"}</Eyebrow>
        <Title as="h1" className="mt-2 text-3xl sm:text-[38px]">
          {mode === "applying" ? "Making your edits, then re-checking quality" : "Building two complete websites"}
        </Title>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
          {mode === "applying"
            ? "We keep the design you chose and apply your change list, then run it past our reviewers before you see it."
            : "Two studios are designing, writing, and building in parallel. This usually takes a few minutes — you can leave and come back."}
        </p>

        <ul className="mx-auto mt-8 flex max-w-xs flex-col gap-2 text-left">
          {BUILD_STEPS.map((s, i) => {
            const done = i < active;
            const now = i === active;
            return (
              <li key={s} className="flex items-center gap-3 text-[14px]">
                <span
                  className={
                    done
                      ? "grid h-5 w-5 place-items-center rounded-full bg-success text-brand-ink"
                      : now
                        ? "h-5 w-5 rounded-full border-2 border-brand"
                        : "h-5 w-5 rounded-full border-2 border-line-strong"
                  }
                >
                  {done && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" aria-hidden>
                      <path d="M5 12l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={done ? "text-muted line-through" : now ? "font-500 text-ink" : "text-muted"}>{s}</span>
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
