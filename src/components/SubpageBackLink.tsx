"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function SubpageBackLink() {
  const { t } = useTranslation();
  return (
    <Link href="/" className="hover:text-foreground transition-colors">
      ← {t("subpageNav.backToHome")}
    </Link>
  );
}
