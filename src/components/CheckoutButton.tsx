"use client";

import { ReactNode, useState } from "react";
import { isPricingLive } from "@/lib/pricing/pricingLive";

interface CheckoutButtonProps {
  priceId?: string;
  /**
   * @deprecated Legacy prop from the pre-POST CTA flow. Ignored at runtime —
   * any call site still passing `href` will render in the disabled
   * "launching" state because no `priceId` is provided. Migrate by resolving
   * the Stripe Price ID and passing it as `priceId`.
   */
  href?: string;
  className?: string;
  disabledClassName?: string;
  children: ReactNode;
  /**
   * Label shown when pricing is not yet live OR no priceId is configured.
   * Defaults to "Launching tomorrow".
   */
  launchingLabel?: string;
}

/**
 * Checkout CTA that POSTs to /api/checkout with the resolved priceId and
 * navigates to the returned Stripe-hosted checkout URL.
 *
 * Gated by `NEXT_PUBLIC_PRICING_LIVE`. When the flag is off OR `priceId` is
 * missing, the button renders disabled with the `launchingLabel` so customers
 * cannot start a checkout that would fail or hit a stale / unconfigured price.
 */
export function CheckoutButton({
  priceId,
  className,
  disabledClassName,
  children,
  launchingLabel = "Launching tomorrow",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!isPricingLive() || !priceId) {
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

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = (await resp.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (resp.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      console.error("[checkout] failed", resp.status, data);
    } catch (err) {
      console.error("[checkout] network error", err);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "Opening checkout…" : children}
    </button>
  );
}
