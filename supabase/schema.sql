-- ============================================
-- Portfolio Site — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================

-- Owner Profile (single row per site instance)
create table if not exists owner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null default '',
  headline text default '',
  bio text default '',
  profile_image_url text default '',
  onboarding_complete boolean default false,
  last_updated_at timestamptz default now()
);

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  title text not null,
  description text default '',
  external_link text default '',
  slug text unique not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Experience
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  role text not null,
  company text not null,
  description text default '',
  start_date date,
  end_date date,
  is_current boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Stories
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  title text not null,
  content text default '',
  slug text unique not null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Media
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  url text not null,
  media_type text check (media_type in ('image', 'video')) default 'image',
  alt_text text default '',
  associated_entity_type text,
  associated_entity_id uuid,
  uploaded_at timestamptz default now()
);

-- Social Links
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  platform_name text not null,
  url text not null,
  icon_name text default 'link',
  sort_order integer default 0
);

-- Gift Messages (log of AI-generated messages)
create table if not exists gift_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  message_text text not null,
  generated_at timestamptz default now()
);

-- Page Visits (analytics)
create table if not exists page_visits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id),
  page_name text not null,
  visited_at timestamptz default now(),
  referrer text default ''
);

-- ============================================
-- Row Level Security
-- ============================================

alter table owner_profiles enable row level security;
alter table projects enable row level security;
alter table experiences enable row level security;
alter table stories enable row level security;
alter table media enable row level security;
alter table social_links enable row level security;
alter table gift_messages enable row level security;
alter table page_visits enable row level security;

-- Public read (visitors can see everything except owner_profiles email)
create policy "Public can read owner_profiles" on owner_profiles for select using (true);
create policy "Public can read projects" on projects for select using (true);
create policy "Public can read experiences" on experiences for select using (true);
create policy "Public can read stories" on stories for select using (true);
create policy "Public can read media" on media for select using (true);
create policy "Public can read social_links" on social_links for select using (true);

-- Owner write (only authenticated owner can modify)
create policy "Owner can insert own profile" on owner_profiles for insert with check (auth.uid() = user_id);
create policy "Owner can update own profile" on owner_profiles for update using (auth.uid() = user_id);

create policy "Owner can insert projects" on projects for insert with check (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);
create policy "Owner can update projects" on projects for update using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);
create policy "Owner can delete projects" on projects for delete using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);

create policy "Owner can insert experiences" on experiences for insert with check (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);
create policy "Owner can update experiences" on experiences for update using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);
create policy "Owner can delete experiences" on experiences for delete using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);

create policy "Owner can insert stories" on stories for insert with check (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);
create policy "Owner can update stories" on stories for update using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);
create policy "Owner can delete stories" on stories for delete using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);

create policy "Owner can manage media" on media for all using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);

create policy "Owner can manage social_links" on social_links for all using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);

-- Gift messages: public insert (visitors trigger), owner reads
create policy "Anyone can insert gift_messages" on gift_messages for insert with check (true);
create policy "Owner can read gift_messages" on gift_messages for select using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);

-- Page visits: public insert, owner reads
create policy "Anyone can insert page_visits" on page_visits for insert with check (true);
create policy "Owner can read page_visits" on page_visits for select using (
  owner_id in (select id from owner_profiles where user_id = auth.uid())
);

-- ============================================
-- Storage bucket for media uploads
-- ============================================
-- STEP 1: In Supabase Dashboard → Storage → New bucket
--   Name: portfolio-media
--   Public: ON (toggle must be enabled)
--
-- STEP 2: Run the SQL below in the SQL Editor to add storage policies.
--   (The bucket must exist before running these.)

create policy "Authenticated users can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media');

create policy "Authenticated users can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media');

create policy "Authenticated users can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media');

create policy "Public can view media"
  on storage.objects for select
  to public
  using (bucket_id = 'portfolio-media');

-- ============================================
-- Part 5 additions — run these in SQL Editor
-- after the initial schema is already applied
-- ============================================

-- New columns on owner_profiles
alter table owner_profiles add column if not exists personal_story text default '';
alter table owner_profiles add column if not exists contact_email_visible boolean default true;
alter table owner_profiles add column if not exists use_image_on_landing boolean default true;

-- Contact messages (submitted by visitors via /connect page)
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  sender_name text not null,
  sender_email text not null,
  message text not null,
  submitted_at timestamptz default now(),
  is_read boolean default false
);

alter table contact_messages enable row level security;

-- Drop existing policies first (makes this safe to re-run)
drop policy if exists "Anyone can submit contact" on contact_messages;
drop policy if exists "Owner can read contact" on contact_messages;
drop policy if exists "Owner can update contact" on contact_messages;

-- Anyone (visitors) can submit a contact message
create policy "Anyone can submit contact"
  on contact_messages for insert
  with check (true);

-- Only the authenticated owner can read their messages
create policy "Owner can read contact"
  on contact_messages for select
  using (owner_id in (select id from owner_profiles where user_id = auth.uid()));

-- Owner can mark messages as read
create policy "Owner can update contact"
  on contact_messages for update
  using (owner_id in (select id from owner_profiles where user_id = auth.uid()));

-- ============================================
-- Part 6 additions — run these in SQL Editor
-- after Part 5 is already applied
-- ============================================

-- Extend experiences with slug, preview text, and gallery speed
alter table experiences add column if not exists slug text unique;
alter table experiences add column if not exists preview_text text default '';
alter table experiences add column if not exists gallery_speed integer default 5;

-- Extend projects with preview text and gallery speed
alter table projects add column if not exists preview_text text default '';
alter table projects add column if not exists gallery_speed integer default 5;

-- Extend media with external link support and gallery ordering
alter table media add column if not exists source_type text check (source_type in ('upload', 'external_link')) default 'upload';
alter table media add column if not exists external_url text default '';
alter table media add column if not exists is_approved boolean default true;
alter table media add column if not exists sort_order integer default 0;

-- Story Series (groups of episodic stories, e.g. 90-day challenges)
create table if not exists story_series (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owner_profiles(id) on delete cascade,
  title text not null,
  description text default '',
  preview_text text default '',
  slug text unique not null,
  cover_image_url text default '',
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table story_series enable row level security;

drop policy if exists "Public can read story_series" on story_series;
drop policy if exists "Owner can manage story_series" on story_series;

create policy "Public can read story_series"
  on story_series for select using (true);

create policy "Owner can manage story_series"
  on story_series for all using (
    owner_id in (select id from owner_profiles where user_id = auth.uid())
  );

-- Extend stories with series/episode fields and preview text
alter table stories add column if not exists series_id uuid references story_series(id) on delete set null;
alter table stories add column if not exists episode_number integer;
alter table stories add column if not exists preview_text text default '';
