-- ============================================================
-- QuickQuotesUSA — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  role          text not null check (role in ('homeowner', 'contractor')),
  full_name     text not null,
  location      text,
  phone         text,
  avatar_url    text,
  bio           text,
  company_name  text,
  trade         text,
  license_no    text,
  is_insured    boolean default false,
  rating        numeric(3,2) default 0,
  review_count  int default 0,
  jobs_completed int default 0,
  plan          text check (plan in ('starter','pro','unlimited')) default 'starter',
  bids_used     int default 0,
  bids_limit    int default 10,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── JOB POSTS ───────────────────────────────────────────────
create table public.jobs (
  id            uuid default uuid_generate_v4() primary key,
  owner_id      uuid references public.profiles(id) on delete cascade not null,
  title         text not null,
  description   text not null,
  trade         text not null,
  location      text not null,
  budget_min    numeric(10,2),
  budget_max    numeric(10,2),
  area_size     text,
  status        text not null check (status in ('open','in_progress','completed','cancelled')) default 'open',
  bid_count     int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── JOB PHOTOS ──────────────────────────────────────────────
create table public.job_photos (
  id       uuid default uuid_generate_v4() primary key,
  job_id   uuid references public.jobs(id) on delete cascade not null,
  url      text not null,
  order_index int default 0,
  created_at timestamptz default now()
);

-- ── BIDS ────────────────────────────────────────────────────
create table public.bids (
  id            uuid default uuid_generate_v4() primary key,
  job_id        uuid references public.jobs(id) on delete cascade not null,
  contractor_id uuid references public.profiles(id) on delete cascade not null,
  amount        numeric(10,2) not null,
  timeline      text,
  message       text,
  status        text not null check (status in ('pending','accepted','declined','withdrawn')) default 'pending',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(job_id, contractor_id)
);

-- ── PORTFOLIO PHOTOS (contractors) ──────────────────────────
create table public.portfolio_photos (
  id            uuid default uuid_generate_v4() primary key,
  contractor_id uuid references public.profiles(id) on delete cascade not null,
  url           text not null,
  caption       text,
  order_index   int default 0,
  created_at    timestamptz default now()
);

-- ── REVIEWS ─────────────────────────────────────────────────
create table public.reviews (
  id            uuid default uuid_generate_v4() primary key,
  job_id        uuid references public.jobs(id) on delete cascade not null,
  reviewer_id   uuid references public.profiles(id) on delete cascade not null,
  contractor_id uuid references public.profiles(id) on delete cascade not null,
  rating        int not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz default now(),
  unique(job_id, reviewer_id)
);

-- ── STORAGE BUCKETS ─────────────────────────────────────────
insert into storage.buckets (id, name, public) values
  ('job-photos', 'job-photos', true),
  ('avatars',    'avatars',    true),
  ('portfolio',  'portfolio',  true)
on conflict do nothing;

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.jobs            enable row level security;
alter table public.job_photos      enable row level security;
alter table public.bids            enable row level security;
alter table public.portfolio_photos enable row level security;
alter table public.reviews         enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create policy "jobs_select" on public.jobs for select using (true);
create policy "jobs_insert" on public.jobs for insert with check (auth.uid() = owner_id);
create policy "jobs_update" on public.jobs for update using (auth.uid() = owner_id);

create policy "job_photos_select" on public.job_photos for select using (true);
create policy "job_photos_insert" on public.job_photos for insert
  with check (auth.uid() = (select owner_id from public.jobs where id = job_id));

create policy "bids_select" on public.bids for select
  using (
    auth.uid() = contractor_id or
    auth.uid() = (select owner_id from public.jobs where id = job_id)
  );
create policy "bids_insert" on public.bids for insert with check (auth.uid() = contractor_id);
create policy "bids_update" on public.bids for update
  using (
    auth.uid() = contractor_id or
    auth.uid() = (select owner_id from public.jobs where id = job_id)
  );

create policy "portfolio_select" on public.portfolio_photos for select using (true);
create policy "portfolio_insert" on public.portfolio_photos for insert with check (auth.uid() = contractor_id);
create policy "portfolio_delete" on public.portfolio_photos for delete using (auth.uid() = contractor_id);

create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (auth.uid() = reviewer_id);

create policy "job_photos_storage_select" on storage.objects for select using (bucket_id = 'job-photos');
create policy "job_photos_storage_insert" on storage.objects for insert
  with check (bucket_id = 'job-photos' and auth.role() = 'authenticated');

create policy "avatars_storage_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_storage_insert" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "portfolio_storage_select" on storage.objects for select using (bucket_id = 'portfolio');
create policy "portfolio_storage_insert" on storage.objects for insert
  with check (bucket_id = 'portfolio' and auth.role() = 'authenticated');

-- ── AUTO-UPDATE TIMESTAMPS ───────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function update_updated_at();
create trigger trg_jobs_updated before update on public.jobs
  for each row execute function update_updated_at();
create trigger trg_bids_updated before update on public.bids
  for each row execute function update_updated_at();

-- ── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'homeowner')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── BID COUNT TRIGGER ────────────────────────────────────────
create or replace function update_bid_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.jobs set bid_count = bid_count + 1 where id = new.job_id;
  elsif TG_OP = 'DELETE' then
    update public.jobs set bid_count = bid_count - 1 where id = old.job_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trg_bid_count after insert or delete on public.bids
  for each row execute function update_bid_count();

-- ── RATING RECALC TRIGGER ────────────────────────────────────
create or replace function recalc_contractor_rating()
returns trigger as $$
begin
  update public.profiles set
    rating = (select avg(rating) from public.reviews where contractor_id = new.contractor_id),
    review_count = (select count(*) from public.reviews where contractor_id = new.contractor_id)
  where id = new.contractor_id;
  return null;
end;
$$ language plpgsql;

create trigger trg_recalc_rating after insert on public.reviews
  for each row execute function recalc_contractor_rating();
