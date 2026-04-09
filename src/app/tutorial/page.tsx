"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Headphones,
  Layers,
  Lightbulb,
  Pencil,
  Play,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stepIcons = [Target, Layers, Sparkles, Pencil, Headphones, Download];
const stepColors = [
  "violet",
  "indigo",
  "cyan",
  "amber",
  "rose",
  "emerald",
] as const;

const colorMap: Record<
  string,
  { gradient: string; bg: string; text: string; border: string; glow: string }
> = {
  violet: {
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
    glow: "shadow-violet-500/10",
  },
  indigo: {
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    glow: "shadow-indigo-500/10",
  },
  cyan: {
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "shadow-cyan-500/10",
  },
  amber: {
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
  },
  rose: {
    gradient: "from-rose-500 to-rose-600",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/10",
  },
  emerald: {
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
};

export default function TutorialPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const steps = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    number: String(n).padStart(2, "0"),
    title: t(`tutorial.step${n}Title`),
    description: t(`tutorial.step${n}Desc`),
    detail: t(`tutorial.step${n}Detail`),
    icon: stepIcons[i],
    color: stepColors[i],
  }));

  const tips = [t("tutorial.tip1"), t("tutorial.tip2"), t("tutorial.tip3")];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Back link + language switcher */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            {t("tutorial.backToHome")}
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 mb-6">
            <BookOpen className="size-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-400">
              {t("tutorial.badge")}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
            <span className="block">{t("tutorial.heading")}</span>
            <span className="block text-[0.55em] font-semibold tracking-wide text-muted-foreground/40 mt-2">
              {t("tutorial.headingConnector")}
            </span>
            <span className="block bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              {t("tutorial.heading2")}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            {t("tutorial.subheading")}
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/30 via-indigo-500/20 to-emerald-500/30 hidden md:block" />

          <div className="space-y-6 md:space-y-0">
            {steps.map((step, i) => {
              const colors = colorMap[step.color];
              const isLast = i === steps.length - 1;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative md:pl-20 md:pb-10"
                >
                  {/* Timeline dot — desktop only */}
                  <div className="hidden md:flex absolute left-0 top-6 items-center justify-center">
                    <div
                      className={`size-[17px] rounded-full bg-gradient-to-br ${colors.gradient} ring-4 ring-background shadow-lg ${colors.glow}`}
                    />
                  </div>

                  <Card
                    className={`border ${colors.border} bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:bg-card/60 hover:shadow-lg ${colors.glow}`}
                  >
                    <div
                      className={`h-[2px] bg-gradient-to-r ${colors.gradient}`}
                    />
                    <CardContent className="p-5 md:p-7">
                      <div className="flex items-start gap-5">
                        {/* Icon */}
                        <div className="shrink-0">
                          <div
                            className={`flex items-center justify-center size-12 rounded-xl ${colors.bg} border ${colors.border}`}
                          >
                            <step.icon className={`size-6 ${colors.text}`} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span
                              className={`text-xs font-bold ${colors.text} opacity-60 tracking-widest`}
                            >
                              {t("tutorial.stepLabel")} {step.number}
                            </span>
                          </div>
                          <h2 className="text-lg font-bold mb-1.5 leading-snug">
                            {step.title}
                          </h2>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                          {step.detail &&
                            step.detail !== `tutorial.step${i + 1}Detail` && (
                              <p className="text-xs text-muted-foreground/60 mt-2 italic">
                                {step.detail}
                              </p>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-14"
        >
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <Lightbulb className="size-4 text-amber-400" />
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  {t("tutorial.tipsTitle")}
                </p>
              </div>
              <div className="space-y-3.5">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Zap className="size-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="text-center mt-14"
        >
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-card/50 backdrop-blur-sm">
            <CardContent className="py-14">
              <Wand2 className="size-10 text-violet-400 mx-auto mb-5" />
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {t("tutorial.cta")}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                {t("tutorial.ctaSub")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/profile">
                  <Button
                    className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 px-8 gap-2"
                    size="lg"
                  >
                    <Play className="size-4" />
                    {t("tutorial.ctaBtn")}
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 gap-2"
                    size="lg"
                  >
                    {t("pricing.eyebrow")}
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
