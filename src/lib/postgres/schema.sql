-- beew.ai / Aialgo PostgreSQL schema
-- Authentication, sessions, and application data are all stored in PostgreSQL.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  name text,
  password_hash text not null
);

create unique index if not exists app_users_email_unique_idx on public.app_users (lower(email));

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  user_agent text,
  ip_address text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists user_sessions_user_idx on public.user_sessions (user_id);
create index if not exists user_sessions_expires_idx on public.user_sessions (expires_at);

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  name text not null,
  description text,
  risk text not null default 'Medium' check (risk in ('Low', 'Medium', 'High')),
  active boolean not null default false,
  roi text,
  pairs text
);

create index if not exists strategies_user_created_idx on public.strategies (user_id, created_at desc);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  symbol text not null,
  created_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create index if not exists watchlists_user_created_idx on public.watchlists (user_id, created_at asc);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  symbol text not null,
  side text not null check (side in ('BUY', 'SELL')),
  amount numeric not null,
  price numeric not null,
  time text not null,
  status text not null check (status in ('OPEN', 'CLOSED')),
  pnl numeric,
  duration integer,
  exit_price numeric,
  max_adverse numeric,
  max_favorable numeric
);

create index if not exists trades_user_created_idx on public.trades (user_id, created_at desc);

create table if not exists public.exchange_connections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  exchange text not null,
  status text not null default 'Pending' check (status in ('Active', 'Error', 'Pending')),
  keys text not null,
  latency text
);

create index if not exists exchange_connections_user_created_idx on public.exchange_connections (user_id, created_at desc);

create table if not exists public.market_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  summary text not null,
  bias text not null check (bias in ('Bullish', 'Bearish', 'Neutral', 'Slightly Bullish', 'Slightly Bearish')),
  symbol text not null,
  tags text[] not null default '{}',
  content text,
  author_id uuid references public.app_users(id) on delete set null
);

create index if not exists market_reports_created_idx on public.market_reports (created_at desc);
create index if not exists market_reports_symbol_idx on public.market_reports (symbol);

create table if not exists public.backtests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  platform text not null,
  symbol text not null,
  timeframe text not null,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  report_url text,
  result jsonb
);

create index if not exists backtests_user_created_idx on public.backtests (user_id, created_at desc);

create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  name text not null,
  platform text not null,
  symbol text not null,
  timeframe text not null,
  account_type text not null,
  lot_size numeric not null,
  max_drawdown numeric not null,
  status text not null default 'running',
  command_path text,
  config jsonb not null default '{}'::jsonb
);

create index if not exists deployments_user_created_idx on public.deployments (user_id, created_at desc);

create table if not exists public.beta_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  country text not null,
  broker text,
  account_size text not null,
  status text not null default 'pending',
  source text not null default 'landing_page'
);

create unique index if not exists beta_applications_email_unique_idx on public.beta_applications (email);
create index if not exists beta_applications_created_idx on public.beta_applications (created_at desc);

-- For databases that already had the first PostgreSQL-only schema, add auth tables first,
-- then keep existing app rows. Add foreign-key constraints manually after mapping old user IDs.
