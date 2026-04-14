import type { Metadata } from "next";
import { Suspense } from "react";
import SharePageContent from "./share-content";

export const metadata: Metadata = {
  title: "Shared Course | Syllabi",
  robots: { index: false, follow: true },
};

export default function SharePage() {
  return (
    <Suspense fallback={<SharePageFallback />}>
      <SharePageContent />
    </Suspense>
  );
}

function SharePageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block mb-6">
          <div className="w-12 h-12 border-4 border-violet-600/30 border-t-violet-400 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading course...</h2>
        <p className="text-violet-300">Please wait while we prepare your course.</p>
      </div>
    </div>
  );
}
