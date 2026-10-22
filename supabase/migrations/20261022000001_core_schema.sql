-- DreamSprout core schema: content, rights, family profiles, progress, audit.
create extension if not exists pgcrypto;

create type public.app_role as enum ('parent', 'studio', 'admin');
create type public.story_status as enum ('draft', 'review', 'published', 'archived');
create type public.age_band as enum ('3-5', '4-6', '6-8');
create type public.asset_kind as enum ('illustration', 'narration', 'animation');
create type public.license_kind as enum ('public-domain', 'original', 'licensed', 'cc-by', 'cc-by-sa');

-- Adult accounts (parents, studio editors). Children never have auth accounts.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'parent',
  display_name text check (char_length(display_name) <= 60),
  created_at timestamptz not null default now()
);

create table public.content_licenses (
  id text primary key,
  kind public.license_kind not null,
  name text not null check (char_length(name) >= 3),
  holder text not null,
  notes text not null,
  url text,
  created_at timestamptz not null default now()
);

create table public.stories (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  origin text not null,
  source text not null check (char_length(source) >= 5),
  license_id text not null references public.content_licenses (id),
  age_band public.age_band not null,
  minutes smallint not null check (minutes between 1 and 60),
  tags text[] not null default '{}',
  moral text not null,
  synopsis text not null,
  characters text not null default '',
  language char(2) not null default 'en',
  status public.story_status not null default 'draft',
  illustration_credit text not null,
  illustration_kind text not null default 'static' check (illustration_kind in ('static', 'parallax', 'vector', 'video')),
  narration_credit text not null,
  narration_voice text not null,
  narration_kind text not null default 'tts' check (narration_kind in ('human', 'tts')),
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index stories_status_idx on public.stories (status);
create index stories_tags_idx on public.stories using gin (tags);

create table public.assets (
  id text primary key,
  story_id text not null references public.stories (id) on delete cascade,
  kind public.asset_kind not null,
  bucket text not null check (bucket in ('illustrations', 'narration')),
  path text not null,
  mime_type text not null,
  bytes integer,
  credit text not null,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create table public.story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id text not null references public.stories (id) on delete cascade,
  page_index smallint not null check (page_index > 0),
  text text not null,
  scene_description text not null default '',
  image_asset_id text references public.assets (id),
  audio_asset_id text references public.assets (id),
  audio_duration_sec numeric(7, 3),
  -- [[startSec, durationSec, word], ...] from forced alignment / TTS word boundaries. Never fabricated.
  word_timings jsonb not null default '[]'::jsonb check (jsonb_typeof(word_timings) = 'array'),
  updated_at timestamptz not null default now(),
  unique (story_id, page_index)
);

create table public.rights_checklist (
  story_id text primary key references public.stories (id) on delete cascade,
  source_verified boolean not null default false,
  license_verified boolean not null default false,
  illustrations_cleared boolean not null default false,
  narration_cleared boolean not null default false,
  no_third_party_trademarks boolean not null default false,
  notes text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz
);

create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  age_band public.age_band not null,
  avatar text not null default '🦊',
  created_at timestamptz not null default now()
);
create index child_profiles_parent_idx on public.child_profiles (parent_id);

create table public.favorites (
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  story_id text not null references public.stories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (child_id, story_id)
);

create table public.reading_progress (
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  story_id text not null references public.stories (id) on delete cascade,
  page smallint not null check (page > 0),
  position_sec numeric(7, 3) not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (child_id, story_id)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text not null,
  diff jsonb,
  at timestamptz not null default now()
);

-- ---------- helpers & triggers ----------
create or replace function public.current_role_is(r public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = r or p.role = 'admin'));
$$;

create or replace function public.is_studio() returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role_is('studio');
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger stories_touch before update on public.stories for each row execute function public.touch_updated_at();
create trigger pages_touch before update on public.story_pages for each row execute function public.touch_updated_at();

-- Publishing requires a complete rights checklist and every page to have image, audio and timings.
create or replace function public.enforce_publish_rights() returns trigger language plpgsql as $$
declare ok boolean; missing int;
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    select (source_verified and license_verified and illustrations_cleared and narration_cleared and no_third_party_trademarks)
      into ok from public.rights_checklist where story_id = new.id;
    if coalesce(ok, false) = false then
      raise exception 'Story % cannot be published: rights checklist incomplete', new.id using errcode = 'check_violation';
    end if;
    select count(*) into missing from public.story_pages
      where story_id = new.id and (image_asset_id is null or audio_asset_id is null or jsonb_array_length(word_timings) = 0);
    if missing > 0 or not exists (select 1 from public.story_pages where story_id = new.id) then
      raise exception 'Story % cannot be published: % page(s) missing image, audio or timings', new.id, missing using errcode = 'check_violation';
    end if;
    new.published_at = coalesce(new.published_at, now());
  end if;
  return new;
end; $$;
create trigger stories_publish_gate before update of status on public.stories
  for each row execute function public.enforce_publish_rights();

create or replace function public.audit_changes() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor, action, entity, entity_id, diff)
  values (auth.uid(), tg_op, tg_table_name,
          coalesce((case when tg_op = 'DELETE' then old.id else new.id end)::text, '?'),
          case when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
               when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end);
  return coalesce(new, old);
end; $$;
create trigger stories_audit after insert or update or delete on public.stories for each row execute function public.audit_changes();
create trigger licenses_audit after insert or update or delete on public.content_licenses for each row execute function public.audit_changes();

-- New auth users get a parent profile.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id) on conflict do nothing; return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
