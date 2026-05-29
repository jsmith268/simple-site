"use client";

import { useState, useTransition } from "react";
import type { BusinessInfo, IntakeStyle } from "@simplesight/contracts";
import { Badge, Button, Card, Chip, Field, Input, Textarea } from "../../../ui";
import { saveSettingsAction } from "./settings-actions";

const VOICE_OPTIONS = ["Warm & welcoming", "Bold & confident", "Refined & premium", "Minimal & calm", "Playful & fun", "Classic & trusted", "Modern & sleek", "A little irreverent"];

export function SettingsForm({ projectId, business, style }: { projectId: string; business?: BusinessInfo; style?: IntakeStyle }) {
  const [name, setName] = useState(business?.name ?? "");
  const [tagline, setTagline] = useState(business?.tagline ?? "");
  const [description, setDescription] = useState(business?.description ?? "");
  const [category, setCategory] = useState(business?.category ?? "");
  const [audience, setAudience] = useState(business?.audience ?? "");
  const [services, setServices] = useState<string[]>(business?.services?.map((s) => s.name) ?? []);
  const [email, setEmail] = useState(business?.contact?.email ?? "");
  const [phone, setPhone] = useState(business?.contact?.phone ?? "");
  const [instagram, setInstagram] = useState(business?.contact?.socials?.find((s) => s.platform === "instagram")?.url ?? "");
  const [address, setAddress] = useState(business?.locations?.[0]?.address ?? "");
  const [city, setCity] = useState(business?.locations?.[0]?.city ?? "");
  const [vibe, setVibe] = useState<string[]>(style?.vibe ?? []);
  const [colorPreference, setColorPreference] = useState(style?.colorPreference ?? "");
  const [avoid, setAvoid] = useState(style?.avoid ?? "");
  const [newService, setNewService] = useState("");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    const nextBusiness: BusinessInfo = {
      name: name || "Your Business",
      tagline: tagline || undefined,
      description: description || "A local business.",
      category: category || "small business",
      services: services.map((s) => ({ name: s })),
      audience: audience || undefined,
      locations: address || city ? [{ address: address || undefined, city: city || undefined }] : [],
      hours: business?.hours ?? [],
      contact: {
        email: email || undefined,
        phone: phone || undefined,
        socials: instagram ? [{ platform: "instagram", url: instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}` }] : [],
      },
      existingWebsiteUrl: business?.existingWebsiteUrl,
    };
    const nextStyle: IntakeStyle = {
      vibe,
      mood: style?.mood,
      colorPreference: colorPreference || undefined,
      referenceUrls: style?.referenceUrls ?? [],
      avoid: avoid || undefined,
    };
    start(async () => {
      await saveSettingsAction(projectId, { business: nextBusiness, style: nextStyle });
      setSaved(true);
    });
  }

  const toggleVibe = (v: string) => setVibe((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="font-display text-[18px] font-semibold">Business</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="s-name"><Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Category" htmlFor="s-cat"><Input id="s-cat" value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
        </div>
        <Field label="Tagline" htmlFor="s-tag"><Input id="s-tag" value={tagline} onChange={(e) => setTagline(e.target.value)} /></Field>
        <Field label="Description" htmlFor="s-desc"><Textarea id="s-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <Field label="Audience" htmlFor="s-aud"><Input id="s-aud" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Who are your customers?" /></Field>
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ink-soft">Services / offerings</p>
          {services.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {services.map((s, i) => (
                <Badge key={`${s}-${i}`} tone="neutral" className="gap-2">
                  {s}
                  <button onClick={() => setServices(services.filter((_, j) => j !== i))} className="text-muted hover:text-danger" aria-label="Remove">×</button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input value={newService} onChange={(e) => setNewService(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newService.trim()) { setServices([...services, newService.trim()]); setNewService(""); } }} placeholder="Add a service…" className="h-9 text-[14px]" />
            <Button size="sm" variant="secondary" onClick={() => { if (newService.trim()) { setServices([...services, newService.trim()]); setNewService(""); } }}>Add</Button>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="font-display text-[18px] font-semibold">Voice &amp; color</h2>
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-soft">Voice</p>
          <div className="flex flex-wrap gap-2">
            {[...VOICE_OPTIONS, ...vibe.filter((v) => !VOICE_OPTIONS.includes(v))].map((v) => (
              <Chip key={v} as="button" selected={vibe.includes(v)} onClick={() => toggleVibe(v)}>{v}</Chip>
            ))}
          </div>
        </div>
        <Field label="Colors" htmlFor="s-color"><Input id="s-color" value={colorPreference} onChange={(e) => setColorPreference(e.target.value)} placeholder="e.g. warm terracotta and sage, or #b5694a" /></Field>
        <Field label="Avoid" htmlFor="s-avoid"><Input id="s-avoid" value={avoid} onChange={(e) => setAvoid(e.target.value)} placeholder="styles / words / colors to steer clear of" /></Field>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="font-display text-[18px] font-semibold">Contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="s-email"><Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone" htmlFor="s-phone"><Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Instagram" htmlFor="s-ig"><Input id="s-ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourhandle" /></Field>
          <Field label="Address" htmlFor="s-addr"><Input id="s-addr" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          <Field label="City" htmlFor="s-city"><Input id="s-city" value={city} onChange={(e) => setCity(e.target.value)} /></Field>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={save} loading={pending} disabled={pending}>Save changes</Button>
        {saved && <span className="text-[14px] text-success">Saved — applied to your next build.</span>}
      </div>
    </div>
  );
}
