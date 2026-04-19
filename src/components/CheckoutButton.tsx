"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { isPricingLive } from "@/lib/pricing/pricingLive";

interface CheckoutButtonProps {
  href: string;
  className?: string;
  disabledClassName?: string;
  children: ReactNode;
  /**
   * Label shown when pricing is not yet live. Defaults to "Launching tomorrow".
   */
  launchingLabel?: string;
}

/**
 * Checkout CTA gated by `NEXT_PUBLIC_PRICING_LIVE`. When the flag is off, the
 * button renders as a non-interactive disabled element with a "Launching
 * tomorrow" label so customers cannot hit a checkout that would charge stale
 * Stripe prices.
 */
export function CheckoutButton({
  href,
  className,
  disabledClassName,
  children,
  launchingLabel = "Launching tomorrow",
}: CheckoutButtonProps) {
  if (!isPricingLive()) {
    return (
      <button
        type="button"
        aria-disabled="true"
        disabled
        className={
          disabledClassName ??
          `${className ?? ""} cursor-not-allowed opacity-60 pointer-events-none`
        }
      >
        {launchingLabel}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
