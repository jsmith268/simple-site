import { cn } from "@simplesight/ui";
import type React from "react";

export { cn };

/* ── Layout shells ─────────────────────────────────────────────────────── */

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-h-screen brand-gradient", className)}>{children}</div>;
}

export function Container({ children, className, size = "md" }: { children: React.ReactNode; className?: string; size?: "sm" | "md" | "lg" }) {
  const max = size === "sm" ? "max-w-2xl" : size === "lg" ? "max-w-6xl" : "max-w-4xl";
  return <div className={cn("mx-auto w-full px-5 sm:px-8", max, className)}>{children}</div>;
}

/* ── Brand mark ────────────────────────────────────────────────────────── */

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-ink text-brand-ink">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 11.5c1.6 1 3 1.4 4.2 1.1 1.8-.4 2-2 .6-2.7-1-.5-3.2-.6-4-1.6-1-1.2.1-3 2.6-3.3 1.3-.2 2.6.1 3.8.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight">Simple Site</span>
    </span>
  );
}

/* ── Surfaces ──────────────────────────────────────────────────────────── */

export function Card({
  children,
  className,
  as: As = "div",
  hover,
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  hover?: boolean;
}) {
  return (
    <As
      className={cn(
        "rounded-lg border border-line bg-surface shadow-sm",
        hover && "transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function Title({ children, className, as: As = "h1" }: { children: React.ReactNode; className?: string; as?: React.ElementType }) {
  return <As className={cn("font-display font-semibold tracking-tight text-ink", className)}>{children}</As>;
}

/* ── Buttons ───────────────────────────────────────────────────────────── */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none select-none";
const BTN_VARIANT: Record<string, string> = {
  primary: "bg-brand text-brand-ink hover:brightness-[1.06] shadow-sm hover:shadow-md",
  secondary: "bg-surface text-ink border border-line-strong hover:border-ink/40 hover:bg-paper-2",
  ghost: "text-ink-soft hover:bg-ink/[0.05]",
  danger: "bg-danger text-brand-ink hover:brightness-105",
};
const BTN_SIZE: Record<string, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-5 text-[14px]",
  lg: "h-12 px-7 text-[15px]",
};

export function Button({ variant = "primary", size = "md", loading, className, children, ...rest }: ButtonProps) {
  return (
    <button className={cn(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...rest}>
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Form fields ───────────────────────────────────────────────────────── */

export function Field({ label, hint, htmlFor, children, className }: { label?: string; hint?: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-soft">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

const INPUT =
  "w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/80 transition-colors focus:border-brand/50 focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(INPUT, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(INPUT, "min-h-[96px] resize-y leading-relaxed", props.className)} />;
}

/* ── Chips, badges, pills ──────────────────────────────────────────────── */

export function Chip({
  children,
  selected,
  className,
  as: As = "span",
  ...rest
}: {
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <As
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition-all duration-150 ease-out",
        selected
          ? "border-brand bg-brand-soft text-brand"
          : "border-line-strong bg-surface text-ink-soft hover:border-ink/30 hover:bg-paper-2",
        className,
      )}
      {...rest}
    >
      {children}
    </As>
  );
}

const TONE: Record<string, string> = {
  neutral: "bg-paper-2 text-ink-soft border-line",
  brand: "bg-brand-soft text-brand border-brand/20",
  success: "bg-success-soft text-success border-success/20",
  warn: "bg-warn-soft text-warn border-warn/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-[color-mix(in_oklab,var(--color-info)_10%,white)] text-info border-info/20",
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: keyof typeof TONE; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold", TONE[tone], className)}>
      {children}
    </span>
  );
}

/* ── Progress + steps ──────────────────────────────────────────────────── */

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-line", className)}>
      <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
