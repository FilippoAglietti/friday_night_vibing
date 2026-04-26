-- supabase/migrations/020b_logos_bucket.sql
-- Storage bucket for user brand logos. Public-read so the URL works inside
-- generated course exports (which are publicly shareable anyway). Writes
-- restricted to the owning user's folder via RLS.
-- Path convention: logos/<user_id>/<uuid>.<ext>

insert into storage.buckets (id, name, public)
  values ('logos', 'logos', true)
  on conflict (id) do nothing;

-- Anyone can read (public bucket); the export render fetches the URL.
create policy "logos_public_read"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Only the owning user can upload to their own folder.
create policy "logos_user_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logos_user_update"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logos_user_delete"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
