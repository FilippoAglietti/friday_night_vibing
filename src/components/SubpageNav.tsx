"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SubpageNav() {
  const { t } = useTranslation();
  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight min-w-0">
          <GraduationCap className="size-5 text-violet-500 shrink-0" />
          <span className="truncate">syllabi<span className="text-violet-500">.online</span></span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSwitcher />
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t("subpageNav.backToHome")}
          >
            <span aria-hidden>←</span>
            <span className="hidden sm:inline">{t("subpageNav.backToHome")}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
