-- Row level security: published content is public-read; studio role writes content;
-- parents own their children's profiles, favorites and progress.
alter table public.profiles enable row level security;
alter table public.content_licenses enable row level security;
alter table public.stories enable row level security;
alter table public.assets enable row level security;
alter table public.story_pages enable row level security;
alter table public.rights_checklist enable row level security;
alter table public.child_profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.reading_progress enable row level security;
alter table public.audit_log enable row level security;

-- profiles
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_studio());
create policy "own profile update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- content: public read of published, studio full access
create policy "published stories are public" on public.stories for select using (status = 'published' or public.is_studio());
create policy "studio writes stories" on public.stories for all using (public.is_studio()) with check (public.is_studio());

create policy "pages of published stories are public" on public.story_pages for select
  using (exists (select 1 from public.stories s where s.id = story_id and (s.status = 'published' or public.is_studio())));
create policy "studio writes pages" on public.story_pages for all using (public.is_studio()) with check (public.is_studio());

create policy "assets of published stories are public" on public.assets for select
  using (exists (select 1 from public.stories s where s.id = story_id and (s.status = 'published' or public.is_studio())));
create policy "studio writes assets" on public.assets for all using (public.is_studio()) with check (public.is_studio());

create policy "licenses are public" on public.content_licenses for select using (true);
create policy "studio writes licenses" on public.content_licenses for all using (public.is_studio()) with check (public.is_studio());

create policy "studio reads rights" on public.rights_checklist for select using (public.is_studio());
create policy "studio writes rights" on public.rights_checklist for all using (public.is_studio()) with check (public.is_studio());

-- family data
create policy "parents manage own children" on public.child_profiles for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

create policy "parents manage favorites" on public.favorites for all
  using (exists (select 1 from public.child_profiles c where c.id = child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from public.child_profiles c where c.id = child_id and c.parent_id = auth.uid()));

create policy "parents manage progress" on public.reading_progress for all
  using (exists (select 1 from public.child_profiles c where c.id = child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from public.child_profiles c where c.id = child_id and c.parent_id = auth.uid()));

-- audit: studio/admin read only; inserts come from security-definer triggers
create policy "studio reads audit" on public.audit_log for select using (public.is_studio());
