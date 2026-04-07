"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Briefcase,
  Radio,
  Code2,
  TrendingUp,
  Palette,
  Heart,
  GraduationCap,
  Wrench,
  Baby,
  User,
  Users2,
  Globe,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export interface OnboardingAnswers {
  role: string;
  industry: string;
  industryOther?: string;
  targetAudience: string;
}

interface OnboardingQuizProps {
  open: boolean;
  onComplete: (answers: OnboardingAnswers) => void;
}

const roleOptions = [
  {
    id: "course_creator",
    label: "Course Creator",
    description: "I create and sell online courses",
    icon: BookOpen,
  },
  {
    id: "educator",
    label: "Educator / Teacher",
    description: "I teach at a school, university, or institution",
    icon: GraduationCap,
  },
  {
    id: "business",
    label: "Business / Corporate",
    description: "I build training for my team or company",
    icon: Briefcase,
  },
  {
    id: "content_creator",
    label: "Content Creator",
    description: "I create educational content online",
    icon: Radio,
  },
];

const industryOptions = [
  {
    id: "tech",
    label: "Tech & Software",
    icon: Code2,
  },
  {
    id: "business",
    label: "Business & Marketing",
    icon: TrendingUp,
  },
  {
    id: "creative",
    label: "Creative & Design",
    icon: Palette,
  },
  {
    id: "health",
    label: "Health & Wellness",
    icon: Heart,
  },
  {
    id: "education",
    label: "Education & Academia",
    icon: Users,
  },
  {
    id: "other",
    label: "Other",
    icon: Wrench,
  },
];

const audienceOptions = [
  {
    id: "kids_teens",
    label: "Kids & Teens (8-17)",
    icon: Baby,
  },
  {
    id: "college",
    label: "College / University",
    icon: GraduationCap,
  },
  {
    id: "professionals",
    label: "Working Professionals",
    icon: User,
  },
  {
    id: "general",
    label: "General Audience",
    icon: Globe,
  },
];

export default function OnboardingQuiz({
  open,
  onComplete,
}: OnboardingQuizProps) {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [industryOtherText, setIndustryOtherText] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);

  const handleContinue = () => {
    if (step === 0 && selectedRole) {
      setStep(1);
    } else if (step === 1 && selectedIndustry) {
      setStep(2);
    } else if (step === 2 && selectedAudience) {
      onComplete({
        role: selectedRole!,
        industry: selectedIndustry!,
        industryOther:
          selectedIndustry === "other" ? industryOtherText : undefined,
        targetAudience: selectedAudience!,
      });
    }
  };

  const isStepValid =
    (step === 0 && selectedRole) ||
    (step === 1 && selectedIndustry) ||
    (step === 2 && selectedAudience);

  const stepTitles = [
    "What best describes you?",
    "What's your industry?",
    "Who are your students?",
  ];

  const stepDescriptions = [
    "Help us understand your role so we can tailor Syllabi to your needs.",
    "This helps us create more relevant content and features for you.",
    "We'll personalize your experience based on your audience.",
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-2xl rounded-2xl border border-violet-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-violet-500/20 overflow-hidden">
              {/* Gradient accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-violet-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />

              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                <motion.div
                  initial={{ width: "33.33%" }}
                  animate={{ width: `${((step + 1) / 3) * 100}%` }}
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>

              {/* Content */}
              <div className="relative px-8 py-12">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`header-${step}`}
                  className="text-center mb-8"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          initial={false}
                          animate={{
                            scale: dot === step ? 1.2 : 1,
                            opacity: dot <= step ? 1 : 0.4,
                          }}
                          className={`h-2 w-2 rounded-full ${
                            dot <= step
                              ? "bg-violet-500"
                              : "bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-violet-400/70 uppercase tracking-wider">
                      Step {step + 1} of 3
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                    {stepTitles[step]}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {stepDescriptions[step]}
                  </p>
                </motion.div>

                {/* Options grid */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    {step === 0 && (
                      <div className="space-y-3">
                        {roleOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = selectedRole === option.id;

                          return (
                            <motion.button
                              key={option.id}
                              onClick={() => setSelectedRole(option.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                                  : "border-slate-700 bg-slate-800/40 hover:border-violet-500/40 hover:bg-slate-800/60"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Icon
                                  className={`size-5 shrink-0 mt-0.5 ${
                                    isSelected
                                      ? "text-violet-400"
                                      : "text-slate-400"
                                  }`}
                                />
                                <div>
                                  <div className="font-semibold text-white text-sm">
                                    {option.label}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {industryOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = selectedIndustry === option.id;

                            return (
                              <motion.button
                                key={option.id}
                                onClick={() => setSelectedIndustry(option.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                                    : "border-slate-700 bg-slate-800/40 hover:border-violet-500/40 hover:bg-slate-800/60"
                                }`}
                              >
                                <Icon
                                  className={`size-5 mb-2 ${
                                    isSelected
                                      ? "text-violet-400"
                                      : "text-slate-400"
                                  }`}
                                />
                                <div className="font-medium text-sm text-white line-clamp-2">
                                  {option.label}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        {selectedIndustry === "other" && (
                          <motion.input
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text"
                            placeholder="Type your industry..."
                            value={industryOtherText}
                            onChange={(e) =>
                              setIndustryOtherText(e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border-2 border-violet-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                          />
                        )}
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid grid-cols-2 gap-3">
                        {audienceOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = selectedAudience === option.id;

                          return (
                            <motion.button
                              key={option.id}
                              onClick={() => setSelectedAudience(option.id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                                  : "border-slate-700 bg-slate-800/40 hover:border-violet-500/40 hover:bg-slate-800/60"
                              }`}
                            >
                              <Icon
                                className={`size-5 mb-2 ${
                                  isSelected
                                    ? "text-violet-400"
                                    : "text-slate-400"
                                }`}
                              />
                              <div className="font-medium text-sm text-white line-clamp-2">
                                {option.label}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="flex gap-3 pt-6 border-t border-slate-700/50">
                  {step > 0 && (
                    <Button
                      onClick={() => setStep(step - 1)}
                      variant="outline"
                      className="flex-1 rounded-full border-slate-700 hover:bg-slate-800/50"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleContinue}
                    disabled={!isStepValid}
                    className={`flex-1 rounded-full font-semibold border-0 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isStepValid
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {step === 2 ? (
                      <span className="flex items-center gap-2">
                        Get Started
                        <span>✨</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Continue
                        <ChevronRight className="size-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
