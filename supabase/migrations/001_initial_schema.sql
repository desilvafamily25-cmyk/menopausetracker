-- ============================================================
-- Menopause Symptom Tracker - Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  date_of_birth date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  has_paid boolean default false not null,
  subscription_status text default 'trial' check (subscription_status in ('trial', 'paid', 'expired')),
  stripe_customer_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz
);

-- ============================================================
-- DAILY LOGS TABLE
-- ============================================================
create table public.daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,
  -- Symptoms
  hot_flushes_count integer default 0 check (hot_flushes_count >= 0 and hot_flushes_count <= 50),
  night_sweats_count integer default 0 check (night_sweats_count >= 0 and night_sweats_count <= 20),
  sleep_quality integer check (sleep_quality >= 1 and sleep_quality <= 10),
  sleep_hours decimal(4,1) check (sleep_hours >= 0 and sleep_hours <= 12),
  mood text check (mood in ('great', 'good', 'okay', 'poor', 'terrible')),
  energy_level integer check (energy_level >= 1 and energy_level <= 10),
  brain_fog boolean default false,
  joint_pain_level integer default 0 check (joint_pain_level >= 0 and joint_pain_level <= 10),
  -- Period tracking
  period_today boolean default false,
  -- Lifestyle triggers
  alcohol_consumed boolean default false,
  caffeine_after_2pm boolean default false,
  spicy_food boolean default false,
  high_stress boolean default false,
  exercise text,
  -- Notes
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  -- One log per user per day
  unique(user_id, log_date)
);

-- ============================================================
-- TREATMENTS TABLE
-- ============================================================
create table public.treatments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  treatment_name text not null,
  dose text,
  start_date date not null,
  end_date date,
  is_active boolean default true not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- SUPPLEMENTS TABLE
-- ============================================================
create table public.supplements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  supplement_name text not null,
  dose text,
  time_of_day text,
  start_date date not null,
  is_active boolean default true not null,
  effectiveness_rating integer check (effectiveness_rating >= 1 and effectiveness_rating <= 10),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.users enable row level security;
alter table public.daily_logs enable row level security;
alter table public.treatments enable row level security;
alter table public.supplements enable row level security;

-- Users: can only read/update their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Daily logs: full CRUD for own data
create policy "Users can view own daily logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily logs"
  on public.daily_logs for delete
  using (auth.uid() = user_id);

-- Treatments: full CRUD for own data
create policy "Users can view own treatments"
  on public.treatments for select
  using (auth.uid() = user_id);

create policy "Users can insert own treatments"
  on public.treatments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own treatments"
  on public.treatments for update
  using (auth.uid() = user_id);

create policy "Users can delete own treatments"
  on public.treatments for delete
  using (auth.uid() = user_id);

-- Supplements: full CRUD for own data
create policy "Users can view own supplements"
  on public.supplements for select
  using (auth.uid() = user_id);

create policy "Users can insert own supplements"
  on public.supplements for insert
  with check (auth.uid() = user_id);

create policy "Users can update own supplements"
  on public.supplements for update
  using (auth.uid() = user_id);

create policy "Users can delete own supplements"
  on public.supplements for delete
  using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_users_updated_at
  before update on public.users
  for each row execute procedure public.update_updated_at();

create trigger update_daily_logs_updated_at
  before update on public.daily_logs
  for each row execute procedure public.update_updated_at();

create trigger update_treatments_updated_at
  before update on public.treatments
  for each row execute procedure public.update_updated_at();

create trigger update_supplements_updated_at
  before update on public.supplements
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_daily_logs_user_date on public.daily_logs(user_id, log_date desc);
create index idx_treatments_user on public.treatments(user_id, is_active);
create index idx_supplements_user on public.supplements(user_id, is_active);
