-- Audit trail + deduplication for grounded content pipeline (Phase 1 academic,
-- reused by later phases for YouTube/GitHub/news sources).
--
-- One row per discovered+verified source per (course, module). Written by
-- the source-discovery step in Inngest, read by the module.generate step
-- when emitting the lesson with inline [n] citations.

create table if not exists public.generation_sources (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  module_index integer not null,

  source_type  text not null check (source_type in ('paper', 'video', 'repo', 'web_article')),

  title        text not null,
  authors      text,               -- comma-separated for paper/video authors
  year         integer,
  journal      text,               -- paper-only
  doi          text,               -- paper-only; lowercase normalized
  url          text not null,
  is_preprint  boolean default false,

  verified_at  timestamptz,        -- null until validator confirms
  verified_by  text,               -- 'crossref' | 'http_head' | 'youtube_api' | ...
  verified_ok  boolean,            -- true/false/null(=not yet verified)

  created_at   timestamptz not null default now()
);

create index if not exists generation_sources_course_module_idx
  on public.generation_sources (course_id, module_index);

create index if not exists generation_sources_doi_idx
  on public.generation_sources (doi) where doi is not null;

-- RLS: read-only to the owning course's user_id; inserts come from the
-- service_role used by the Inngest worker, so no policy needed for write.
alter table public.generation_sources enable row level security;

create policy "generation_sources_owner_read" on public.generation_sources
  for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = generation_sources.course_id
        and c.user_id = auth.uid()
    )
  );

comment on table public.generation_sources is
  'Grounded-generation audit trail. One row per source discovered+verified for a given course module.';
