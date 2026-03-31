"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 inline-flex p-4 bg-red-900/30 rounded-full">
          <AlertCircle className="w-16 h-16 text-red-400" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">
          Something went wrong
        </h1>
        
        <p className="text-slate-300 mb-2">
          We encountered an unexpected error. Please try again.
        </p>

        {error.digest && (
          <p className="text-xs text-slate-500 mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 border border-violet-600 hover:bg-violet-600/10 text-violet-400 font-semibold rounded-lg transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
