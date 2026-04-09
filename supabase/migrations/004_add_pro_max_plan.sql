-- ============================================================
-- 004_add_pro_max_plan.sql
-- ============================================================
-- Adds the 'pro_max' value to the plan_type enum so that the
-- Stripe webhook can correctly promote users who purchase the
-- Pro Max monthly plan or the Pro Max 5-Pack one-time bundle.
--
-- This value was introduced to production manually via Supabase
-- MCP (no checked-in migration existed), which meant a fresh
-- clone + supabase db reset would produce a schema without it
-- and the webhook would crash with an enum violation.
--
-- The ALTER TYPE ... ADD VALUE statement cannot run inside a
-- transaction block, so this file intentionally contains only
-- the enum change. DO NOT add other DDL here.
-- ============================================================

ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'pro_max';
