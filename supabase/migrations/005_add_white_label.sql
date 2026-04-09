-- ============================================================
-- 005_add_white_label.sql
-- ============================================================
-- Adds the `white_label` boolean flag on `profiles` so that export
-- functions (PDF/DOCX/Notion) can strip Syllabi.ai branding for
-- Pro Max subscribers. The flag defaults to FALSE (= branding on)
-- and is flipped to TRUE by the Stripe webhook when a user upgrades
-- to Pro Max, and back to FALSE on downgrade.
--
-- This migration is intentionally the minimum viable schema change:
-- the actual conditional-branding logic in the export functions is
-- a separate piece of work that reads this column. Adding the column
-- first is safe because the default `false` preserves existing
-- behavior for every user until the export code catches up.
--
-- Rationale for putting this in the DB instead of deriving it from
-- `plan='pro_max'` at query time: one-time 5-Pack buyers are stored
-- as plan='pro_max' with a bounded `generations_limit` — we want
-- them to keep branding OFF as well (they paid for premium), and
-- the future `plan='pro_max_lite'` or enterprise custom plans might
-- want white-label without being on the monthly subscription. A
-- dedicated column decouples billing tier from feature entitlement.
-- ============================================================

-- 1) Add the column with a safe default.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS white_label BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Backfill existing pro_max users (and any future rows manually
--    promoted in the dashboard) so they match the invariant
--    pro_max => white_label = TRUE from day one.
UPDATE public.profiles
   SET white_label = TRUE
 WHERE plan = 'pro_max'
   AND white_label = FALSE;

-- 3) Comment for discoverability in the Supabase UI.
COMMENT ON COLUMN public.profiles.white_label IS
  'If TRUE, export functions (PDF/DOCX/Notion) omit Syllabi branding. '
  'Auto-managed by the Stripe webhook: TRUE for pro_max (subscription '
  'or 5-Pack), FALSE for pro and free. Can be manually overridden for '
  'enterprise or comp accounts.';
