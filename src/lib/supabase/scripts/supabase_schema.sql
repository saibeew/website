-- Profiles Table
create table public.profiles (
  id uuid references auth.users not null,
  email text,
  name text,
  primary key (id)
);

-- Strategies Table
create table public.strategies (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  risk text default 'Medium', 
  active boolean default false,
  user_id uuid references auth.users default auth.uid()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.strategies enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can see their own strategies."
  on strategies for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own strategies."
  on strategies for insert
  with check ( auth.uid() = user_id );
