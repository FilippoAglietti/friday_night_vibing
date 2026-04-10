import { Metadata } from "next";
import SubpageNav from "@/components/SubpageNav";
import SubpageBackLink from "@/components/SubpageBackLink";
import { JsonLd, breadcrumbJsonLd, BREADCRUMBS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy | Syllabi",
  description: "Learn how Syllabi collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Syllabi",
    description: "Learn how Syllabi collects, uses, and protects your personal information.",
    url: "https://www.syllabi.online/privacy",
    siteName: "Syllabi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Syllabi",
    description: "Learn how Syllabi collects, uses, and protects your personal information.",
  },
};

const EFFECTIVE_DATE = "March 31, 2026";
const CONTACT_EMAIL = "privacy@syllabi.online";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMBS.privacy)} />
      <SubpageNav />
      
      {/* Gradient background */}
      <div className="absolute inset-0 h-[400px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      
      {/* Dot pattern */}
      <div className="absolute inset-0 h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="relative mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400">
            Updated {EFFECTIVE_DATE}
          </span>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Introduction
            </h2>
            <p className="text-gray-300">
              Syllabi ("Company," "we," "us," or "our") operates the Syllabi platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and otherwise process personal information in connection with our Services.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-300">
              We collect information you provide directly to us, such as when you create an account, submit a form, or contact us for support. This may include:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4">
              <li>• Name, email address, and password</li>
              <li>• Educational institution and role</li>
              <li>• Course materials and curriculum data you upload</li>
              <li>• Communications with our support team</li>
            </ul>
            <p className="text-gray-300 mt-4">
              We also automatically collect certain information about your device and how you interact with our Service, including IP address, browser type, operating system, and pages visited.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-300">
              We use the information we collect to:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4">
              <li>• Provide, maintain, and improve our Services</li>
              <li>• Create and manage your account</li>
              <li>• Communicate with you about our Services, including updates and support</li>
              <li>• Personalize your experience and deliver content relevant to your interests</li>
              <li>• Monitor and analyze usage patterns and trends</li>
              <li>• Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>• Comply with legal obligations and enforce our agreements</li>
            </ul>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              3. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-300">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4">
              <li>• <strong>Service Providers:</strong> We may share information with vendors and service providers who perform services on our behalf under confidentiality agreements.</li>
              <li>• <strong>Legal Requirements:</strong> We may disclose information when required by law or in response to valid legal requests.</li>
              <li>• <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            </ul>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-300">
              We implement appropriate technical and organizational measures designed to protect personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              5. Your Privacy Rights
            </h2>
            <p className="text-gray-300">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4">
              <li>• Right to access your personal information</li>
              <li>• Right to correct inaccurate data</li>
              <li>• Right to request deletion of your data</li>
              <li>• Right to data portability</li>
              <li>• Right to opt-out of certain processing activities</li>
            </ul>
            <p className="text-gray-300 mt-4">
              To exercise any of these rights, please contact us at {CONTACT_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              6. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-300">
              We use cookies and similar tracking technologies to enhance your experience on our Service. You can control cookie preferences through your browser settings. For more information, please see our Cookie Policy.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              7. Third-Party Links
            </h2>
            <p className="text-gray-300">
              Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-300">
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-gray-300">
              Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using our Service, you consent to the transfer of your information to countries outside your country of residence.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              10. Changes to This Policy
            </h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website with a new effective date.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-300">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="text-gray-300 mt-4">
              <strong>Email:</strong> {CONTACT_EMAIL}
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-800 bg-gray-950/40 backdrop-blur-sm mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Syllabi. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/terms" className="text-gray-400 transition-colors hover:text-violet-400">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 transition-colors hover:text-violet-400">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SubpageBackLink />
    </div>
  );
}