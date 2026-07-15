alter table public.deployments add column if not exists worker_id text;
alter table public.deployments add column if not exists worker_claimed_at timestamptz;
alter table public.deployments add column if not exists result jsonb;
alter table public.backtests add column if not exists worker_id text;
alter table public.backtests add column if not exists worker_claimed_at timestamptz;

create index if not exists deployments_worker_queue_idx on public.deployments (status, created_at);
create index if not exists backtests_worker_queue_idx on public.backtests (status, created_at);
