-- VOLTA — Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  generations_today integer not null default 0,
  last_reset date not null default current_date,
  stripe_customer_id text,
  stripe_subscription_id text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generations history
create table if not exists public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prompt text not null,
  html text not null,
  created_at timestamptz not null default now()
);

-- Index for fast user lookups
create index if not exists generations_user_id_idx on public.generations(user_id);
create index if not exists generations_created_at_idx on public.generations(created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Increment generation count (atomic)
create or replace function public.increment_generations(user_id uuid)
returns void as $$
begin
  update public.profiles
  set generations_today = generations_today + 1,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.generations enable row level security;

-- Profiles: users can read their own
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Profiles: service role can update (for billing webhooks)
create policy "Service role can update profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- Generations: users can read own
create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

-- Generations: users can insert own
create policy "Users can create generations"
  on public.generations for insert
  with check (auth.uid() = user_id);
