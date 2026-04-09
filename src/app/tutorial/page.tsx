"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  GraduationCap,
  Headphones,
  Layers,
  Pencil,
  Play,
  Share2,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const steps = [
  {
    number: "01",
    title: "Choose Your Topic",
    description: "Enter any topic, select your audience level and course length. Our AI understands thousands of subjects — from machine learning to coffee brewing.",
    icon: Target,
    color: "violet",
    tips: [
      "Be specific: 'React Hooks for beginners' works better than just 'React'",
      "Choose the right difficulty level for your audience",
      "Mini courses are perfect for lead magnets, masterclass for deep dives",
    ],
  },
  {
    number: "02",
    title: "AI Generates Your Course",
    description: "In seconds, our AI creates a complete curriculum with modules, lessons, quizzes, key points, suggested resources, and a pacing schedule.",
    icon: Sparkles,
    color: "indigo",
    tips: [
      "Generation takes 10-30 seconds depending on course length",
      "Each lesson includes objectives, content, and key takeaways",
      "Quizzes are auto-generated with explanations for each answer",
    ],
  },
  {
    number: "03",
    title: "Review & Edit",
    description: "Use the built-in course editor to customize everything. Edit titles, rewrite descriptions, reorder modules, add or remove lessons — full creative control.",
    icon: Pencil,
    color: "cyan",
    tips: [
      "Click the pencil icon on any course card to open the editor",
      "Drag modules up/down to reorder your course structure",
      "All changes save directly to your account",
    ],
  },
  {
    number: "04",
    title: "Generate Audio Lessons",
    description: "Turn your text lessons into professional AI-narrated audio. Perfect for podcast-style learning, commute-friendly content, or accessibility.",
    icon: Headphones,
    color: "amber",
    tips: [
      "Audio generation uses state-of-the-art AI voices",
      "Each lesson gets its own narrated track",
      "Available on Pro Max plans",
    ],
  },
  {
    number: "05",
    title: "Export & Share",
    description: "Export your course in multiple premium formats: PDF, Word, Slides, Notion, or SCORM. Share via unique links with optional email gating for lead generation.",
    icon: Download,
    color: "emerald",
    tips: [
      "PDF exports include full branding and professional layout",
      "Notion export copies rich HTML — just paste into any Notion page",
      "Share links work for anyone, no account needed",
    ],
  },
  {
    number: "06",
    title: "Teach, Sell, or Share",
    description: "Use your AI-generated courses to onboard employees, create lead magnets, sell on course platforms, or teach your community.",
    icon: GraduationCap,
    color: "rose",
    tips: [
      "White-label branding removes Syllabi.ai mentions (Pro Max)",
      "SCORM export works with LMS platforms like Moodle & Canvas",
      "Share links support lead magnet mode with email capture",
    ],
  },
];

const colorMap: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
  violet: { gradient: "from-violet-500 to-violet-600", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  indigo: { gradient: "from-indigo-500 to-indigo-600", bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  cyan: { gradient: "from-cyan-500 to-cyan-600", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  amber: { gradient: "from-amber-500 to-amber-600", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  emerald: { gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  rose: { gradient: "from-rose-500 to-rose-600", bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

export default function TutorialPage() {
  const { t } = useTranslation();

  // Ensure dark theme matches the main website
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="size-4" />
          {t("tutorial.backToHome")}
        </Link>

        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 mb-6">
            <BookOpen className="size-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-400">{t("tutorial.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("tutorial.heading")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t("tutorial.subheading")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, i) => {
            const colors = colorMap[step.color];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Card className={`border ${colors.border} bg-card/30 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:shadow-${step.color}-500/5 transition-all duration-300`}>
                  <div className={`h-[2px] bg-gradient-to-r ${colors.gradient}`} />
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left: number + icon */}
                      <div className="flex md:flex-col items-center gap-4 md:gap-3 shrink-0">
                        <div className={`flex items-center justify-center size-14 rounded-2xl ${colors.bg} border ${colors.border}`}>
                          <step.icon className={`size-7 ${colors.text}`} />
                        </div>
                        <span className={`text-3xl font-black ${colors.text} opacity-30`}>{step.number}</span>
                      </div>

                      {/* Right: content */}
                      <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

                        {/* Tips */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pro Tips</p>
                          {step.tips.map((tip, ti) => (
                            <div key={ti} className="flex items-start gap-2.5">
                              <Zap className={`size-3.5 ${colors.text} shrink-0 mt-0.5`} />
                              <p className="text-sm text-muted-foreground">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <Wand2 className="size-10 text-violet-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">{t("tutorial.cta")}</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("tutorial.subheading")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/profile">
                  <Button className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/20 px-8 gap-2" size="lg">
                    <Play className="size-4" />
                    {t("tutorial.ctaBtn")}
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button variant="outline" className="rounded-full px-8 gap-2" size="lg">
                    View Plans
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
