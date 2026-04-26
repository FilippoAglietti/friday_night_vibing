-- supabase/migrations/020_user_branding.sql
-- v1 user branding + Phase 5 prep: add branding_* columns to profiles.
-- v1 wires branding_display_name + branding_logo_url; the other three
-- (accent, hero_url, footer) ship as nullable columns now to avoid a
-- second migration when Phase 5 ships.

alter table public.profiles
  add column if not exists branding_display_name text null,
  add column if not exists branding_logo_url text null,
  add column if not exists branding_accent text null,
  add column if not exists branding_hero_url text null,
  add column if not exists branding_footer text null;

comment on column public.profiles.branding_display_name is
  'Creator brand name shown on courses. Falls back to full_name if null.';
comment on column public.profiles.branding_logo_url is
  'Public URL of the creator logo file in the logos storage bucket.';
