-- Phase 1.1: widen generation_sources.source_type to accept books and arXiv preprints.
-- Phase 1 only allowed 'paper' for the academic style; the new academic prompt
-- routes a mix of papers (CrossRef-verified), books (Google Books-verified),
-- and arXiv preprints (arXiv API-verified) per topic.

alter table public.generation_sources drop constraint if exists generation_sources_source_type_check;
alter table public.generation_sources add constraint generation_sources_source_type_check
  check (source_type in ('paper', 'arxiv', 'book', 'video', 'repo', 'web_article'));
