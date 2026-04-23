-- supabase/migrations/019_course_exports.sql
-- Phase 1 of export v2: tracking table for async-generated export artifacts.
-- Records the storage_path per (course_id, format); polling endpoint joins
-- this to the signed URL at read time.

create table if not exists public.course_exports (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  format text not null check (format in ('pdf', 'scorm', 'marp', 'docx', 'notion-html', 'notion-md', 'nlm-audio')),
  storage_path text not null,
  completed_at timestamptz not null default now(),
  unique (course_id, format)
);

create index course_exports_course_id_idx on public.course_exports(course_id);

alter table public.course_exports enable row level security;

-- Owners can read their own exports.
create policy "course_exports_owner_read"
  on public.course_exports for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = course_exports.course_id
        and courses.user_id = auth.uid()
    )
  );
