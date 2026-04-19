export type Language =
  | "en"
  | "es"
  | "pt"
  | "fr"
  | "de"
  | "it"
  | "nl"
  | "pl"
  | "ja"
  | "ko"
  | "zh"
  | "ar"
  | "hi"
  | "ru"
  | "tr"
  | "sv";

export interface LanguageMeta {
  code: Language;
  label: string;
  flag: string;
  rtl?: boolean;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "de", label: "Deutsch",   flag: "🇩🇪" },
  { code: "it", label: "Italiano",  flag: "🇮🇹" },
  { code: "nl", label: "Nederlands",flag: "🇳🇱" },
  { code: "pl", label: "Polski",    flag: "🇵🇱" },
  { code: "ja", label: "日本語",    flag: "🇯🇵" },
  { code: "ko", label: "한국어",    flag: "🇰🇷" },
  { code: "zh", label: "中文",      flag: "🇨🇳" },
  { code: "ar", label: "العربية",   flag: "🇸🇦", rtl: true },
  { code: "hi", label: "हिन्दी",   flag: "🇮🇳" },
  { code: "ru", label: "Русский",   flag: "🇷🇺" },
  { code: "tr", label: "Türkçe",    flag: "🇹🇷" },
  { code: "sv", label: "Svenska",   flag: "🇸🇪" },
];

export interface Translations {
  nav: {
    howItWorks: string;
    examples: string;
    pricing: string;
    tutorial: string;
    contactUs: string;
    getStartedFree: string;
  };
  hero: {
    badge: string;
    title1: string;
    titleConnector: string;
    title2: string;
    subtitle: string;
    cta: string;
    secondaryCta: string;
    tagline: string;
  };
  problem: {
    eyebrow: string;
    heading: string;
    subheading: string;
    pain1Problem: string;
    pain1Solution: string;
    pain2Problem: string;
    pain2Solution: string;
    pain3Problem: string;
    pain3Solution: string;
  };
  howItWorks: {
    eyebrow: string;
    heading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  generate: {
    eyebrow: string;
    headingPick: string;
    headingCustomize: string;
    subheading: string;
    backToTemplates: string;
  };
  templates: {
    onboardingLabel: string;
    onboardingDesc: string;
    leadMagnetLabel: string;
    leadMagnetDesc: string;
    coachingLabel: string;
    coachingDesc: string;
    salesLabel: string;
    salesDesc: string;
    technicalLabel: string;
    technicalDesc: string;
    scratchLabel: string;
    scratchDesc: string;
  };
  examples: {
    eyebrow: string;
    heading: string;
    subheading: string;
    modules: string;
    lessons: string;
    total: string;
    preview: string;
  };
  testimonials: {
    eyebrow: string;
    heading: string;
    subheading: string;
  };
  pricing: {
    eyebrow: string;
    heading: string;
    subheading: string;
    launchSpecial: string;
    endsIn: string;
    mostPopular: string;
    oneTime: string;
    bestValue: string;
    chipSkeleton: string;
    chipFullContent: string;
    forever: string;
    month: string;
    oneTimeLabel: string;
    getStartedFree: string;
    startFree: string;
    save20: string;
    save21: string;
    save13: string;
    freeDesc: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    proDesc: string;
    fivePackDesc: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    proMaxDesc: string;
    notebookLMExportTitle: string;
    notebookLMExportDesc: string;
    swipePlans: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    startProBtn: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    tryProMaxBtn: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    goProMaxBtn: string;
    free1: string;
    free2: string;
    free3: string;
    free4: string;
    free5: string;
    free6: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pro1: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pro2: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pro3: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pro4: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pro5: string;
    /** Deprecated key name — content is canonical 2026-04-19 post-rebrand. */
    pro6: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pm1: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pm2: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pm3: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pm4: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pm5: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pm6: string;
    /** Deprecated key name — content is canonical 2026-04-18 post-rebrand. */
    pm7: string;
    pack1: string;
    pack2: string;
    pack3: string;
    pack4: string;
    pack5: string;
    pack6: string;
    toggle: { monthly: string; annual: string; savePitch: string };
    tiers: {
      free: { name: string; eyebrow: string; pitch: string; cap: string; cta: string };
      planner: { name: string; eyebrow: string; pitch: string; cap: string; bodyUnlock: string; cta: string };
      masterclass: { name: string; eyebrow: string; pitch: string; cap: string; cta: string };
      enterprise: { name: string; eyebrow: string; pitch: string; cta: string };
    };
    fivePack: { heading: string; pitch: string; cta: string; conversionCredit: string };
    bodyUnlock: { cta: string; modalTitle: string; modalBody: string };
  };
  paywall: {
    fromFree: { title: string; body: string; primaryCta: string };
    fromPlannerCap: { title: string; body: string; primaryCta: string };
    fromPlannerMasterclassBody: { title: string; body: string; primaryCta: string; secondaryCta: string };
    fromMasterclassCap: { title: string; body: string; primaryCta: string };
  };
  finalCta: {
    heading: string;
    subheading: string;
    cta: string;
  };
  footer: {
    tagline: string;
    product: string;
    resources: string;
    legal: string;
    howItWorks: string;
    examples: string;
    pricing: string;
    tutorial: string;
    api: string;
    contactUs: string;
    documentation: string;
    blog: string;
    changelog: string;
    support: string;
    feedback: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    copyright: string;
    builtWith: string;
  };
  sections: {
    hero: string;
    theProblem: string;
    howItWorks: string;
    tryItNow: string;
    examples: string;
    testimonials: string;
    pricing: string;
    getStarted: string;
  };
  modal: {
    closePreview: string;
  };
  toast: {
    paymentSuccess: string;
    checkoutCancelled: string;
    signInFailed: string;
    courseGenerated: string;
  };
  contact: {
    backToHome: string;
    badge: string;
    heading: string;
    subheading: string;
    emailTitle: string;
    emailDesc: string;
    responseTitle: string;
    responseDesc: string;
    communityTitle: string;
    communityDesc: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendBtn: string;
    sendingBtn: string;
    sentTitle: string;
    sentDesc: string;
    sendAnother: string;
    footerNote: string;
  };
  tutorial: {
    backToHome: string;
    badge: string;
    heading: string;
    headingConnector: string;
    heading2: string;
    subheading: string;
    stepLabel: string;
    step1Title: string;
    step1Desc: string;
    step1Detail: string;
    step2Title: string;
    step2Desc: string;
    step2Detail: string;
    step3Title: string;
    step3Desc: string;
    step3Detail: string;
    step4Title: string;
    step4Desc: string;
    step4Detail: string;
    step5Title: string;
    step5Desc: string;
    step5Detail: string;
    step6Title: string;
    step6Desc: string;
    step6Detail: string;
    tipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
    cta: string;
    ctaSub: string;
    ctaBtn: string;
  };
  subpageNav: {
    backToHome: string;
  };
}
