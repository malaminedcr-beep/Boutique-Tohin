export default function Loading() {
  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-12">
        <div className="mb-5 h-8 w-48 animate-pulse rounded bg-hairline md:mb-8" />
        <div className="mb-5 flex gap-2 md:hidden">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-hairline" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="hidden md:block">
            <div className="h-72 animate-pulse rounded-2xl bg-hairline/60" />
          </div>
          <div className="space-y-4">
            <div className="h-36 animate-pulse rounded-2xl bg-hairline/60" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-28 animate-pulse rounded-2xl bg-hairline/60" />
              <div className="h-28 animate-pulse rounded-2xl bg-hairline/60" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
