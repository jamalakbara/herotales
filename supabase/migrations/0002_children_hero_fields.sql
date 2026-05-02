alter table public.children
  add column if not exists avatar_idx     smallint not null default 0,
  add column if not exists narrator_voice text     not null default 'Juniper',
  add column if not exists growth_traits  text[]   not null default '{}',
  add column if not exists quirk          text,
  add column if not exists skip_scary     boolean  not null default true,
  add column if not exists short_stories  boolean  not null default true,
  add column if not exists use_real_name  boolean  not null default true;
