import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy — Syllabi.ai",
  description: "Cookie Policy for Syllabi.ai (syllabi.online). What cookies and local storage we use and why.",
};

const EFFECTIVE_DATE = "March 31, 2026";
const CONTACT_EMAIL = "privacy@syllabi.online";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GraduationCap className="size-5 text-violet-500" />
            <span>syllabi<span className="text-violet-500">.ai</span></span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Legal</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
          <p className="mt-3 text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-foreground [&_a]:text-violet-400 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">

          <section>
            <p>
              This Cookie Policy explains how Syllabi.ai (&quot;Syllabi&quot;, &quot;we&quot;, &quot;us&quot;) uses
              cookies and similar tracking technologies on <a href="https://syllabi.online">syllabi.online</a>. It
              should be read alongside our <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device by a website you visit. They are widely used to make
              websites work efficiently and to provide information to site operators. In addition to standard cookies,
              we also use <strong>browser local storage</strong> and <strong>session storage</strong> for certain
              functionality — these are similar in nature but stored in your browser rather than sent with every HTTP
              request.
            </p>
          </section>

          <section>
            <h2>2. Cookies We Use</h2>

            {/* Strictly Necessary */}
            <h3>2.1 Strictly Necessary (Always Active)</h3>
            <p>
              These cookies are essential for the Service to function and cannot be switched off. They do not store
              personally identifiable information beyond what is required for the session.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Name / Key</th>
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Provider</th>
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Purpose</th>
                    <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-foreground">sb-&lt;project&gt;-auth-token</td>
                    <td className="py-2 pr-4">Supabase</td>
                    <td className="py-2 pr-4">Stores your authentication session token after sign-in. Required to identify you as a logged-in user across page loads.</td>
                    <td className="py-2">Session / up to 1 year (refresh token)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-foreground">sb-&lt;project&gt;-auth-token-code-verifier</td>
                    <td className="py-2 pr-4">Supabase</td>
                    <td className="py-2 pr-4">PKCE code verifier used during the OAuth sign-in flow with Google. Deleted immediately after authentication completes.</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-foreground">__stripe_mid / __stripe_sid</td>
                    <td className="py-2 pr-4">Stripe</td>
                    <td className="py-2 pr-4">Fraud prevention and security checks required to process payments securely.</td>
                    <td className="py-2">1 year / 30 minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Functional */}
            <h3>2.2 Functional / Preference</h3>
            <p>
              These store your preferences to improve your experience. They are set by our application and remain
              on your device until cleared.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Name / Key</th>
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Storage</th>
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Purpose</th>
                    <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-foreground">theme</td>
                    <td className="py-2 pr-4">localStorage</td>
                    <td className="py-2 pr-4">Saves your light/dark mode preference so it persists across sessions.</td>
                    <td className="py-2">Persistent</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-foreground">syllabi_last_topic</td>
                    <td className="py-2 pr-4">localStorage</td>
                    <td className="py-2 pr-4">Remembers your last-used course generation settings to pre-fill the form on return visits.</td>
                    <td className="py-2">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Analytics */}
            <h3>2.3 Analytics and Performance</h3>
            <p>
              These help us understand how the Service is used in aggregate, identify performance issues, and improve
              the product. Data is collected anonymously or pseudonymously and is not used for advertising.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Name / Key</th>
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Provider</th>
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Purpose</th>
                    <th className="text-left py-2 text-foreground font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-foreground">va-* / _va_*</td>
                    <td className="py-2 pr-4">Vercel Analytics</td>
                    <td className="py-2 pr-4">
                      Tracks page views, navigation events, and interaction data to help us understand which features
                      are used. Data is aggregated; no personally identifiable information is sent to Vercel Analytics.
                      Privacy-focused — no cross-site tracking.
                    </td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-foreground">si-* / _si_*</td>
                    <td className="py-2 pr-4">Vercel Speed Insights</td>
                    <td className="py-2 pr-4">
                      Measures Core Web Vitals (LCP, CLS, FID) and page load performance metrics. Used to optimize
                      the technical performance of the Service. No personal data is collected.
                    </td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              We do not use cookies for <strong>advertising</strong>, <strong>retargeting</strong>, or{" "}
              <strong>cross-site tracking</strong>. We do not sell cookie data.
            </p>
          </section>

          <section>
            <h2>3. Third-Party Cookies</h2>
            <p>
              Some cookies on Syllabi.ai are set by third-party services we use. These third parties have their own
              cookie policies:
            </p>
            <ul>
              <li>
                <strong>Supabase:</strong>{" "}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>
              </li>
              <li>
                <strong>Stripe:</strong>{" "}
                <a href="https://stripe.com/cookie-settings" target="_blank" rel="noopener noreferrer">stripe.com/cookie-settings</a>
              </li>
              <li>
                <strong>Vercel:</strong>{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>
              </li>
              <li>
                <strong>Google (OAuth):</strong>{" "}
                <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/cookies</a>
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Your Choices</h2>

            <h3>Browser Settings</h3>
            <p>
              You can control and delete cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul>
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific sites</li>
              <li>Block all cookies entirely (note: this will break authentication and prevent you from signing in)</li>
            </ul>
            <p className="mt-3">Instructions for common browsers:</p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
              <li><a href="https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406" target="_blank" rel="noopener noreferrer">Edge</a></li>
            </ul>

            <h3>Opting Out of Analytics</h3>
            <p>
              Vercel Analytics respects the browser{" "}
              <a href="https://developer.mozilla.org/docs/Web/HTTP/Headers/DNT" target="_blank" rel="noopener noreferrer">
                Do Not Track
              </a>{" "}
              (DNT) signal and the{" "}
              <a href="https://globalprivacycontrol.org/" target="_blank" rel="noopener noreferrer">
                Global Privacy Control
              </a>{" "}
              (GPC) standard. Enabling either of these in your browser will opt you out of analytics tracking on
              Syllabi.ai.
            </p>
          </section>

          <section>
            <h2>5. Cookie Consent</h2>
            <p>
              Strictly necessary cookies (authentication and payment security) are required for the Service to function
              and are set without requiring consent under applicable exemptions in EU ePrivacy law and similar
              regulations.
            </p>
            <p className="mt-3">
              Analytics and performance cookies are set based on our <strong>legitimate interest</strong> in improving
              the Service. These cookies do not track you across other websites and do not collect personally
              identifiable information. We consider this processing proportionate and not overriding your interests.
            </p>
            <p className="mt-3">
              If you are in the EU/EEA or a jurisdiction that requires explicit consent for non-essential cookies,
              and you wish to withdraw any consent you have given, please contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or clear the relevant cookies from your browser.
            </p>
          </section>

          <section>
            <h2>6. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. When we do, we will revise the &quot;Effective
              date&quot; at the top of this page. For significant changes, we will notify you via the Service or by
              email.
            </p>
          </section>

          <section>
            <h2>7. Contact Us</h2>
            <p>
              For cookie-related questions or to exercise your rights, contact us at:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li><strong>Website:</strong> <a href="https://syllabi.online">syllabi.online</a></li>
            </ul>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-foreground transition-colors">← Home</Link>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-8">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Syllabi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
