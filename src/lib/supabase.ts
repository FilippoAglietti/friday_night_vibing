/**
 * lib/supabase.ts
 * ─────────────────────────────────────────────────────────────
 * Supabase client configuration for Syllabi.ai.
 *
 * Exports three clients for different contexts:
 *   - supabaseBrowser  → client-side (React components, hooks)
 *   - supabaseAdmin    → server-side with service role (bypasses RLS)
 *   - createSupabaseServer() → per-request server client (Next.js App Router)
 *
 * Environment variables required in .env.local:
 *   SUPABASE_URL               — your project URL
 *   SUPABASE_ANON_KEY          — public anon key (safe for client)
 *   SUPABASE_SERVICE_ROLE_KEY  — secret service role key (SERVER ONLY)
 *
 * SQL schema is at the bottom of this file as a reference comment.
 * Run it in the Supabase SQL Editor to set up the database.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// ─── Environment variable helpers ────────────────────────────

/**
 * Reads a required environment variable and throws a clear error if missing.
 * This prevents silent failures with undefined keys.
 *
 * @param key - The name of the environment variable
 * @returns The value of the environment variable
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Add it to your .env.local file.`
    );
  }
  return value;
}

// ─── Supabase URLs & keys ─────────────────────────────────────

// NEXT_PUBLIC_ variants are available in the browser (client components).
// Non-prefixed variants are server-only. We prefer NEXT_PUBLIC_ so this
// module can be safely imported from both client and server components.

/** Supabase project URL — safe to expose to the client */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || requireEnv("SUPABASE_URL");

/** Public anon key — safe for client-side use (respects RLS policies) */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || requireEnv("SUPABASE_ANON_KEY");

// ─── Browser client (client components) ──────────────────────

/**
 * Singleton Supabase client for use in React client components and hooks.
 * Uses the anon key, so Row Level Security (RLS) policies apply.
 *
 * IMPORTANT: Uses createBrowserClient from @supabase/ssr so that the session
 * is stored in cookies (not localStorage). This is critical — server-side
 * route handlers and middleware read auth state from cookies. Without this,
 * the server has no way to know who the user is.
 *
 * Usage:
 *   import { supabaseBrowser } from '@/lib/supabase'
 *   const { data } = await supabaseBrowser.from('generations').select('*')
 */
export const supabaseBrowser = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ─── Admin client (server only — never expose to client) ──────

/**
 * Supabase admin client with the service role key.
 * Bypasses ALL Row Level Security policies.
 *
 * USE WITH EXTREME CAUTION — only in server-side code.
 * Never import this in any client component or expose it via an API route
 * without proper authentication checks.
 *
 * This is lazily initialised so that importing this module from a client
 * component (e.g. AuthModal importing supabaseBrowser) does not crash the
 * browser by attempting to read a server-only environment variable.
 *
 * Usage (server only):
 *   import { supabaseAdmin } from '@/lib/supabase'
 *   await supabaseAdmin.from('profiles').update({ plan: 'pro' }).eq('id', userId)
 */
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin must not be used in the browser.");
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(
      SUPABASE_URL,
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

// Backwards-compatible export — lazily initialised, only works server-side
export const supabaseAdmin = typeof window === "undefined"
  ? createClient<Database>(
      SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  : (null as unknown as ReturnType<typeof createClient<Database>>);

// ─── Per-request server client (Next.js App Router) ──────────

/**
 * Creates a Supabase server client that reads/writes cookies for
 * the current HTTP request. Use this in Server Components and Route Handlers.
 *
 * Each call creates a NEW client instance — do not cache this.
 *
 * Usage (in a Server Component or Route Handler):
 *   import { createSupabaseServer } from '@/lib/supabase'
 *   const supabase = createSupabaseServer()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 * @param cookieStore - The Next.js cookies() store (import from 'next/headers')
 */
export function createSupabaseServer(cookieStore?: {
  get: (name: string) => { value: string } | undefined;
  set?: (name: string, value: string, options?: object) => void;
  delete?: (name: string, options?: object) => void;
}) {
  // Lazy import to avoid issues in client-side bundles
  const { createServerClient } = require("@supabase/ssr");

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore?.get(name)?.value;
      },
      set(name: string, value: string, options: object) {
        cookieStore?.set?.(name, value, options);
      },
      remove(name: string, options: object) {
        cookieStore?.delete?.(name, options);
      },
    },
  });
}

/**
 * ─────────────────────────────────────────────────────────────
 * DATABASE SCHEMA
 * ─────────────────────────────────────────────────────────────
 * Run this in the Supabase SQL Editor (Database → SQL Editor → New query)
 * ─────────────────────────────────────────────────────────────

-- ── Enable UUID extension ──────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles table ─────────────────────────────────────────────
-- Extends Supabase's built-in auth.users table with app-specific fields.
-- A profile row is created automatically when a user signs up (via trigger).
create table public.profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  email             text not null,
  plan              text not null default 'free' check (plan in ('free', 'pro')),
  generations_used  integer not null default 0,
  generations_limit integer not null default 3, -- free = 3, pro = 999999
  created_at        timestamp with time zone default now() not null,
  updated_at        timestamp with time zone default now() not null
);

-- Enable Row Level Security on profiles
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (but not plan — that's server-only)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── Auto-create profile on signup ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Increment generations helper function ──────────────────────
create or replace function public.increment_generations_used(user_id uuid)
returns void as $$
  update public.profiles
  set generations_used = generations_used + 1,
      updated_at = now()
  where id = user_id;
$$ language sql security definer;

-- ── Generations history table ──────────────────────────────────
-- Stores every curriculum generation. Curriculum JSON stored as jsonb.
create table public.generations (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  topic       text not null,
  audience    text not null check (audience in ('beginner', 'intermediate', 'advanced')),
  length      text not null check (length in ('mini', 'standard', 'bootcamp')),
  niche       text,
  curriculum  jsonb not null,
  created_at  timestamp with time zone default now() not null
);

-- Index for fast user-specific queries
create index generations_user_id_idx on public.generations(user_id);
create index generations_created_at_idx on public.generations(created_at desc);

-- Enable Row Level Security on generations
alter table public.generations enable row level security;

-- Users can only read their own generations
create policy "Users can read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

-- ── END OF SCHEMA ──────────────────────────────────────────────
*/
