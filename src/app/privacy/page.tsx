import type { Metadata } from "next";
import Link from "next/link";
import SubpageNav from "@/components/SubpageNav";
import SubpageBackLink from "@/components/SubpageBackLink";

export const metadata: Metadata = {
  title: "Privacy Policy — Syllabi.ai",
  description: "Privacy Policy for Syllabi.ai (syllabi.online). How we collect, use, and protect your personal data.",
};

const EFFECTIVE_DATE = "March 31, 2026";
const CONTACT_EMAIL = "privacy@syllabi.online";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SubpageNav />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-500 mb-3">Legal</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-foreground [&_a]:text-violet-400 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5">

          <section>
            <p>
              Syllabi.ai (&quot;Syllabi&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website{" "}
              <a href="https://syllabi.online">syllabi.online</a> and provides an AI-powered course generation service.
              This Privacy Policy explains how we collect, use, disclose, and protect information about you when you use
              our services. By accessing or using Syllabi.ai, you agree to this policy.
            </p>
            <p className="mt-3">
              This policy is intended to comply with applicable data protection laws including the{" "}
              <strong>General Data Protection Regulation (GDPR)</strong>, the{" "}
              <strong>California Consumer Privacy Act (CCPA)</strong> as amended by the CPRA, and other applicable
              privacy legislation.
            </p>
          </section>

          <section>
            <h2>1. Information We Collect</h2>

            <h3>1.1 Information You Provide Directly</h3>
            <ul>
              <li>
                <strong>Account information:</strong> When you sign up, we collect your email address and display name
                via Google OAuth (no passwords are stored by Syllabi.ai directly).
              </li>
              <li>
                <strong>Course generation inputs:</strong> Topic, target audience, course length, niche, and any other
                fields you enter into the course generator.
              </li>
              <li>
                <strong>Payment information:</strong> Billing details (name, address, card last-4, billing country) are
                collected and processed by Stripe, Inc. We do not store full card numbers.
              </li>
              <li>
                <strong>Communications:</strong> Messages you send to us via email or feedback forms.
              </li>
            </ul>

            <h3>1.2 Information Collected Automatically</h3>
            <ul>
              <li>
                <strong>Usage data:</strong> Pages viewed, features used, generation count, timestamps, and interaction
                events collected via Vercel Analytics.
              </li>
              <li>
                <strong>Performance data:</strong> Core Web Vitals and performance metrics collected via Vercel Speed
                Insights.
              </li>
              <li>
                <strong>Log data:</strong> IP address, browser type, operating system, referrer URL, and request
                metadata processed by our hosting infrastructure (Vercel).
              </li>
              <li>
                <strong>Cookies and local storage:</strong> Authentication tokens, session state, and preference data.
                See our <Link href="/cookies" className="text-violet-400">Cookie Policy</Link> for details.
              </li>
            </ul>

            <h3>1.3 Information from Third Parties</h3>
            <ul>
              <li>
                <strong>Google OAuth:</strong> When you sign in with Google, we receive your name, email address, and
                profile picture URL from Google&apos;s authentication service.
              </li>
              <li>
                <strong>Stripe:</strong> We receive payment confirmations, subscription status, customer IDs, and
                billing event data from Stripe.
              </li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information for the following purposes, each grounded in a lawful basis:</p>
            <ul>
              <li>
                <strong>Providing the service (Contract):</strong> Processing course generation requests, managing your
                account, storing your generated courses, and delivering exports (PDF, Notion).
              </li>
              <li>
                <strong>Billing and payments (Contract):</strong> Processing subscription payments, managing plan
                limits, issuing invoices, and handling refunds via Stripe.
              </li>
              <li>
                <strong>Service improvement (Legitimate interest):</strong> Analyzing usage patterns to improve features,
                fix bugs, and optimize performance. We use aggregated or anonymized data where possible.
              </li>
              <li>
                <strong>Security (Legitimate interest / Legal obligation):</strong> Detecting and preventing fraud,
                abuse, and unauthorized access.
              </li>
              <li>
                <strong>Communications (Consent / Contract):</strong> Sending transactional emails (password reset,
                billing receipts). We do not send marketing emails without explicit opt-in consent.
              </li>
              <li>
                <strong>Legal compliance (Legal obligation):</strong> Complying with applicable laws, responding to
                lawful requests from public authorities, and enforcing our Terms of Service.
              </li>
            </ul>

            <h3>AI Processing</h3>
            <p>
              Your course generation inputs are sent to <strong>Anthropic, Inc.</strong> via their Claude API to
              generate course content. Inputs are processed in real time and are subject to{" "}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">
                Anthropic&apos;s Privacy Policy
              </a>
              . We do not use your inputs to train Anthropic&apos;s models (this is governed by our data processing
              agreement with Anthropic). We do not sell or share your course inputs with any other AI providers.
            </p>
          </section>

          <section>
            <h2>3. Third-Party Services</h2>
            <p>
              We use the following sub-processors and third-party services. Each processes your data only as necessary
              to provide their function:
            </p>
            <ul>
              <li>
                <strong>Supabase, Inc.</strong> — Database and authentication infrastructure. Stores your account data,
                generated course records, and session tokens. Data is stored in the US (AWS us-east-1) unless a
                different region is selected. See:{" "}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.
              </li>
              <li>
                <strong>Stripe, Inc.</strong> — Payment processing, subscription management, and billing. Stripe is PCI
                DSS Level 1 certified. See:{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>.
              </li>
              <li>
                <strong>Anthropic, Inc.</strong> — AI model inference for course generation via the Claude API. See:{" "}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">anthropic.com/privacy</a>.
              </li>
              <li>
                <strong>Vercel, Inc.</strong> — Hosting, edge network, analytics, and performance monitoring. See:{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>.
              </li>
              <li>
                <strong>Google LLC</strong> — Authentication via Google OAuth (Sign in with Google). See:{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Data Retention</h2>
            <ul>
              <li>
                <strong>Account data:</strong> Retained for the lifetime of your account and for up to{" "}
                <strong>30 days</strong> after account deletion, to allow recovery from accidental deletions.
              </li>
              <li>
                <strong>Generated courses:</strong> Retained for the lifetime of your account. You may delete individual
                courses at any time from your profile page.
              </li>
              <li>
                <strong>Billing records:</strong> Retained for <strong>7 years</strong> for tax and accounting
                compliance, even after account deletion.
              </li>
              <li>
                <strong>Server logs:</strong> Retained for up to <strong>90 days</strong> for security and debugging.
              </li>
              <li>
                <strong>Analytics data:</strong> Aggregated or anonymized usage data may be retained indefinitely.
              </li>
            </ul>
            <p className="mt-3">
              After account deletion, all personal data is purged from our active systems within 30 days, subject to
              the retention exceptions listed above.
            </p>
          </section>

          <section>
            <h2>5. Your Rights</h2>

            <h3>For All Users</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate personal data</li>
              <li>Delete your account and associated personal data</li>
              <li>Export your generated courses (available via your profile page)</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>

            <h3>EU / EEA Residents (GDPR)</h3>
            <p>In addition to the above, you have the right to:</p>
            <ul>
              <li><strong>Data portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Restriction of processing:</strong> Request we limit how we use your data while a dispute is resolved</li>
              <li><strong>Object to processing:</strong> Object to processing based on legitimate interests</li>
              <li>
                <strong>Lodge a complaint:</strong> With your local data protection authority (e.g., the ICO in the UK,
                the CNIL in France)
              </li>
            </ul>
            <p className="mt-3">
              Our lawful bases for processing are: <strong>contract performance</strong> (account and billing),{" "}
              <strong>legitimate interests</strong> (analytics, security), and <strong>legal obligation</strong>{" "}
              (tax/accounting records).
            </p>

            <h3>California Residents (CCPA / CPRA)</h3>
            <p>California residents have the right to:</p>
            <ul>
              <li>Know what personal information is collected, used, shared, or sold</li>
              <li>Delete personal information (subject to certain exceptions)</li>
              <li>Opt out of the sale or sharing of personal information</li>
              <li>Non-discrimination for exercising privacy rights</li>
              <li>Correct inaccurate personal information</li>
              <li>Limit use of sensitive personal information</li>
            </ul>
            <p className="mt-3">
              <strong>We do not sell personal information</strong> as defined by the CCPA. We do not share personal
              information with third parties for cross-context behavioral advertising.
            </p>
            <p className="mt-3">
              To exercise your rights, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond within 30 days (GDPR) or 45 days
              (CCPA). We may need to verify your identity before processing requests.
            </p>
          </section>

          <section>
            <h2>6. International Transfers</h2>
            <p>
              Syllabi.ai is operated from the United States. If you access the service from outside the US, your
              information may be transferred to, stored in, and processed in the US. Where required by applicable law
              (e.g., for EU residents), such transfers are conducted under appropriate safeguards, including Standard
              Contractual Clauses (SCCs) as approved by the European Commission. Our sub-processors (Supabase, Stripe,
              Anthropic, Vercel) maintain their own transfer mechanisms as described in their privacy policies.
            </p>
          </section>

          <section>
            <h2>7. Data Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your personal data, including:
            </p>
            <ul>
              <li>TLS encryption for all data in transit</li>
              <li>Encryption at rest for database storage (via Supabase)</li>
              <li>Row-level security (RLS) policies to ensure users can only access their own data</li>
              <li>Authentication via Google OAuth (no passwords stored by Syllabi.ai)</li>
              <li>Payment data isolated to Stripe&apos;s PCI-compliant infrastructure</li>
            </ul>
            <p className="mt-3">
              No method of transmission over the internet is 100% secure. If you believe your account has been
              compromised, please contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Syllabi.ai is not directed at children under the age of 13, or under 16 where EU law applies. We do not
              knowingly collect personal information from children. If you believe we have inadvertently collected data
              from a child, please contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will
              delete it promptly.
            </p>
          </section>

          <section>
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via email (to
              the address on file) or via a prominent notice on our website at least 30 days before the change takes
              effect. The &quot;Effective date&quot; at the top of this page indicates when the policy was last revised.
              Continued use of the service after the effective date constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2>10. Contact Us</h2>
            <p>
              For privacy-related questions, to exercise your rights, or to report a concern, contact us at:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li><strong>Website:</strong> <a href="https://syllabi.online">syllabi.online</a></li>
            </ul>
            <p className="mt-3">
              We aim to respond to all privacy inquiries within <strong>5 business days</strong>.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          <SubpageBackLink />
        </div>
      </main>

      <footer className="border-t border-border/40 mt-8">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Syllabi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
