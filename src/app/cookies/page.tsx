import { Metadata } from "next";
import SubpageNav from "@/components/SubpageNav";
import SubpageBackLink from "@/components/SubpageBackLink";
import { JsonLd, breadcrumbJsonLd, BREADCRUMBS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cookie Policy | Syllabi",
  description: "Learn how Syllabi uses cookies and similar tracking technologies.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Cookie Policy | Syllabi",
    description: "Learn how Syllabi uses cookies and similar tracking technologies.",
    url: "https://www.syllabi.online/cookies",
    siteName: "Syllabi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | Syllabi",
    description: "Learn how Syllabi uses cookies and similar tracking technologies.",
  },
};

const EFFECTIVE_DATE = "March 31, 2026";
const CONTACT_EMAIL = "privacy@syllabi.online";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMBS.cookies)} />
      <SubpageNav />
      
      {/* Gradient background */}
      <div className="absolute inset-0 h-[400px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      
      {/* Dot pattern */}
      <div className="absolute inset-0 h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="relative mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400">
            Updated {EFFECTIVE_DATE}
          </span>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-300">
              Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferences and login information. Cookies serve various purposes, from enhancing user experience to tracking analytics.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Types of Cookies We Use
            </h2>
            
            <div className="overflow-x-auto mt-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-violet-500/30">
                    <th className="text-left py-3 px-4 text-violet-300 font-semibold">Cookie Type</th>
                    <th className="text-left py-3 px-4 text-violet-300 font-semibold">Purpose</th>
                    <th className="text-left py-3 px-4 text-violet-300 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">Essential</td>
                    <td className="py-3 px-4 text-gray-400">Required for basic functionality and security</td>
                    <td className="py-3 px-4 text-gray-400">Session</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">Analytics</td>
                    <td className="py-3 px-4 text-gray-400">Helps us understand how users interact with our site</td>
                    <td className="py-3 px-4 text-gray-400">Up to 2 years</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">Preference</td>
                    <td className="py-3 px-4 text-gray-400">Remembers your settings and preferences</td>
                    <td className="py-3 px-4 text-gray-400">Up to 1 year</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">Marketing</td>
                    <td className="py-3 px-4 text-gray-400">Used to track marketing effectiveness</td>
                    <td className="py-3 px-4 text-gray-400">Up to 2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Specific Cookies We Use
            </h2>
            
            <div className="overflow-x-auto mt-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-violet-500/30">
                    <th className="text-left py-3 px-4 text-violet-300 font-semibold">Cookie Name</th>
                    <th className="text-left py-3 px-4 text-violet-300 font-semibold">Purpose</th>
                    <th className="text-left py-3 px-4 text-violet-300 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">_syllabi_session</td>
                    <td className="py-3 px-4 text-gray-400">User session management</td>
                    <td className="py-3 px-4 text-gray-400">Essential</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">_ga</td>
                    <td className="py-3 px-4 text-gray-400">Google Analytics tracking</td>
                    <td className="py-3 px-4 text-gray-400">Analytics</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">_theme_preference</td>
                    <td className="py-3 px-4 text-gray-400">Remembers your theme preference</td>
                    <td className="py-3 px-4 text-gray-400">Preference</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">fbp</td>
                    <td className="py-3 px-4 text-gray-400">Facebook pixel tracking</td>
                    <td className="py-3 px-4 text-gray-400">Marketing</td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300">utm_source</td>
                    <td className="py-3 px-4 text-gray-400">Tracking campaign source</td>
                    <td className="py-3 px-4 text-gray-400">Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-300">
              We use third-party services that may set their own cookies on your device. These services include:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4 mt-4">
              <li>• <strong>Google Analytics:</strong> For analyzing site usage and traffic</li>
              <li>• <strong>Facebook Pixel:</strong> For tracking conversions and audience engagement</li>
              <li>• <strong>Auth0:</strong> For authentication and security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              How to Control Cookies
            </h2>
            <p className="text-gray-300">
              You have the right to accept or refuse cookies. Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4 mt-4">
              <li>• Allow all cookies</li>
              <li>• Allow only essential cookies</li>
              <li>• Block all cookies (note: this may affect functionality)</li>
              <li>• Delete cookies when you close your browser</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Please note that blocking or deleting cookies may affect your ability to use certain features of our Service.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Browser Settings
            </h2>
            <p className="text-gray-300">
              You can manage cookies through your browser settings. Here are links to guides for popular browsers:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4 mt-4">
              <li>• <a href="https://support.google.com/chrome/answer/95647" className="text-violet-400 hover:text-violet-300 transition-colors">Google Chrome</a></li>
              <li>• <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" className="text-violet-400 hover:text-violet-300 transition-colors">Mozilla Firefox</a></li>
              <li>• <a href="https://support.apple.com/en-us/HT201265" className="text-violet-400 hover:text-violet-300 transition-colors">Safari</a></li>
              <li>• <a href="https://support.microsoft.com/en-us/microsoft-edge/privacy-and-protection" className="text-violet-400 hover:text-violet-300 transition-colors">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Do Not Track
            </h2>
            <p className="text-gray-300">
              Some browsers include a &ldquo;Do Not Track&rdquo; feature. Currently, there is no standard for how websites should respond to such signals. Syllabi does not currently change its practices in response to Do Not Track signals.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Updates to This Policy
            </h2>
            <p className="text-gray-300">
              We may update this Cookie Policy from time to time as our practices change. We will notify you of any material changes by posting the updated policy on our website with a new effective date.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-300">
              If you have questions about this Cookie Policy or our use of cookies, please contact us at:
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
              <a href="/privacy" className="text-gray-400 transition-colors hover:text-violet-400">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 transition-colors hover:text-violet-400">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SubpageBackLink />
    </div>
  );
}