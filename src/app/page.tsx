import { ThemeToggle } from "@/shared/ui/theme-toggle";

// Phase 0 placeholder. Phase 1 replaces this with the real Home page.
export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">Deep Semantic</span>
        <ThemeToggle />
      </header>

      <main id="main" className="flex flex-1 flex-col justify-center gap-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          English, taught with care.
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          The new website is under construction. Teaching materials, lesson requests and more are
          coming soon.
        </p>
      </main>
    </div>
  );
}
