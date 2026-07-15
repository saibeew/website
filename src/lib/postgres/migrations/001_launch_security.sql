alter table public.app_users add column if not exists email_verified_at timestamptz;

-- Accounts created before verification existed are grandfathered in.
update public.app_users set email_verified_at = coalesce(email_verified_at, created_at);

create table if not exists public.auth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  purpose text not null check (purpose in ('email_verification', 'password_reset')),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists auth_tokens_user_purpose_idx on public.auth_tokens (user_id, purpose, created_at desc);
create index if not exists auth_tokens_expires_idx on public.auth_tokens (expires_at);

create table if not exists public.security_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete set null,
  event text not null,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_audit_events_user_created_idx on public.security_audit_events (user_id, created_at desc);
