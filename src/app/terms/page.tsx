import { Metadata } from "next";
import SubpageNav from "@/components/SubpageNav";
import SubpageBackLink from "@/components/SubpageBackLink";
import { JsonLd, breadcrumbJsonLd, BREADCRUMBS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service | Syllabi",
  description: "Read the terms and conditions that govern your use of Syllabi.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Syllabi",
    description: "Read the terms and conditions that govern your use of Syllabi.",
    url: "https://www.syllabi.online/terms",
    siteName: "Syllabi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Syllabi",
    description: "Read the terms and conditions that govern your use of Syllabi.",
  },
};

const EFFECTIVE_DATE = "March 31, 2026";
const CONTACT_EMAIL = "legal@syllabi.online";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMBS.terms)} />
      <SubpageNav />
      
      {/* Gradient background */}
      <div className="absolute inset-0 h-[400px] bg-gradient-to-b from-violet-500/5 via-indigo-500/3 to-transparent pointer-events-none" />
      
      {/* Dot pattern */}
      <div className="absolute inset-0 h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="relative mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400">
            Updated {EFFECTIVE_DATE}
          </span>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-300">
              By accessing and using Syllabi ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this Service.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-300">
              Permission is granted to temporarily download one copy of the materials (information or software) on Syllabi for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4">
              <li>• Modifying or copying the materials</li>
              <li>• Using the materials for any commercial purpose or for any public display</li>
              <li>• Attempting to reverse engineer, disassemble, or decompile any software contained on Syllabi</li>
              <li>• Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>• Removing any copyright or other proprietary notations from the materials</li>
              <li>• Transmitting the materials over a network</li>
            </ul>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              3. Disclaimer
            </h2>
            <p className="text-gray-300">
              The materials on Syllabi are provided "as is". Syllabi makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              4. Limitations
            </h2>
            <p className="text-gray-300">
              In no event shall Syllabi or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Syllabi, even if Syllabi or a Syllabi authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              5. Accuracy of Materials
            </h2>
            <p className="text-gray-300">
              The materials appearing on Syllabi could include technical, typographical, or photographic errors. Syllabi does not warrant that any of the materials on its website are accurate, complete, or current. Syllabi may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              6. Materials and Content
            </h2>
            <p className="text-gray-300">
              Syllabi has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Syllabi of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              7. Modifications
            </h2>
            <p className="text-gray-300">
              Syllabi may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              8. Governing Law
            </h2>
            <p className="text-gray-300">
              These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              9. User Accounts
            </h2>
            <p className="text-gray-300">
              If you create an account on Syllabi, you are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              10. User Content
            </h2>
            <p className="text-gray-300">
              When you upload, submit, or display content on Syllabi, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any media or medium and for any purpose. You represent and warrant that you own or have the necessary rights to the content you provide.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              11. Prohibited Activities
            </h2>
            <p className="text-gray-300">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="space-y-2 text-gray-300 ml-4">
              <li>• Harassing or causing distress or inconvenience to any person</li>
              <li>• Disrupting the normal flow of dialogue within our platform</li>
              <li>• Attempting to gain unauthorized access to our systems</li>
              <li>• Uploading files that contain viruses or malicious code</li>
              <li>• Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              12. Intellectual Property Rights
            </h2>
            <p className="text-gray-300">
              All content on Syllabi, including text, graphics, logos, images, and software, is the property of Syllabi or its content suppliers and protected by international copyright laws. The collection, arrangement, and assembly of all content on this website is the exclusive property of Syllabi.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              13. Limitation of Liability
            </h2>
            <p className="text-gray-300">
              In no case shall Syllabi, its directors, officers, employees, agents, or third-party content providers be liable for any direct, indirect, incidental, special, or consequential damages arising out of your use of or inability to use the website or the content, materials, and functions associated with it.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              14. Termination
            </h2>
            <p className="text-gray-300">
              Syllabi may terminate your account and access to the Service at any time for any reason, including if we believe you have violated these Terms of Service. Upon termination, all rights granted to you will cease, and you must immediately stop all use of the Service.
            </p>
          </section>

          <section>
            <h2 className="border-l-2 border-violet-500/40 pl-4 text-2xl font-semibold text-white mt-8 mb-4">
              15. Contact Information
            </h2>
            <p className="text-gray-300">
              If you have any questions about these Terms of Service, please contact us at:
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