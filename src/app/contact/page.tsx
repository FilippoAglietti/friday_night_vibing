"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Ensure dark theme matches the main website
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Send via mailto fallback + optional API
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      } else {
        // Fallback to mailto
        window.location.href = `mailto:hello@syllabi.online?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`;
      }
    } catch {
      // Fallback to mailto
      window.location.href = `mailto:hello@syllabi.online?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`;
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back link + language switcher */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            {t("contact.backToHome")}
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 mb-6">
            <MessageCircle className="size-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-400">{t("contact.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("contact.heading")}
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">!</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t("contact.subheading")}
          </p>
        </motion.div>

        {/* Quick contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          {[
            { icon: Mail, title: t("contact.emailTitle"), desc: t("contact.emailDesc"), color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
            { icon: Zap, title: t("contact.responseTitle"), desc: t("contact.responseDesc"), color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { icon: Users, title: t("contact.communityTitle"), desc: t("contact.communityDesc"), color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
          ].map((item) => (
            <Card key={item.title} className={`border ${item.bg} bg-card/30 backdrop-blur-sm`}>
              <CardContent className="flex items-center gap-3 py-4 px-5">
                <div className={`flex items-center justify-center size-10 rounded-xl ${item.bg}`}>
                  <item.icon className={`size-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <CardContent className="p-6 md:p-10">
              {sent ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                    <Sparkles className="size-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{t("contact.sentTitle")}</h2>
                  <p className="text-muted-foreground mb-6">{t("contact.sentDesc")}</p>
                  <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                    {t("contact.sendAnother")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{t("contact.nameLabel")}</label>
                      <input
                        required
                        className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                        placeholder={t("contact.namePlaceholder")}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{t("contact.emailLabel")}</label>
                      <input
                        required
                        type="email"
                        className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                        placeholder={t("contact.emailPlaceholder")}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{t("contact.subjectLabel")}</label>
                    <input
                      required
                      className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                      placeholder={t("contact.subjectPlaceholder")}
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{t("contact.messageLabel")}</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
                      placeholder={t("contact.messagePlaceholder")}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full md:w-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all px-8 py-3 gap-2"
                    size="lg"
                  >
                    {sending ? t("contact.sendingBtn") : (
                      <>
                        <Send className="size-4" />
                        {t("contact.sendBtn")}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          {t("contact.footerNote")}{" "}
          <a href="mailto:hello@syllabi.online" className="text-violet-400 hover:underline">
            hello@syllabi.online
          </a>
        </p>
      </div>
    </div>
  );
}
