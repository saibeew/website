-- Unified Aialgo Database Schema

-- 1. Profiles Table (Extends Auth.Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  updated_at timestamp with time zone default now()
);

-- 2. Strategies Table
create table public.strategies (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  risk text default 'Medium' check (risk in ('Low', 'Medium', 'High')), 
  active boolean default false,
  user_id uuid references auth.users default auth.uid()
);

-- 3. Market Reports (AI Intelligence)
create table public.market_reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  summary text not null,
  bias text not null check (bias in ('Bullish', 'Bearish', 'Neutral', 'Slightly Bullish', 'Slightly Bearish')),
  symbol text not null,
  tags text[] default '{}',
  content text,
  author_id uuid references auth.users(id) default auth.uid()
);

-- 4. Watchlists Table
create table public.watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  symbol text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, symbol)
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.strategies enable row level security;
alter table public.market_reports enable row level security;
alter table public.watchlists enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

-- Policies for Strategies
create policy "Users can see their own strategies." on strategies for select using (auth.uid() = user_id);
create policy "Users can insert their own strategies." on strategies for insert with check (auth.uid() = user_id);
create policy "Users can update their own strategies." on strategies for update using (auth.uid() = user_id);
create policy "Users can delete their own strategies." on strategies for delete using (auth.uid() = user_id);

-- Policies for Market Reports
create policy "Reports are viewable by everyone." on market_reports for select using (true);
create policy "Users can insert their own reports." on market_reports for insert with check (auth.uid() = author_id);

-- Policies for Watchlists
create policy "Users can view their own watchlist." on watchlists for select using (auth.uid() = user_id);
create policy "Users can insert into their own watchlist." on watchlists for insert with check (auth.uid() = user_id);
create policy "Users can delete from their own watchlist." on watchlists for delete using (auth.uid() = user_id);
