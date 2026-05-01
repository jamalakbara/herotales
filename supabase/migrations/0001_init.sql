-- HeroTales AI — initial schema
-- Phase 1: profiles, children, stories, chapter_images
-- (chapter_audio + keepsake_orders deferred until ElevenLabs/Stripe land.)

create extension if not exists "pgcrypto";

-- =============================================================
-- profiles  (1:1 with auth.users)
-- =============================================================
create table public.profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  email                       text,
  display_name                text,
  story_quota_monthly         int  not null default 5,
  stories_used_this_month     int  not null default 0,
  quota_period_start          date not null default current_date,
  streak_nights               int  not null default 0,
  last_read_date              date,
  created_at                  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_self_select" on public.profiles for select
  using (id = auth.uid());
create policy "profiles_self_update" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- children
-- =============================================================
create table public.children (
  id                      uuid primary key default gen_random_uuid(),
  parent_id               uuid not null references public.profiles(id) on delete cascade,
  nickname                text not null,
  age                     int  check (age between 2 and 8),
  pronouns                text,                 -- 'she/her' | 'he/him' | 'they/them' | custom
  detail_tags             text[] not null default '{}',
  character_description   text,                 -- locked master desc, set on first story gen
  portrait_url            text,
  portrait_storage_path   text,
  gen_seed                text,
  created_at              timestamptz not null default now()
);
create index children_parent_idx on public.children(parent_id);
alter table public.children enable row level security;

create policy "children_owner_all" on public.children for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- =============================================================
-- stories
-- =============================================================
create type story_status   as enum ('pending','generating','ready','failed');
create type story_blueprint as enum ('Bravery','Honesty','Patience','Kindness','Persistence');
create type story_length   as enum ('Shortie','Bedtime','Long tale');

create table public.stories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null references public.profiles(id) on delete cascade,
  child_id      uuid not null references public.children(id) on delete cascade,
  blueprint     story_blueprint not null,
  hook          text,
  length        story_length not null default 'Bedtime',
  voice         text,                            -- name only; no audio gen yet
  status        story_status not null default 'pending',
  progress      int  not null default 0,
  title         text,
  full_text     jsonb,                           -- [{label,title,caption,chip,paras[]}, ...]
  favorite      bool not null default false,
  error         text,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index stories_parent_idx     on public.stories(parent_id, created_at desc);
create index stories_child_idx      on public.stories(child_id, created_at desc);
create index stories_blueprint_idx  on public.stories(blueprint);
alter table public.stories enable row level security;

create policy "stories_owner_all" on public.stories for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- on first transition to 'ready', bump quota + streak
create or replace function public.handle_story_ready()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  today date := current_date;
begin
  if new.status = 'ready' and (old.status is distinct from 'ready') then
    update public.profiles
       set stories_used_this_month = stories_used_this_month + 1,
           streak_nights = case
             when last_read_date = today                 then streak_nights
             when last_read_date = today - interval '1 day' then streak_nights + 1
             else 1
           end,
           last_read_date = today
     where id = new.parent_id;
  end if;
  return new;
end $$;

create trigger on_story_status_ready
  after update of status on public.stories
  for each row execute function public.handle_story_ready();

-- =============================================================
-- chapter_images
-- =============================================================
create table public.chapter_images (
  id              uuid primary key default gen_random_uuid(),
  story_id        uuid not null references public.stories(id) on delete cascade,
  chapter_index   int  not null check (chapter_index between 0 and 4),
  storage_path    text not null,
  public_url      text,
  prompt          text,
  created_at      timestamptz not null default now(),
  unique(story_id, chapter_index)
);
create index chapter_images_story_idx on public.chapter_images(story_id, chapter_index);
alter table public.chapter_images enable row level security;

create policy "chapter_images_owner_select" on public.chapter_images for select
  using (exists (select 1 from public.stories s where s.id = story_id and s.parent_id = auth.uid()));
-- writes happen via service-role from Inngest, so no parent-side write policy.

-- =============================================================
-- storage policies for `story-assets` bucket
-- (run AFTER bucket is created — included here for record)
-- =============================================================
-- create policy "story_assets_owner_read" on storage.objects for select
--   using (bucket_id = 'story-assets'
--          and (auth.role() = 'service_role'
--               or auth.uid()::text = (storage.foldername(name))[2]));
-- bucket layout: users/{parent_id}/stories/{story_id}/chapter-{i}.png
