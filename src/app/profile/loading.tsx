export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="absolute inset-0 h-[400px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-500/10 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="size-14 sm:size-16 rounded-2xl bg-violet-500/20 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-md bg-violet-500/20 animate-pulse" />
              <div className="h-6 w-40 rounded-md bg-muted/40 animate-pulse" />
              <div className="flex gap-2 pt-1">
                <div className="h-5 w-20 rounded-full bg-muted/30 animate-pulse" />
                <div className="h-5 w-24 rounded-full bg-muted/30 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-3"
            >
              <div className="h-5 w-3/4 rounded-md bg-muted/40 animate-pulse" />
              <div className="h-3 w-full rounded bg-muted/25 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-muted/25 animate-pulse" />
              <div className="flex gap-2 pt-3">
                <div className="h-7 w-20 rounded-full bg-violet-500/20 animate-pulse" />
                <div className="h-7 w-16 rounded-full bg-muted/30 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
