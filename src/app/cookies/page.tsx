import type { Metadata } from "next";
import { GraduationCap, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy — Syllabi.ai",
  description: "How Syllabi.ai uses cookies and similar tracking technologies.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.ai</span></span>
          </a>
          <a href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to home
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: March 31, 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-7 text-foreground/80">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, function more efficiently, and provide information to site operators. Cookies do not contain personally identifiable information on their own, but they may be linked to personal information we hold.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Cookies We Use</h2>

            <div className="mt-4 space-y-5">
              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <h3 className="font-semibold text-foreground mb-1">Strictly Necessary Cookies</h3>
                <p className="text-muted-foreground text-xs mb-3">These cookies are essential for the Service to function. They cannot be disabled.</p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 pr-4 font-medium text-foreground/70">Cookie Name</th>
                      <th className="text-left py-2 pr-4 font-medium text-foreground/70">Provider</th>
                      <th className="text-left py-2 font-medium text-foreground/70">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    <tr>
                      <td className="py-2 pr-4 font-mono">sb-*</td>
                      <td className="py-2 pr-4">Supabase</td>
                      <td className="py-2">Authentication session tokens</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono">__stripe_mid</td>
                      <td className="py-2 pr-4">Stripe</td>
                      <td className="py-2">Payment fraud prevention</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono">__stripe_sid</td>
                      <td className="py-2 pr-4">Stripe</td>
                      <td className="py-2">Payment session tracking</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <h3 className="font-semibold text-foreground mb-1">Preferences Cookies</h3>
                <p className="text-muted-foreground text-xs mb-3">These cookies remember your settings and preferences.</p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 pr-4 font-medium text-foreground/70">Cookie Name</th>
                      <th className="text-left py-2 pr-4 font-medium text-foreground/70">Provider</th>
                      <th className="text-left py-2 font-medium text-foreground/70">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    <tr>
                      <td className="py-2 pr-4 font-mono">syllabi_dark</td>
                      <td className="py-2 pr-4">Syllabi.ai</td>
                      <td className="py-2">Stores your dark/light mode preference</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/40 p-5">
                <h3 className="font-semibold text-foreground mb-1">Analytics Cookies</h3>
                <p className="text-muted-foreground text-xs mb-3">These cookies help us understand how the Service is used so we can improve it. Data is aggregated and anonymous.</p>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 pr-4 font-medium text-foreground/70">Cookie Name</th>
                      <th className="text-left py-2 pr-4 font-medium text-foreground/70">Provider</th>
                      <th className="text-left py-2 font-medium text-foreground/70">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    <tr>
                      <td className="py-2 pr-4 font-mono">va_*</td>
                      <td className="py-2 pr-4">Vercel Analytics</td>
                      <td className="py-2">Page view and interaction analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third parties acting on our behalf. These third parties have their own privacy and cookie policies:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li><strong>Supabase</strong> — Authentication and session management. <a href="https://supabase.com/privacy" className="text-violet-400 hover:text-violet-300" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Stripe</strong> — Payment processing and fraud prevention. <a href="https://stripe.com/privacy" className="text-violet-400 hover:text-violet-300" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Vercel Analytics</strong> — Privacy-focused, aggregated web analytics. <a href="https://vercel.com/legal/privacy-policy" className="text-violet-400 hover:text-violet-300" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. How to Control Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings. Most browsers allow you to refuse or delete cookies. Please note that disabling strictly necessary cookies may affect the functionality of the Service (e.g., you may not be able to stay signed in).
            </p>
            <p className="mt-3">Browser cookie management guides:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Chrome: Settings → Privacy and security → Cookies</li>
              <li>Firefox: Settings → Privacy &amp; Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Manage Website Data</li>
              <li>Edge: Settings → Cookies and site permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Do Not Track</h2>
            <p>
              Some browsers include a "Do Not Track" (DNT) feature. Our Service currently does not respond to DNT signals, as there is no industry-standard interpretation. We do not track users across third-party websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy periodically. Continued use of the Service after changes constitutes acceptance. For significant changes, we will notify you via email or a site notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact</h2>
            <p>
              Questions? Email us at <a href="mailto:privacy@syllabi.ai" className="text-violet-400 hover:text-violet-300">privacy@syllabi.ai</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/cookies" className="text-foreground">Cookies</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
