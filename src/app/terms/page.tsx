import type { Metadata } from "next";
import { GraduationCap, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Syllabi.ai",
  description: "The terms and conditions governing your use of Syllabi.ai.",
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: March 31, 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-7 text-foreground/80">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Syllabi.ai (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              Syllabi.ai is an AI-powered course curriculum generation tool. You provide a topic, audience, and preferences; our system generates a structured course outline including modules, lessons, quizzes, and pacing schedules. The Service is available under a free tier and paid subscription/one-time purchase plans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Accounts and Registration</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account at <a href="mailto:support@syllabi.ai" className="text-violet-400 hover:text-violet-300">support@syllabi.ai</a>.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Payments and Subscriptions</h2>
            <h3 className="text-base font-semibold text-foreground/90 mb-2">4.1 Pricing</h3>
            <p>
              We offer a free tier and paid plans (Pro at $29/month, 5-Pack at $39 one-time). Prices are displayed in USD and subject to change with 30 days&apos; notice.
            </p>
            <h3 className="text-base font-semibold text-foreground/90 mb-2 mt-4">4.2 Billing</h3>
            <p>
              Subscription payments are billed monthly in advance and processed by Stripe. By providing payment information, you authorize us to charge your payment method on a recurring basis until cancellation.
            </p>
            <h3 className="text-base font-semibold text-foreground/90 mb-2 mt-4">4.3 Cancellation and Refunds</h3>
            <p>
              You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. We do not provide refunds for partial subscription periods. One-time purchases (5-Pack) are non-refundable once course generation credits have been used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Generate content that is illegal, harmful, harassing, defamatory, or infringing on third-party rights.</li>
              <li>Attempt to reverse-engineer, scrape, or extract the AI model or its outputs at scale.</li>
              <li>Resell or sublicense access to the Service without written permission.</li>
              <li>Circumvent any usage limits, rate limits, or access controls.</li>
              <li>Use automated scripts to create accounts or generate content in bulk beyond the intended use.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <h3 className="text-base font-semibold text-foreground/90 mb-2">6.1 Your Content</h3>
            <p>
              You retain ownership of all inputs you provide and the course curricula generated for your account. By using the Service, you grant us a limited, non-exclusive license to process your inputs solely to provide the Service.
            </p>
            <h3 className="text-base font-semibold text-foreground/90 mb-2 mt-4">6.2 Our Content</h3>
            <p>
              The Syllabi.ai platform, branding, UI, and underlying technology are owned by Syllabi and protected by intellectual property laws. You may not copy, modify, or distribute our platform or branding without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. AI-Generated Content Disclaimer</h2>
            <p>
              Course curricula are generated by AI and are provided for informational and planning purposes. We do not guarantee the accuracy, completeness, or fitness of any AI-generated content for a particular purpose. You are responsible for reviewing and adapting AI outputs before use in educational or commercial settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Syllabi and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if advised of the possibility of such damages. Our total liability to you for any claim arising out of or relating to the Service shall not exceed the amount you paid us in the 12 months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination will survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the federal or state courts located in Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide at least 14 days&apos; notice of material changes via email or a prominent notice on the Service. Your continued use after the effective date constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Contact</h2>
            <p>
              Questions about these Terms? Contact us at <a href="mailto:legal@syllabi.ai" className="text-violet-400 hover:text-violet-300">legal@syllabi.ai</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Syllabi. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/terms" className="text-foreground">Terms</a>
            <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
