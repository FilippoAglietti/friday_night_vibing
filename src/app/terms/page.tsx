import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Syllabi.ai",
  description: "Terms of Service for Syllabi.ai (syllabi.online). Governing your use of the AI course generation platform.",
};

const EFFECTIVE_DATE = "March 31, 2026";
const CONTACT_EMAIL = "legal@syllabi.online";

export default function TermsPage() {
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
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-foreground [&_a]:text-violet-400 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5">

          <section>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
              (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and Syllabi.ai (&quot;Syllabi&quot;,
              &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), governing your access to and use of the Syllabi.ai
              website at <a href="https://syllabi.online">syllabi.online</a> and all related services
              (collectively, the &quot;Service&quot;).
            </p>
            <p className="mt-3">
              By creating an account or using the Service, you confirm that you are at least 18 years old (or the age
              of majority in your jurisdiction, whichever is greater), that you have read and understood these Terms,
              and that you agree to be bound by them. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2>1. The Service</h2>
            <p>
              Syllabi.ai provides an AI-powered platform that generates structured course curricula — including modules,
              lessons, quizzes, learning objectives, and pacing schedules — based on inputs you provide. The Service
              also offers exports in PDF and Notion formats, a course history dashboard, and subscription plan
              management.
            </p>
            <p className="mt-3">
              We use Anthropic&apos;s Claude AI to generate content. AI-generated content is inherently probabilistic
              and may occasionally be inaccurate, incomplete, or unsuitable for your specific use case. You are
              responsible for reviewing, editing, and validating all generated content before use.
            </p>
          </section>

          <section>
            <h2>2. Accounts</h2>
            <ul>
              <li>
                <strong>Registration:</strong> You must sign in via Google OAuth. You are responsible for maintaining
                the security of your Google account.
              </li>
              <li>
                <strong>One account per user:</strong> You may not create multiple accounts to circumvent plan limits
                or free-tier restrictions.
              </li>
              <li>
                <strong>Accurate information:</strong> You agree to provide accurate information and to keep it
                up to date.
              </li>
              <li>
                <strong>Account security:</strong> You are responsible for all activity under your account. Notify us
                immediately at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you suspect unauthorized
                access.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Subscription Plans and Billing</h2>

            <h3>3.1 Plan Tiers</h3>
            <p>
              Syllabi.ai offers a free Starter plan and paid subscription plans (Pro and Pro Max) as described on our{" "}
              <Link href="/#pricing">pricing page</Link>. Plan features, generation limits, and pricing may change with
              reasonable notice.
            </p>

            <h3>3.2 Billing</h3>
            <ul>
              <li>
                Paid plans are billed on a <strong>monthly or annual</strong> basis (as selected at checkout) via
                Stripe, Inc.
              </li>
              <li>
                Subscriptions <strong>auto-renew</strong> at the end of each billing period unless cancelled before
                the renewal date.
              </li>
              <li>
                All prices are in <strong>USD</strong> and are exclusive of applicable taxes. We will charge applicable
                sales tax or VAT where required by law.
              </li>
              <li>
                By providing payment information, you authorize Syllabi.ai (via Stripe) to charge your payment method
                for all fees incurred.
              </li>
            </ul>

            <h3>3.3 Refunds</h3>
            <ul>
              <li>
                We offer a <strong>7-day money-back guarantee</strong> on your first purchase of a paid plan. To
                request a refund within this window, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </li>
              <li>
                After 7 days, <strong>payments are non-refundable</strong> except as required by applicable law.
              </li>
              <li>
                Refunds are not provided for partial months if you downgrade or cancel mid-cycle. You retain access
                to the paid plan features until the end of the current billing period.
              </li>
            </ul>

            <h3>3.4 Plan Changes</h3>
            <ul>
              <li>
                Upgrades take effect immediately; you will be charged a prorated amount for the remainder of the
                current billing period.
              </li>
              <li>
                Downgrades take effect at the start of the next billing period. Your current plan features remain
                active until then.
              </li>
              <li>
                If your payment fails, we will attempt to retry the charge. If payment remains outstanding, your
                account may be downgraded to the free Starter plan.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Intellectual Property</h2>

            <h3>4.1 Your Content and Generated Courses</h3>
            <p>
              You retain full ownership of the <strong>inputs</strong> you provide to the Service (topic, audience,
              niche, etc.) and of the <strong>course curricula generated</strong> from those inputs.
            </p>
            <p className="mt-3">
              You may use, reproduce, modify, publish, distribute, and sell generated courses for any lawful purpose,
              including commercial use. You do not need to attribute Syllabi.ai.
            </p>
            <p className="mt-3">
              By using the Service, you grant Syllabi.ai a limited, non-exclusive, royalty-free license to store,
              process, and display your inputs and generated courses <strong>solely to provide the Service to you</strong>{" "}
              (e.g., to save your history and render exports). We will not use your content to train AI models or
              share it with third parties except as described in our{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>

            <h3>4.2 Syllabi.ai IP</h3>
            <p>
              The Syllabi.ai brand, logo, website design, underlying software, and service infrastructure are owned
              by Syllabi.ai or our licensors and protected by copyright, trademark, and other intellectual property
              laws. These Terms do not grant you any rights to use our trademarks or branding.
            </p>

            <h3>4.3 AI Output Considerations</h3>
            <p>
              AI-generated content may vary across generations and may not always be novel or unique. We make no
              warranty that generated course content is original, free from similarity to existing works, or suitable
              for copyright protection in your jurisdiction. You are responsible for conducting any clearance review
              appropriate to your use case.
            </p>
          </section>

          <section>
            <h2>5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Generate content that is illegal, harmful, harassing, defamatory, obscene, or fraudulent</li>
              <li>Violate any third party&apos;s intellectual property, privacy, or other rights</li>
              <li>Circumvent plan limits through automation, scripting, or multiple accounts</li>
              <li>Probe, scan, or test the security of the Service or any related system</li>
              <li>Reverse engineer or extract the underlying models, algorithms, or source code</li>
              <li>Resell or sublicense access to the Service without our written permission</li>
              <li>Generate content for deceptive, spam, or phishing campaigns</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these rules, with or without notice.
            </p>
          </section>

          <section>
            <h2>6. Disclaimers</h2>
            <p className="uppercase font-semibold text-xs tracking-wide text-foreground">
              The service is provided &quot;as is&quot; and &quot;as available&quot;
            </p>
            <p className="mt-3">
              To the fullest extent permitted by applicable law, Syllabi.ai disclaims all warranties, express or
              implied, including without limitation:
            </p>
            <ul>
              <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
              <li>That the Service will be uninterrupted, error-free, or free of viruses or other harmful components</li>
              <li>That AI-generated content will be accurate, complete, up-to-date, or suitable for your needs</li>
              <li>That results obtained from using the Service will meet your expectations or requirements</li>
            </ul>
            <p className="mt-3">
              AI-generated educational content should be reviewed by a qualified subject-matter expert before
              deployment to students. Syllabi.ai is a course <em>structuring</em> tool — the accuracy of factual
              content within generated lessons is your responsibility.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p className="uppercase font-semibold text-xs tracking-wide text-foreground">
              Important — please read carefully
            </p>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, in no event shall Syllabi.ai, its officers,
              directors, employees, agents, or licensors be liable for any:
            </p>
            <ul>
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, goodwill, or business opportunities</li>
              <li>Damages arising from your reliance on AI-generated content</li>
              <li>Unauthorized access to or alteration of your data</li>
            </ul>
            <p className="mt-3">
              In all cases, our total aggregate liability to you for any claims arising out of or related to these
              Terms or the Service shall not exceed the greater of:
            </p>
            <ol>
              <li>The amount you paid to Syllabi.ai in the <strong>twelve (12) months</strong> preceding the claim, or</li>
              <li><strong>USD $50</strong></li>
            </ol>
            <p className="mt-3">
              Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions,
              our liability is limited to the fullest extent permitted by law.
            </p>
          </section>

          <section>
            <h2>8. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Syllabi.ai and its affiliates, officers, directors,
              employees, and agents from and against any claims, liabilities, damages, losses, costs, and expenses
              (including reasonable legal fees) arising out of or in connection with:
            </p>
            <ul>
              <li>Your use of the Service in violation of these Terms</li>
              <li>Content you input into or publish from the Service</li>
              <li>Your violation of any applicable law or third-party rights</li>
            </ul>
          </section>

          <section>
            <h2>9. Termination</h2>
            <ul>
              <li>
                <strong>By you:</strong> You may cancel your subscription at any time from your account settings.
                Cancellation takes effect at the end of the current billing period. You may also request account
                deletion by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </li>
              <li>
                <strong>By us:</strong> We may suspend or terminate your account immediately if you violate these
                Terms, engage in fraudulent activity, or if required by law. We may also discontinue the Service
                with 30 days&apos; notice.
              </li>
              <li>
                <strong>Effect of termination:</strong> Upon termination, your right to access the Service ceases
                immediately. We will delete your data in accordance with our{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </li>
            </ul>
          </section>

          <section>
            <h2>10. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the <strong>State of Delaware, USA</strong>, without regard to
              its conflict of law provisions.
            </p>
            <p className="mt-3">
              For users in the EU or UK, nothing in these Terms limits your rights under applicable consumer
              protection laws, including the right to bring claims before your local courts.
            </p>
            <p className="mt-3">
              Before initiating formal legal proceedings, both parties agree to attempt to resolve disputes informally
              by contacting us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will make reasonable
              efforts to resolve issues within 30 days of receiving written notice.
            </p>
          </section>

          <section>
            <h2>11. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. For material changes, we will provide at least{" "}
              <strong>30 days&apos; notice</strong> via email or a prominent notice on the Service before the new
              Terms take effect. Your continued use of the Service after the effective date constitutes acceptance of
              the updated Terms.
            </p>
          </section>

          <section>
            <h2>12. Miscellaneous</h2>
            <ul>
              <li>
                <strong>Entire agreement:</strong> These Terms, together with our Privacy Policy and Cookie Policy,
                constitute the entire agreement between you and Syllabi.ai regarding the Service and supersede any
                prior agreements.
              </li>
              <li>
                <strong>Severability:</strong> If any provision of these Terms is found unenforceable, the remaining
                provisions will continue in full force.
              </li>
              <li>
                <strong>No waiver:</strong> Failure to enforce any provision does not constitute a waiver of our right
                to enforce it in the future.
              </li>
              <li>
                <strong>Assignment:</strong> You may not assign your rights under these Terms without our prior written
                consent. We may assign our rights in connection with a merger, acquisition, or sale of assets.
              </li>
            </ul>
          </section>

          <section>
            <h2>13. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
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
          <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">← Home</Link>
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
