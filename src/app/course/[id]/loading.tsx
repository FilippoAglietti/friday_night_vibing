export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="absolute inset-0 h-[500px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />

      <header className="relative border-b border-border/40 bg-background/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="h-5 w-32 rounded-md bg-muted/40 animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-muted/40 animate-pulse" />
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-10 space-y-4">
          <div className="h-4 w-24 rounded-full bg-violet-500/20 animate-pulse" />
          <div className="h-10 w-3/4 rounded-lg bg-muted/40 animate-pulse" />
          <div className="h-5 w-2/3 rounded-md bg-muted/30 animate-pulse" />
          <div className="flex gap-3 pt-2">
            <div className="h-6 w-20 rounded-full bg-muted/30 animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-muted/30 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-muted/30 animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-violet-500/20 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/2 rounded-md bg-muted/40 animate-pulse" />
                  <div className="h-3 w-1/3 rounded-md bg-muted/30 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 pl-13">
                <div className="h-3 w-full rounded bg-muted/25 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-muted/25 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-muted/25 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
