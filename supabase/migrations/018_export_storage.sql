-- supabase/migrations/018_export_storage.sql
-- Phase 1 of export v2: storage bucket for generated PDFs (and later SCORM zips, Marp decks).

insert into storage.buckets (id, name, public)
  values ('exports', 'exports', false)
  on conflict (id) do nothing;

-- Only the course owner can read/write their own exports.
-- Path convention: exports/<user_id>/<course_id>/<hash>.<ext>
create policy "exports_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "exports_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "exports_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role always has access (bypasses RLS) — used by Inngest worker.
-- No explicit policy needed for service_role.
