import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 inline-flex p-4 bg-violet-900/30 rounded-full">
          <GraduationCap className="w-16 h-16 text-violet-400" />
        </div>

        <h1 className="text-7xl font-bold text-white mb-2">404</h1>
        
        <h2 className="text-3xl font-bold text-violet-100 mb-4">
          Page not found
        </h2>
        
        <p className="text-slate-300 mb-8">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-violet-500/50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
