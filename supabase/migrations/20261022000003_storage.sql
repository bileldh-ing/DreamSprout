-- Storage buckets for illustrations and narration audio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('illustrations', 'illustrations', true, 5242880, array['image/webp', 'image/png', 'image/jpeg']),
  ('narration', 'narration', true, 10485760, array['audio/mpeg', 'audio/mp4', 'audio/aac'])
on conflict (id) do nothing;

create policy "public read story media" on storage.objects for select
  using (bucket_id in ('illustrations', 'narration'));
create policy "studio uploads story media" on storage.objects for insert
  with check (bucket_id in ('illustrations', 'narration') and public.is_studio());
create policy "studio updates story media" on storage.objects for update
  using (bucket_id in ('illustrations', 'narration') and public.is_studio());
create policy "studio deletes story media" on storage.objects for delete
  using (bucket_id in ('illustrations', 'narration') and public.is_studio());
