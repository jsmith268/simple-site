"use client";

import { useState, useTransition } from "react";
import { Button, Textarea } from "../../ui";
import { saveIntakeGuidanceAction } from "../intake-actions";

export function GuidanceEditor({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        placeholder="e.g. Always confirm accessibility/parking for brick-and-mortar businesses. Push for one proof point. Prefer fewer pages for solo operators."
        className="min-h-[140px] font-mono text-[13px]"
      />
      <div className="flex items-center gap-3">
        <Button onClick={() => start(async () => { await saveIntakeGuidanceAction(text); setSaved(true); })} loading={pending} disabled={pending}>
          Save guidance
        </Button>
        {saved && <span className="text-[13px] text-success">Saved — applies to every new conversation.</span>}
      </div>
    </div>
  );
}
