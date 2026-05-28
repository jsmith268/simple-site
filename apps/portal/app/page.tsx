import Link from "next/link";
import { Button, Container, Eyebrow, Logo, Title } from "./ui";

export default function Page() {
  return (
    <div className="min-h-screen brand-gradient">
      <header className="border-b border-line/70">
        <Container size="lg" className="flex h-16 items-center">
          <Logo />
        </Container>
      </header>
      <Container size="sm" className="py-24 text-center sm:py-32">
        <Eyebrow>Autonomous web studio</Eyebrow>
        <Title as="h1" className="mx-auto mt-4 max-w-2xl text-4xl leading-[1.05] sm:text-6xl">
          A website worth paying for, built while you watch.
        </Title>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-ink-soft">
          Two AI studios design and build you a complete site from a short conversation. Compare both, pick your favorite, and refine it page by page — then go live.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/buy">
            <Button size="lg">Start your site →</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
