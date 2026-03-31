import type { Metadata } from "next";
import { GraduationCap, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Syllabi.ai",
  description: "How Syllabi.ai collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: March 31, 2026</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-7 text-foreground/80">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              Syllabi.ai ("we," "our," or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and AI course generation service at syllabi.ai (the "Service").
            </p>
            <p className="mt-3">
              By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-semibold text-foreground/90 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> Email address and display name when you create an account via Google OAuth or email sign-up.</li>
              <li><strong>Course generation inputs:</strong> Topics, audience levels, and preferences you provide when generating course curricula.</li>
              <li><strong>Payment information:</strong> Billing details processed securely by Stripe. We do not store full credit card numbers.</li>
              <li><strong>Communications:</strong> Messages you send to our support team or through feedback forms.</li>
            </ul>
            <h3 className="text-base font-semibold text-foreground/90 mb-2 mt-4">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Usage data:</strong> Pages visited, features used, click events, and session duration via Vercel Analytics.</li>
              <li><strong>Device information:</strong> Browser type, operating system, IP address, and referring URLs.</li>
              <li><strong>Cookies and similar technologies:</strong> Session tokens, authentication state, and preference cookies. See our Cookie Policy for details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide, operate, and improve the Service.</li>
              <li>To generate AI-powered course curricula using your inputs.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>To send transactional emails (account confirmations, receipts, password resets).</li>
              <li>To respond to support requests and feedback.</li>
              <li>To detect and prevent fraud, abuse, or security incidents.</li>
              <li>To analyze aggregate usage patterns and improve our AI models (never using personally identifiable information).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Sharing Your Information</h2>
            <p>We do not sell your personal information. We share data only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li><strong>Service providers:</strong> Supabase (database & auth), Stripe (payments), Anthropic (AI generation), Vercel (hosting & analytics). Each is bound by confidentiality obligations.</li>
              <li><strong>Legal requirements:</strong> When required by law, subpoena, or court order.</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred with appropriate notice.</li>
              <li><strong>With your consent:</strong> For any other purpose with your explicit permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide the Service. Course generations are stored in your account history and can be deleted at any time from your profile page. You may request full account deletion by contacting us at <a href="mailto:privacy@syllabi.ai" className="text-violet-400 hover:text-violet-300">privacy@syllabi.ai</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption in transit, hashed credentials, and role-based database access via Supabase Row Level Security. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Access, correct, or delete your personal data.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Data portability (receive a copy of your data in a structured format).</li>
              <li>Withdraw consent at any time (where processing is based on consent).</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@syllabi.ai" className="text-violet-400 hover:text-violet-300">privacy@syllabi.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us personal information, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page with an updated date and, where appropriate, via email. Your continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:<br />
              <strong>Email:</strong> <a href="mailto:privacy@syllabi.ai" className="text-violet-400 hover:text-violet-300">privacy@syllabi.ai</a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
            <a href="/privacy" className="text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
