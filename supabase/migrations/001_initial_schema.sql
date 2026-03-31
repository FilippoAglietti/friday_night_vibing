-- ============================================================
-- Syllabi.ai — Full Database Schema v2
-- Project: syllabi-ai (gmxseuttpurnxbluvcwx)
-- Applied via Supabase MCP on 2026-03-31
-- DO NOT run manually — already applied to production DB
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'team');
CREATE TYPE public.generation_status AS ENUM ('pending', 'generating', 'ready', 'failed');
CREATE TYPE public.content_type AS ENUM ('text', 'audio', 'video', 'mixed');
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT UNIQUE,
  full_name            TEXT,
  avatar_url           TEXT,
  plan                 public.plan_type NOT NULL DEFAULT 'free',
  generations_used     INTEGER NOT NULL DEFAULT 0,
  generations_limit    INTEGER NOT NULL DEFAULT 3,
  stripe_customer_id   TEXT UNIQUE,
  preferred_language   TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── Courses ──────────────────────────────────────────────────
CREATE TABLE public.courses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title            TEXT,
  topic            TEXT NOT NULL,
  audience         TEXT NOT NULL,
  length           TEXT NOT NULL,
  niche            TEXT,
  language         TEXT DEFAULT 'en',
  level            public.course_level DEFAULT 'beginner',
  content_type     public.content_type NOT NULL DEFAULT 'text',
  curriculum       JSONB,
  description      TEXT,
  thumbnail_url    TEXT,
  status           public.generation_status NOT NULL DEFAULT 'pending',
  is_public        BOOLEAN DEFAULT FALSE,
  is_published     BOOLEAN DEFAULT FALSE,
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_courses_user_id    ON public.courses(user_id);
CREATE INDEX idx_courses_status     ON public.courses(status);
CREATE INDEX idx_courses_created_at ON public.courses(created_at DESC);
CREATE INDEX idx_courses_public     ON public.courses(is_public) WHERE is_public = TRUE;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own courses" ON public.courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public courses" ON public.courses FOR SELECT USING (is_public = TRUE);

-- ── Media Assets ─────────────────────────────────────────────
CREATE TABLE public.media_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('audio', 'video', 'image', 'pdf')),
  url          TEXT NOT NULL,
  storage_path TEXT,
  duration_sec INTEGER,
  file_size_kb INTEGER,
  status       TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_course_id ON public.media_assets(course_id);
CREATE INDEX idx_media_user_id   ON public.media_assets(user_id);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own media" ON public.media_assets FOR ALL USING (auth.uid() = user_id);

-- ── Subscriptions ────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id        TEXT,
  plan                   public.plan_type NOT NULL DEFAULT 'free',
  status                 public.subscription_status NOT NULL,
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ── Waitlist ─────────────────────────────────────────────────
CREATE TABLE public.waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  source     TEXT,
  utm_params JSONB,
  converted  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_email     ON public.waitlist(email);
CREATE INDEX idx_waitlist_source    ON public.waitlist(source);
CREATE INDEX idx_waitlist_converted ON public.waitlist(converted);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (TRUE);

-- ── Usage Events ─────────────────────────────────────────────
CREATE TABLE public.usage_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  course_id  UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_user_id    ON public.usage_events(user_id);
CREATE INDEX idx_usage_event_type ON public.usage_events(event_type);
CREATE INDEX idx_usage_created_at ON public.usage_events(created_at DESC);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.usage_events FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_generation_usage(p_user_id UUID, p_course_id UUID, p_event_type TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET generations_used = generations_used + 1 WHERE id = p_user_id;
  INSERT INTO public.usage_events (user_id, course_id, event_type) VALUES (p_user_id, p_course_id, p_event_type);
END;
$$;

-- ── Storage Buckets ──────────────────────────────────────────
-- course-thumbnails: public (5MB, images)
-- course-audio:      private signed URLs (500MB, audio)
-- course-video:      private signed URLs (2GB, video)
-- course-pdfs:       private signed URLs (50MB, pdf)
