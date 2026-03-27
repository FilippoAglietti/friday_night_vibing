-- ============================================================
-- Syllabi.ai — Initial Database Schema
-- Project: syllabi-ai (gmxseuttpurnxbluvcwx)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Profiles table ──────────────────────────────────────────
-- One row per user, linked to auth.users via id (UUID).
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT,
  full_name         TEXT,
  avatar_url        TEXT,
  plan              TEXT NOT NULL DEFAULT 'free',         -- 'free' | 'pro'
  generations_used  INTEGER NOT NULL DEFAULT 0,
  generations_limit INTEGER NOT NULL DEFAULT 1,           -- free tier: 1
  stripe_customer_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Generations table ────────────────────────────────────────
-- Every curriculum generation, tied to a user.
CREATE TABLE IF NOT EXISTS public.generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic       TEXT NOT NULL,
  audience    TEXT NOT NULL,   -- 'beginner' | 'intermediate' | 'advanced'
  length      TEXT NOT NULL,   -- 'mini' | 'standard' | 'bootcamp'
  niche       TEXT,
  curriculum  JSONB NOT NULL,  -- full Curriculum object from Claude
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- profiles: users can only read/update their own row
DROP POLICY IF EXISTS "profiles: select own" ON public.profiles;
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: update own" ON public.profiles;
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- generations: users can only see/insert their own
DROP POLICY IF EXISTS "generations: select own" ON public.generations;
CREATE POLICY "generations: select own"
  ON public.generations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "generations: insert own" ON public.generations;
CREATE POLICY "generations: insert own"
  ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Auto-create profile on signup ────────────────────────────
-- Triggered when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Increment generations counter ────────────────────────────
-- Called server-side after each successful generation.
CREATE OR REPLACE FUNCTION public.increment_generations_used(user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET generations_used = generations_used + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;
