/**
 * Feature flag gating checkout CTAs during the 2026-04-18 → 2026-04-19 AM window.
 *
 * While false, all "Start / Buy / Upgrade" CTAs render disabled with a
 * "Launching tomorrow" label so users cannot pay old Stripe prices at the
 * moment the UI already displays the new prices. Flip to "true" in Vercel env
 * once the new Price IDs are wired up in Stripe.
 */
export function isPricingLive(): boolean {
  return process.env.NEXT_PUBLIC_PRICING_LIVE === "true";
}
