import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "./intake-form";

export const metadata: Metadata = {
  title: "Start your website — Simple Site",
  description: "Tell us about your business. We'll send three custom design concepts within 5 business days.",
};

export default function StartPage() {
  return (
    <main className="min-h-dvh bg-[#f7f5f0] text-[#111]">
      <header className="border-b border-black/[0.06] bg-[#f7f5f0]/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-[15px]">
            Simple Site<span className="text-[#c2410c]">.</span>
          </Link>
          <p className="text-xs text-black/60 hidden sm:block">
            Takes ~8 minutes · Your info stays private
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 pt-12 pb-24">
        <IntakeForm />
      </div>
    </main>
  );
}
