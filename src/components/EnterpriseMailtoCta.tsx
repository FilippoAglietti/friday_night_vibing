"use client";

import { Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUBJECT = "Enterprise inquiry";
const BODY = `Hi Gianmarco & Filippo,

I'm exploring Syllabi for [company].

Seats:
Use case:
Timeline:

Thanks!`;

export function EnterpriseMailtoCta({ label }: { label?: string }) {
  const href = `mailto:hello@syllabi.online?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  return (
    <a
      href={href}
      className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center")}
    >
      <Mail className="mr-2 h-4 w-4" />
      {label ?? "Contact sales"}
    </a>
  );
}
