import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "./intake-form";

export const metadata: Metadata = {
  title: "Start your website — Simple Site",
  description: "Tell us about your business. Three custom design concepts within 24 hours.",
};

export default function StartPage() {
  return (
    <main className="min-h-dvh bg-[#f7f5f0] text-[#111]">
      <header className="border-b border-black/[0.06] bg-[#f7f5f0]/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="font-semibold tracking-tight text-[15px] shrink-0">
            Simple Site<span className="text-[#c2410c]">.</span>co
          </Link>
          <p className="text-xs text-black/60 hidden sm:block">
            Takes ~8 minutes · Your info stays private
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 sm:px-6 pt-10 sm:pt-12 pb-20 sm:pb-24">
        <IntakeForm />
      </div>
    </main>
  );
}
