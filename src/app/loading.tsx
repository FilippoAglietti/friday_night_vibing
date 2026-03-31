export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block mb-8">
          {/* Animated spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-violet-600/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-400 animate-spin"></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
        <p className="text-violet-300">Preparing your content</p>

        {/* Animated dots for visual interest */}
        <div className="flex justify-center gap-1 mt-8">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  );
}
