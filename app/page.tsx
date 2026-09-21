export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
          JournalX
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Turn Every Trade Into Better Decisions.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
          A professional trading journal and analytics platform. Phase 1
          foundation is ready for the next development phases.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">
            Start Journaling
          </button>
          <button className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold">
            View Pricing
          </button>
        </div>
      </section>
    </main>
  );
}
