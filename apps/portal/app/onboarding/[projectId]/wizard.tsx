'use client';

import type { BusinessInfo, IntakeStyle } from '@simplesight/contracts';
import { useMemo, useState, useTransition } from 'react';
import {
  reserveUsernameAction,
  saveBusinessAction,
  saveStyleAction,
  submitOnboardingAction,
} from '../actions';

// --- Static option data -----------------------------------------------------

const VIBE_OPTIONS = [
  'Clean',
  'Bold',
  'Warm',
  'Modern',
  'Classic',
  'Playful',
  'Minimal',
  'Trustworthy',
];

const MOOD_OPTIONS: { value: NonNullable<IntakeStyle['mood']>; label: string }[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'warm', label: 'Warm' },
  { value: 'bold', label: 'Bold' },
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
  { value: 'playful', label: 'Playful' },
];

const STEPS = ['Style', 'Business', 'Photos', 'Name', 'Review'] as const;

// --- Shared inline styles ----------------------------------------------------

const colors = {
  text: '#1a1a1a',
  muted: '#6b7280',
  border: '#d1d5db',
  primary: '#2563eb',
  primaryText: '#ffffff',
  bg: '#ffffff',
  subtle: '#f9fafb',
  error: '#dc2626',
  success: '#059669',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: colors.text,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  color: colors.text,
  background: colors.bg,
};

const fieldStyle: React.CSSProperties = { marginBottom: 18 };

const buttonBase: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid transparent',
};

const primaryButton: React.CSSProperties = {
  ...buttonBase,
  background: colors.primary,
  color: colors.primaryText,
};

const secondaryButton: React.CSSProperties = {
  ...buttonBase,
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
};

const smallButton: React.CSSProperties = {
  ...buttonBase,
  padding: '6px 10px',
  fontSize: 13,
  background: colors.subtle,
  color: colors.text,
  border: `1px solid ${colors.border}`,
};

// --- Local working shapes (all optional so we can build up incrementally) ----

// Stable client-side id for repeatable rows so React keys survive removal/reorder.
let rowSeq = 0;
const newId = () => `row-${rowSeq++}`;
type WithId<T> = T & { _id: string };

type RefUrlState = WithId<{ value: string }>;

type StyleState = {
  vibe: string[];
  mood?: IntakeStyle['mood'];
  colorPreference: string;
  referenceUrls: RefUrlState[];
  avoid: string;
};

type ServiceState = WithId<{ name: string; description: string }>;
type LocationState = WithId<{
  label: string;
  address: string;
  city: string;
  region: string;
  country: string;
}>;
type HoursState = WithId<{ days: string; open: string; close: string }>;
type SocialState = WithId<{ platform: string; url: string }>;
type PhotoState = WithId<{ value: string }>;

type BusinessState = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  services: ServiceState[];
  audience: string;
  locations: LocationState[];
  hours: HoursState[];
  contact: { email: string; phone: string; socials: SocialState[] };
  existingWebsiteUrl: string;
};

// --- Helpers -----------------------------------------------------------------

function toIntakeStyle(s: StyleState): IntakeStyle {
  return {
    vibe: s.vibe,
    mood: s.mood,
    colorPreference: s.colorPreference.trim() || undefined,
    referenceUrls: s.referenceUrls.map((u) => u.value.trim()).filter(Boolean),
    avoid: s.avoid.trim() || undefined,
  };
}

function toBusinessInfo(b: BusinessState): BusinessInfo {
  return {
    name: b.name.trim(),
    tagline: b.tagline.trim() || undefined,
    description: b.description.trim(),
    category: b.category.trim(),
    services: b.services
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        description: s.description.trim() || undefined,
      })),
    audience: b.audience.trim() || undefined,
    locations: b.locations
      .filter((l) => l.address.trim() || l.city.trim() || l.label.trim())
      .map((l) => ({
        label: l.label.trim() || undefined,
        address: l.address.trim() || undefined,
        city: l.city.trim() || undefined,
        region: l.region.trim() || undefined,
        country: l.country.trim() || undefined,
      })),
    hours: b.hours
      .filter((h) => h.days.trim())
      .map((h) => ({ days: h.days.trim(), open: h.open.trim(), close: h.close.trim() })),
    contact: {
      email: b.contact.email.trim() || undefined,
      phone: b.contact.phone.trim() || undefined,
      socials: b.contact.socials
        .filter((s) => s.platform.trim() || s.url.trim())
        .map((s) => ({ platform: s.platform.trim(), url: s.url.trim() })),
    },
    existingWebsiteUrl: b.existingWebsiteUrl.trim() || undefined,
  };
}

// --- Component ---------------------------------------------------------------

export function Wizard({
  projectId,
  initialStyle,
  initialBusiness,
  initialUsername,
}: {
  projectId: string;
  initialStyle: Partial<IntakeStyle>;
  initialBusiness: Partial<BusinessInfo>;
  initialUsername: string | null;
}) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  // Step 1: Style
  const [style, setStyle] = useState<StyleState>(() => ({
    vibe: initialStyle.vibe ?? [],
    mood: initialStyle.mood,
    colorPreference: initialStyle.colorPreference ?? '',
    referenceUrls: initialStyle.referenceUrls?.length
      ? initialStyle.referenceUrls.map((u) => ({ _id: newId(), value: u }))
      : [{ _id: newId(), value: '' }],
    avoid: initialStyle.avoid ?? '',
  }));

  // Step 2: Business
  const [business, setBusiness] = useState<BusinessState>(() => ({
    name: initialBusiness.name ?? '',
    tagline: initialBusiness.tagline ?? '',
    description: initialBusiness.description ?? '',
    category: initialBusiness.category ?? '',
    services: initialBusiness.services?.length
      ? initialBusiness.services.map((s) => ({
          _id: newId(),
          name: s.name,
          description: s.description ?? '',
        }))
      : [{ _id: newId(), name: '', description: '' }],
    audience: initialBusiness.audience ?? '',
    locations: initialBusiness.locations?.length
      ? initialBusiness.locations.map((l) => ({
          _id: newId(),
          label: l.label ?? '',
          address: l.address ?? '',
          city: l.city ?? '',
          region: l.region ?? '',
          country: l.country ?? '',
        }))
      : [{ _id: newId(), label: '', address: '', city: '', region: '', country: '' }],
    hours: initialBusiness.hours?.length
      ? initialBusiness.hours.map((h) => ({
          _id: newId(),
          days: h.days,
          open: h.open,
          close: h.close,
        }))
      : [{ _id: newId(), days: '', open: '', close: '' }],
    contact: {
      email: initialBusiness.contact?.email ?? '',
      phone: initialBusiness.contact?.phone ?? '',
      socials: initialBusiness.contact?.socials?.length
        ? initialBusiness.contact.socials.map((s) => ({
            _id: newId(),
            platform: s.platform,
            url: s.url,
          }))
        : [{ _id: newId(), platform: '', url: '' }],
    },
    existingWebsiteUrl: initialBusiness.existingWebsiteUrl ?? '',
  }));

  // Step 3: Photos (kept in component state only — folded into the build later)
  const [photoUrls, setPhotoUrls] = useState<PhotoState[]>(() => [{ _id: newId(), value: '' }]);

  // Step 4: Name
  const [username, setUsername] = useState(initialUsername ?? '');
  const [usernameStatus, setUsernameStatus] = useState<{
    ok: boolean;
    error?: string;
    checked: boolean;
  }>({ ok: false, checked: false });

  // Step 5: Review / submit
  const [submitted, setSubmitted] = useState(false);

  // --- Validation ------------------------------------------------------------
  const businessValid =
    business.name.trim().length > 0 &&
    business.description.trim().length > 0 &&
    business.contact.email.trim().length > 0;

  const businessErrors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!business.name.trim()) e.name = 'Business name is required.';
    if (!business.description.trim()) e.description = 'A short description is required.';
    if (!business.contact.email.trim()) e.email = 'A contact email is required.';
    return e;
  }, [business.name, business.description, business.contact.email]);

  // --- Persist-on-advance helpers -------------------------------------------
  function goNext() {
    setSaveError(null);
    if (step === 0) {
      startTransition(async () => {
        try {
          await saveStyleAction(projectId, toIntakeStyle(style));
          setStep(1);
        } catch {
          setSaveError("Couldn't save your style preferences. Please try again.");
        }
      });
      return;
    }
    if (step === 1) {
      if (!businessValid) return; // inline errors shown below
      startTransition(async () => {
        try {
          await saveBusinessAction(projectId, toBusinessInfo(business));
          setStep(2);
        } catch {
          setSaveError("Couldn't save your business details. Please try again.");
        }
      });
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      // Reserve username before moving on if not already confirmed.
      checkUsername(() => setStep(4));
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setSaveError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function checkUsername(onOk?: () => void) {
    const u = username.trim();
    if (!u) {
      setUsernameStatus({ ok: false, checked: true, error: 'Please choose a name.' });
      return;
    }
    startTransition(async () => {
      try {
        const res = await reserveUsernameAction(projectId, u);
        setUsernameStatus({ ok: res.ok, error: res.error, checked: true });
        if (res.ok && onOk) onOk();
      } catch {
        setUsernameStatus({
          ok: false,
          checked: true,
          error: "Couldn't check that name. Try again.",
        });
      }
    });
  }

  function submit() {
    setSaveError(null);
    if (!businessValid) {
      setStep(1);
      return;
    }
    startTransition(async () => {
      try {
        await submitOnboardingAction(projectId);
        setSubmitted(true);
      } catch {
        setSaveError('Something went wrong submitting your project. Please try again.');
      }
    });
  }

  // --- Repeatable-list mutators (keyed by stable _id) ------------------------
  const setRef = (id: string, v: string) =>
    setStyle((s) => ({
      ...s,
      referenceUrls: s.referenceUrls.map((u) => (u._id === id ? { ...u, value: v } : u)),
    }));
  const removeRef = (id: string) =>
    setStyle((s) => ({ ...s, referenceUrls: s.referenceUrls.filter((u) => u._id !== id) }));
  const addRef = () =>
    setStyle((s) => ({ ...s, referenceUrls: [...s.referenceUrls, { _id: newId(), value: '' }] }));

  const updateService = (id: string, patch: Partial<Omit<ServiceState, '_id'>>) =>
    setBusiness((b) => ({
      ...b,
      services: b.services.map((s) => (s._id === id ? { ...s, ...patch } : s)),
    }));
  const removeService = (id: string) =>
    setBusiness((b) => ({ ...b, services: b.services.filter((s) => s._id !== id) }));
  const addService = () =>
    setBusiness((b) => ({
      ...b,
      services: [...b.services, { _id: newId(), name: '', description: '' }],
    }));

  const updateLocation = (id: string, patch: Partial<Omit<LocationState, '_id'>>) =>
    setBusiness((b) => ({
      ...b,
      locations: b.locations.map((l) => (l._id === id ? { ...l, ...patch } : l)),
    }));
  const removeLocation = (id: string) =>
    setBusiness((b) => ({ ...b, locations: b.locations.filter((l) => l._id !== id) }));
  const addLocation = () =>
    setBusiness((b) => ({
      ...b,
      locations: [
        ...b.locations,
        { _id: newId(), label: '', address: '', city: '', region: '', country: '' },
      ],
    }));

  const updateHours = (id: string, patch: Partial<Omit<HoursState, '_id'>>) =>
    setBusiness((b) => ({
      ...b,
      hours: b.hours.map((h) => (h._id === id ? { ...h, ...patch } : h)),
    }));
  const removeHours = (id: string) =>
    setBusiness((b) => ({ ...b, hours: b.hours.filter((h) => h._id !== id) }));
  const addHours = () =>
    setBusiness((b) => ({
      ...b,
      hours: [...b.hours, { _id: newId(), days: '', open: '', close: '' }],
    }));

  const updateSocial = (id: string, patch: Partial<Omit<SocialState, '_id'>>) =>
    setBusiness((b) => ({
      ...b,
      contact: {
        ...b.contact,
        socials: b.contact.socials.map((s) => (s._id === id ? { ...s, ...patch } : s)),
      },
    }));
  const removeSocial = (id: string) =>
    setBusiness((b) => ({
      ...b,
      contact: { ...b.contact, socials: b.contact.socials.filter((s) => s._id !== id) },
    }));
  const addSocial = () =>
    setBusiness((b) => ({
      ...b,
      contact: {
        ...b.contact,
        socials: [...b.contact.socials, { _id: newId(), platform: '', url: '' }],
      },
    }));

  const setPhoto = (id: string, v: string) =>
    setPhotoUrls((urls) => urls.map((u) => (u._id === id ? { ...u, value: v } : u)));
  const removePhoto = (id: string) => setPhotoUrls((urls) => urls.filter((u) => u._id !== id));
  const addPhoto = () => setPhotoUrls((u) => [...u, { _id: newId(), value: '' }]);

  // --- Success screen --------------------------------------------------------
  if (submitted) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }} aria-hidden>
            🎉
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: colors.text }}>
            We&apos;re building your site
          </h1>
          <p style={{ color: colors.muted, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
            You&apos;ll get a preview link shortly. It&apos;ll live at{' '}
            <strong>{username.trim() || 'yourname'}.simplesight.co</strong>.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Progress step={step} />

      {step === 0 && (
        <Section title="Your style" subtitle="Tell us how the site should feel.">
          <div style={fieldStyle}>
            <span style={labelStyle}>Vibe</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VIBE_OPTIONS.map((v) => {
                const selected = style.vibe.includes(v);
                return (
                  <button
                    type="button"
                    key={v}
                    aria-pressed={selected}
                    onClick={() =>
                      setStyle((s) => ({
                        ...s,
                        vibe: selected ? s.vibe.filter((x) => x !== v) : [...s.vibe, v],
                      }))
                    }
                    style={{
                      ...buttonBase,
                      padding: '7px 14px',
                      fontWeight: 500,
                      background: selected ? colors.primary : colors.subtle,
                      color: selected ? colors.primaryText : colors.text,
                      border: `1px solid ${selected ? colors.primary : colors.border}`,
                    }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          <fieldset style={{ ...fieldStyle, border: 'none', padding: 0, margin: 0 }}>
            <legend style={labelStyle}>Mood</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {MOOD_OPTIONS.map((m) => (
                <label
                  key={m.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="mood"
                    value={m.value}
                    checked={style.mood === m.value}
                    onChange={() => setStyle((s) => ({ ...s, mood: m.value }))}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="colorPreference">
              Color preference
            </label>
            <input
              id="colorPreference"
              style={inputStyle}
              placeholder="e.g. deep navy and gold, or #1a2b3c"
              value={style.colorPreference}
              onChange={(e) => setStyle((s) => ({ ...s, colorPreference: e.target.value }))}
            />
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Reference sites you admire</span>
            {style.referenceUrls.map((url, i) => (
              <div key={url._id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  style={inputStyle}
                  type="url"
                  placeholder="https://example.com"
                  aria-label={`Reference URL ${i + 1}`}
                  value={url.value}
                  onChange={(e) => setRef(url._id, e.target.value)}
                />
                {style.referenceUrls.length > 1 && (
                  <button
                    type="button"
                    style={smallButton}
                    aria-label={`Remove reference URL ${i + 1}`}
                    onClick={() => removeRef(url._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={smallButton} onClick={addRef}>
              + Add another
            </button>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="avoid">
              Anything to avoid?
            </label>
            <textarea
              id="avoid"
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              placeholder="Styles, colors, or elements you dislike"
              value={style.avoid}
              onChange={(e) => setStyle((s) => ({ ...s, avoid: e.target.value }))}
            />
          </div>
        </Section>
      )}

      {step === 1 && (
        <Section title="Your business" subtitle="The details that shape your content.">
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="bizName">
              Business name <Req />
            </label>
            <input
              id="bizName"
              style={errBorder(inputStyle, !!businessErrors.name)}
              value={business.name}
              aria-invalid={!!businessErrors.name}
              onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
            />
            <FieldError msg={businessErrors.name} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="tagline">
              Tagline
            </label>
            <input
              id="tagline"
              style={inputStyle}
              value={business.tagline}
              onChange={(e) => setBusiness((b) => ({ ...b, tagline: e.target.value }))}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="description">
              Description <Req />
            </label>
            <textarea
              id="description"
              style={errBorder(
                { ...inputStyle, minHeight: 90, resize: 'vertical' },
                !!businessErrors.description,
              )}
              placeholder="What does your business do?"
              value={business.description}
              aria-invalid={!!businessErrors.description}
              onChange={(e) => setBusiness((b) => ({ ...b, description: e.target.value }))}
            />
            <FieldError msg={businessErrors.description} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="category">
              Category
            </label>
            <input
              id="category"
              style={inputStyle}
              placeholder="e.g. dentist, law firm, cafe"
              value={business.category}
              onChange={(e) => setBusiness((b) => ({ ...b, category: e.target.value }))}
            />
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Services</span>
            {business.services.map((s, i) => (
              <div
                key={s._id}
                style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}
              >
                <input
                  style={{ ...inputStyle, flex: '0 0 35%' }}
                  placeholder="Service name"
                  aria-label={`Service ${i + 1} name`}
                  value={s.name}
                  onChange={(e) => updateService(s._id, { name: e.target.value })}
                />
                <input
                  style={inputStyle}
                  placeholder="Short description (optional)"
                  aria-label={`Service ${i + 1} description`}
                  value={s.description}
                  onChange={(e) => updateService(s._id, { description: e.target.value })}
                />
                {business.services.length > 1 && (
                  <button
                    type="button"
                    style={smallButton}
                    aria-label={`Remove service ${i + 1}`}
                    onClick={() => removeService(s._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={smallButton} onClick={addService}>
              + Add service
            </button>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="audience">
              Audience
            </label>
            <input
              id="audience"
              style={inputStyle}
              placeholder="Who are your customers?"
              value={business.audience}
              onChange={(e) => setBusiness((b) => ({ ...b, audience: e.target.value }))}
            />
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Locations</span>
            {business.locations.map((l, i) => (
              <div
                key={l._id}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    style={inputStyle}
                    placeholder="Label (e.g. Main office)"
                    aria-label={`Location ${i + 1} label`}
                    value={l.label}
                    onChange={(e) => updateLocation(l._id, { label: e.target.value })}
                  />
                  <input
                    style={inputStyle}
                    placeholder="Street address"
                    aria-label={`Location ${i + 1} address`}
                    value={l.address}
                    onChange={(e) => updateLocation(l._id, { address: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={inputStyle}
                    placeholder="City"
                    aria-label={`Location ${i + 1} city`}
                    value={l.city}
                    onChange={(e) => updateLocation(l._id, { city: e.target.value })}
                  />
                  <input
                    style={inputStyle}
                    placeholder="Region / State"
                    aria-label={`Location ${i + 1} region`}
                    value={l.region}
                    onChange={(e) => updateLocation(l._id, { region: e.target.value })}
                  />
                  <input
                    style={inputStyle}
                    placeholder="Country"
                    aria-label={`Location ${i + 1} country`}
                    value={l.country}
                    onChange={(e) => updateLocation(l._id, { country: e.target.value })}
                  />
                </div>
                {business.locations.length > 1 && (
                  <button
                    type="button"
                    style={{ ...smallButton, marginTop: 8 }}
                    aria-label={`Remove location ${i + 1}`}
                    onClick={() => removeLocation(l._id)}
                  >
                    Remove location
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={smallButton} onClick={addLocation}>
              + Add location
            </button>
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Hours</span>
            {business.hours.map((h, i) => (
              <div key={h._id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: '0 0 40%' }}
                  placeholder="Days (e.g. Mon–Fri)"
                  aria-label={`Hours ${i + 1} days`}
                  value={h.days}
                  onChange={(e) => updateHours(h._id, { days: e.target.value })}
                />
                <input
                  style={inputStyle}
                  placeholder="Open (e.g. 9:00)"
                  aria-label={`Hours ${i + 1} open`}
                  value={h.open}
                  onChange={(e) => updateHours(h._id, { open: e.target.value })}
                />
                <input
                  style={inputStyle}
                  placeholder="Close (e.g. 17:00)"
                  aria-label={`Hours ${i + 1} close`}
                  value={h.close}
                  onChange={(e) => updateHours(h._id, { close: e.target.value })}
                />
                {business.hours.length > 1 && (
                  <button
                    type="button"
                    style={smallButton}
                    aria-label={`Remove hours ${i + 1}`}
                    onClick={() => removeHours(h._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={smallButton} onClick={addHours}>
              + Add hours
            </button>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="email">
              Contact email <Req />
            </label>
            <input
              id="email"
              type="email"
              style={errBorder(inputStyle, !!businessErrors.email)}
              value={business.contact.email}
              aria-invalid={!!businessErrors.email}
              onChange={(e) =>
                setBusiness((b) => ({ ...b, contact: { ...b.contact, email: e.target.value } }))
              }
            />
            <FieldError msg={businessErrors.email} />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="phone">
              Contact phone
            </label>
            <input
              id="phone"
              type="tel"
              style={inputStyle}
              value={business.contact.phone}
              onChange={(e) =>
                setBusiness((b) => ({ ...b, contact: { ...b.contact, phone: e.target.value } }))
              }
            />
          </div>

          <div style={fieldStyle}>
            <span style={labelStyle}>Social profiles</span>
            {business.contact.socials.map((s, i) => (
              <div key={s._id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: '0 0 30%' }}
                  placeholder="Platform"
                  aria-label={`Social ${i + 1} platform`}
                  value={s.platform}
                  onChange={(e) => updateSocial(s._id, { platform: e.target.value })}
                />
                <input
                  style={inputStyle}
                  type="url"
                  placeholder="https://..."
                  aria-label={`Social ${i + 1} URL`}
                  value={s.url}
                  onChange={(e) => updateSocial(s._id, { url: e.target.value })}
                />
                {business.contact.socials.length > 1 && (
                  <button
                    type="button"
                    style={smallButton}
                    aria-label={`Remove social ${i + 1}`}
                    onClick={() => removeSocial(s._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={smallButton} onClick={addSocial}>
              + Add social
            </button>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="existingWebsiteUrl">
              Existing website
            </label>
            <input
              id="existingWebsiteUrl"
              type="url"
              style={inputStyle}
              placeholder="https://your-current-site.com"
              value={business.existingWebsiteUrl}
              onChange={(e) => setBusiness((b) => ({ ...b, existingWebsiteUrl: e.target.value }))}
            />
          </div>
        </Section>
      )}

      {step === 2 && (
        <Section title="Photos" subtitle="Optional — you can add these any time.">
          <p style={{ color: colors.muted, lineHeight: 1.6, marginBottom: 18, fontSize: 14 }}>
            You don&apos;t need photos to get started. We&apos;ll source tasteful stock imagery that
            fits your brand, and you can swap in your own later. If you already have image URLs
            handy, paste them below and we&apos;ll use them in the build.
          </p>
          {photoUrls.map((url, i) => (
            <div key={url._id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                style={inputStyle}
                type="url"
                placeholder="https://...image.jpg"
                aria-label={`Photo URL ${i + 1}`}
                value={url.value}
                onChange={(e) => setPhoto(url._id, e.target.value)}
              />
              {photoUrls.length > 1 && (
                <button
                  type="button"
                  style={smallButton}
                  aria-label={`Remove photo URL ${i + 1}`}
                  onClick={() => removePhoto(url._id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" style={smallButton} onClick={addPhoto}>
            + Add photo URL
          </button>
        </Section>
      )}

      {step === 3 && (
        <Section title="Choose your address" subtitle="This is where your site will live.">
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              style={inputStyle}
              placeholder="yourname"
              value={username}
              aria-describedby="username-preview"
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameStatus({ ok: false, checked: false });
              }}
              onBlur={() => username.trim() && checkUsername()}
            />
            <p id="username-preview" style={{ marginTop: 8, fontSize: 14, color: colors.muted }}>
              Preview:{' '}
              <strong style={{ color: colors.text }}>
                {(username.trim() || 'yourname').toLowerCase()}.simplesight.co
              </strong>
            </p>
            {usernameStatus.checked && usernameStatus.ok && (
              <p style={{ marginTop: 6, fontSize: 13, color: colors.success }}>
                ✓ That name is available.
              </p>
            )}
            {usernameStatus.checked && !usernameStatus.ok && usernameStatus.error && (
              <p style={{ marginTop: 6, fontSize: 13, color: colors.error }}>
                {usernameStatus.error}
              </p>
            )}
          </div>
        </Section>
      )}

      {step === 4 && (
        <Section title="Review" subtitle="Make sure everything looks right.">
          <ReviewBlock title="Style">
            <ReviewRow label="Vibe" value={style.vibe.join(', ') || '—'} />
            <ReviewRow label="Mood" value={style.mood ?? '—'} />
            <ReviewRow label="Colors" value={style.colorPreference || '—'} />
            <ReviewRow
              label="References"
              value={
                style.referenceUrls
                  .map((u) => u.value.trim())
                  .filter(Boolean)
                  .join(', ') || '—'
              }
            />
            <ReviewRow label="Avoid" value={style.avoid || '—'} />
          </ReviewBlock>

          <ReviewBlock title="Business">
            <ReviewRow label="Name" value={business.name || '—'} />
            <ReviewRow label="Tagline" value={business.tagline || '—'} />
            <ReviewRow label="Description" value={business.description || '—'} />
            <ReviewRow label="Category" value={business.category || '—'} />
            <ReviewRow
              label="Services"
              value={
                business.services
                  .filter((s) => s.name.trim())
                  .map((s) => s.name)
                  .join(', ') || '—'
              }
            />
            <ReviewRow label="Audience" value={business.audience || '—'} />
            <ReviewRow label="Email" value={business.contact.email || '—'} />
            <ReviewRow label="Phone" value={business.contact.phone || '—'} />
          </ReviewBlock>

          <ReviewBlock title="Photos">
            <ReviewRow
              label="Pasted URLs"
              value={
                photoUrls
                  .map((u) => u.value.trim())
                  .filter(Boolean)
                  .join(', ') || "None — we'll source imagery"
              }
            />
          </ReviewBlock>

          <ReviewBlock title="Address">
            <ReviewRow
              label="Site URL"
              value={`${(username.trim() || 'yourname').toLowerCase()}.simplesight.co`}
            />
          </ReviewBlock>

          {!businessValid && (
            <p style={{ fontSize: 13, color: colors.error, marginBottom: 12 }}>
              Business name, description, and contact email are required before building. Go back to
              the Business step to complete them.
            </p>
          )}

          <button
            type="button"
            style={primaryButton}
            onClick={submit}
            disabled={isPending || !businessValid}
          >
            {isPending ? 'Submitting…' : 'Build my website'}
          </button>
        </Section>
      )}

      {saveError && (
        <p role="alert" style={{ fontSize: 13, color: colors.error, marginTop: 12 }}>
          {saveError}
        </p>
      )}

      {/* Nav */}
      {step < 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button
            type="button"
            style={{ ...secondaryButton, visibility: step === 0 ? 'hidden' : 'visible' }}
            onClick={goBack}
            disabled={isPending}
          >
            Back
          </button>
          <button type="button" style={primaryButton} onClick={goNext} disabled={isPending}>
            {isPending ? 'Saving…' : 'Next'}
          </button>
        </div>
      )}
      {step === 4 && (
        <div style={{ marginTop: 20 }}>
          <button type="button" style={secondaryButton} onClick={goBack} disabled={isPending}>
            Back
          </button>
        </div>
      )}
    </Shell>
  );
}

// --- Presentational helpers --------------------------------------------------

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 24px 96px',
        fontFamily: 'system-ui, sans-serif',
        color: colors.text,
      }}
    >
      {children}
    </main>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <nav aria-label="Onboarding progress" style={{ marginBottom: 32 }}>
      <ol
        style={{
          display: 'flex',
          gap: 8,
          listStyle: 'none',
          padding: 0,
          margin: 0,
          flexWrap: 'wrap',
        }}
      >
        {STEPS.map((label, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                aria-current={active ? 'step' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  fontSize: 12,
                  fontWeight: 600,
                  background: active || done ? colors.primary : colors.subtle,
                  color: active || done ? colors.primaryText : colors.muted,
                  border: `1px solid ${active || done ? colors.primary : colors.border}`,
                }}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? colors.text : colors.muted,
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h1>
      {subtitle && (
        <p style={{ color: colors.muted, marginTop: 4, marginBottom: 24, fontSize: 14 }}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

function Req() {
  return (
    <span style={{ color: colors.error }} aria-hidden>
      *
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: colors.error, marginTop: 4 }}>{msg}</p>;
}

function errBorder(base: React.CSSProperties, hasError: boolean): React.CSSProperties {
  return hasError ? { ...base, borderColor: colors.error } : base;
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>{title}</h2>
      <dl style={{ margin: 0 }}>{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '3px 0', fontSize: 14 }}>
      <dt style={{ flex: '0 0 110px', color: colors.muted }}>{label}</dt>
      <dd style={{ margin: 0, color: colors.text, wordBreak: 'break-word' }}>{value}</dd>
    </div>
  );
}
