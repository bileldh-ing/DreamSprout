-- Integration checks for the publish rights gate, audit log and RLS. Run against a local Supabase DB:
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_and_rights.sql
\set QUIET on
begin;

-- 1) Seed: every story is published with aligned pages.
do $$
declare n int;
begin
  select count(*) into n from public.stories where status = 'published';
  if n < 20 then raise exception 'expected 20 published seed stories, found %', n; end if;
  select count(*) into n from public.story_pages where jsonb_array_length(word_timings) = 0;
  if n > 0 then raise exception '% pages without word timings', n; end if;
end $$;

-- 2) Publish gate: a story without a complete rights checklist cannot be published.
insert into public.content_licenses (id, kind, name, holder, notes) values ('lic-test', 'original', 'Test licence', 'DreamSprout', 'test only');
insert into public.stories (id, title, origin, source, license_id, age_band, minutes, moral, synopsis, illustration_credit, narration_credit, narration_voice)
values ('gate-test', 'Gate Test', 'DreamSprout', 'DreamSprout Original', 'lic-test', '3-5', 2, 'Be kind.', 'A test story.', 'test', 'test', 'test');
insert into public.rights_checklist (story_id, source_verified) values ('gate-test', true);
do $$
begin
  begin
    update public.stories set status = 'published' where id = 'gate-test';
    raise exception 'publish gate did not block an incomplete checklist';
  exception when check_violation then null;
  end;
end $$;

-- 3) Even with rights complete, a story with no aligned pages cannot be published.
update public.rights_checklist
  set license_verified = true, illustrations_cleared = true, narration_cleared = true, no_third_party_trademarks = true
  where story_id = 'gate-test';
do $$
begin
  begin
    update public.stories set status = 'published' where id = 'gate-test';
    raise exception 'publish gate did not block a story without pages';
  exception when check_violation then null;
  end;
end $$;

-- 4) Audit log records story changes.
do $$
begin
  if not exists (select 1 from public.audit_log where entity = 'stories' and entity_id = 'gate-test') then
    raise exception 'audit log missing story insert';
  end if;
end $$;

-- 5) RLS: anonymous users only see published stories and never family data.
set local role anon;
do $$
declare n int;
begin
  select count(*) into n from public.stories where status <> 'published';
  if n > 0 then raise exception 'anon can see % unpublished stories', n; end if;
  select count(*) into n from public.stories;
  if n < 20 then raise exception 'anon cannot read published stories'; end if;
  select count(*) into n from public.child_profiles;
  if n > 0 then raise exception 'anon can read child profiles'; end if;
end $$;
reset role;

-- 6) RLS: a parent only sees and writes their own children.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@example.test'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@example.test');
insert into public.child_profiles (parent_id, nickname, age_band) values
  ('00000000-0000-0000-0000-0000000000a1', 'Mia', '3-5'),
  ('00000000-0000-0000-0000-0000000000b2', 'Leo', '6-8');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
set local role authenticated;
do $$
declare n int;
begin
  select count(*) into n from public.child_profiles;
  if n <> 1 then raise exception 'parent sees % child profiles, expected 1', n; end if;
  begin
    insert into public.child_profiles (parent_id, nickname, age_band) values ('00000000-0000-0000-0000-0000000000b2', 'Hack', '3-5');
    raise exception 'parent inserted a profile for another parent';
  exception when insufficient_privilege then null;
  end;
  update public.stories set title = 'x' where id = 'lion-mouse';
  if found then raise exception 'parent could edit content'; end if;
end $$;
reset role;

rollback;
\echo 'supabase tests passed'
