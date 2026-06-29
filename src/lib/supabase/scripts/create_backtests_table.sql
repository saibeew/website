-- Create Backtests Table
create table public.backtests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null default auth.uid(),
  
  platform text not null check (platform in ('mt4', 'mt5')),
  symbol text not null,
  timeframe text not null,
  
  config jsonb default '{}'::jsonb, -- detailed settings like dates, leverage
  metrics jsonb default '{}'::jsonb, -- results: profit, drawdown, etc.
  
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed'))
);

-- RLS
alter table public.backtests enable row level security;

create policy "Users can view their own backtests." on backtests for select using (auth.uid() = user_id);
create policy "Users can insert their own backtests." on backtests for insert with check (auth.uid() = user_id);
create policy "Users can update their own backtests." on backtests for update using (auth.uid() = user_id);
