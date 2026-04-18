-- ============================================================
-- 017_pricing_redesign.sql
-- ============================================================
-- Pricing & model redesign: Free / Planner / Masterclass /
-- Enterprise + Masterclass 5-Pack + EUR 5 body unlock.
--
-- Pre-launch cutover — no grandfather logic. Existing 'pro'
-- users become 'planner'; existing 'pro_max' users become
-- 'masterclass'. Stripe Price IDs are rotated in a separate
-- dashboard step by Gianmarco.
--
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction
-- block when the new value is used in the same transaction. The
-- three ALTER TYPE statements were applied in a companion
-- migration (017_pricing_redesign_enum_values) which committed
-- before this one.
-- ============================================================

-- 1. Body-unlock tracking on courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS body_unlock_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS body_unlock_purchased_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS body_unlock_stripe_session_id TEXT;

-- 2. Conversion credits (5-Pack -> Masterclass)
CREATE TABLE IF NOT EXISTS public.conversion_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_purchase_stripe_session_id text NOT NULL,
  amount_eur numeric(10,2) NOT NULL DEFAULT 20.00,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  redeemed_stripe_invoice_id text,
  CONSTRAINT credit_window CHECK (expires_at > purchased_at),
  CONSTRAINT one_credit_per_source UNIQUE (source_purchase_stripe_session_id)
);

CREATE INDEX IF NOT EXISTS conversion_credits_user_active_idx
  ON public.conversion_credits (user_id)
  WHERE redeemed = false;

ALTER TABLE public.conversion_credits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'conversion_credits'
      AND policyname = 'conversion_credits_owner_read'
  ) THEN
    CREATE POLICY "conversion_credits_owner_read"
      ON public.conversion_credits FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Profiles: billing_period + enterprise_gen_cap
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS billing_period text CHECK (billing_period IN ('monthly','annual','one_time') OR billing_period IS NULL),
  ADD COLUMN IF NOT EXISTS enterprise_gen_cap integer;

-- 4. Data migration: pro -> planner, pro_max -> masterclass
UPDATE public.profiles SET plan = 'planner'::public.plan_type
  WHERE plan::text = 'pro';

UPDATE public.profiles SET plan = 'masterclass'::public.plan_type
  WHERE plan::text = 'pro_max';

-- 5. Reset caps to new defaults
UPDATE public.profiles
  SET generations_limit = 15
  WHERE plan::text = 'planner' AND generations_limit != 15;

UPDATE public.profiles
  SET generations_limit = 20
  WHERE plan::text = 'masterclass' AND generations_limit != 20;

UPDATE public.profiles
  SET generations_limit = 1
  WHERE plan::text = 'free' AND generations_limit != 1;

-- 6. Comments
COMMENT ON TABLE public.conversion_credits IS
  '5-Pack -> Masterclass conversion credit (EUR 20 off, 30-day window, one per lifetime per user).';
COMMENT ON COLUMN public.courses.body_unlock_purchased IS
  'Planner-tier body unlock: EUR 5 one-time purchase flips this true, then Inngest regenerates module bodies with Sonnet.';
COMMENT ON COLUMN public.profiles.enterprise_gen_cap IS
  'Per-contract generation cap for enterprise tier. NULL for non-enterprise; interpreted as "unlimited per contract" by cap-enforcement.ts.';
