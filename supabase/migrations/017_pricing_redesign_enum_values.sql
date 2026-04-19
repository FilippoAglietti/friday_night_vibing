-- 017_pricing_redesign_enum_values.sql
-- ALTER TYPE ... ADD VALUE cannot run in a transaction when the new
-- value is used in a later DML in the same migration. This file
-- commits the new enum values independently so that migration
-- 017_pricing_redesign.sql can UPDATE rows using them.

ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'planner';
ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'masterclass';
ALTER TYPE public.plan_type ADD VALUE IF NOT EXISTS 'enterprise';
