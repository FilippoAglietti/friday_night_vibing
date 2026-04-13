"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SubpageNav() {
  const { t } = useTranslation();
  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <GraduationCap className="size-5 text-violet-500" />
          <span>syllabi<span className="text-violet-500">.online</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← {t("subpageNav.backToHome")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
