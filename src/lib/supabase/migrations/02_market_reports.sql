-- Create a table for Daily Market Reports
create table public.market_reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  summary text not null,
  bias text not null check (bias in ('Bullish', 'Bearish', 'Neutral', 'Slightly Bullish', 'Slightly Bearish')),
  symbol text not null,
  tags text[] default '{}',
  content text, -- Full content (markdown support)
  author_id uuid references auth.users(id)
);

-- Enable RLS
alter table public.market_reports enable row level security;

-- Policy: Everyone can read reports
create policy "Public reports are viewable by everyone"
  on public.market_reports for select
  using ( true );

-- Policy: Only authenticated users can insert (Simulating Admin for now)
create policy "Users can insert reports"
  on public.market_reports for insert
  with check ( auth.role() = 'authenticated' );
